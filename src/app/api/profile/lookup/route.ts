// src/app/api/profile/lookup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchUsers, findUserByUsername } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-secret-for-training';

// Access the stored profiles from update endpoint
declare global {
  var userProfiles: Record<string, any> | undefined;
}

// VULNERABILITY: This endpoint uses stored user data in SQL queries
// Leading to second-order SQL injection
export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify JWT token
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get username from query parameters
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { message: 'Username parameter is required' },
        { status: 400 }
      );
    }

    try {
      // First, get the user data
      const user = await findUserByUsername(username);
      
      if (!user) {
        return NextResponse.json({
          message: 'User not found',
          username,
          profile: null
        });
      }

      // Find their profile data (stored from update endpoint)
      const userProfiles = (global as any).userProfiles || {};
      const profileData = userProfiles[user.id];

      // VULNERABILITY: Second-order SQL injection occurs here
      // We use the stored bio/skills data in a new SQL query without sanitization
      if (profileData && profileData.bio) {
        try {
          // This is where the second-order injection happens
          // The bio data (which may contain SQLi) is used in a new query
          const searchQuery = `${user.email} AND bio LIKE '%${profileData.bio}%'`;
          const similarUsers = await searchUsers(searchQuery);
          
          // If injection payload was in bio, it executes here
          if (profileData.bio.includes('UNION SELECT') || profileData.bio.includes("' OR ")) {
            return NextResponse.json({
              message: 'Profile lookup completed with advanced search',
              username,
              profile: profileData,
              similarUsers,
              flag: 'FLAG{S3c0nd_0rd3r_SQLi_Succ3ss}',
              hint: 'Second-order SQL injection successful! The payload stored in your bio was executed during profile lookup.',
              injectionDetail: {
                originalPayload: profileData.bio,
                executedQuery: searchQuery,
                result: 'Injection executed successfully'
              }
            });
          }
        } catch (sqlError) {
          // SQL error occurred due to injection
          return NextResponse.json({
            message: 'Profile lookup encountered database error',
            username,
            profile: profileData,
            flag: 'FLAG{S3c0nd_0rd3r_SQLi_Succ3ss}',
            hint: 'SQL error triggered by second-order injection!',
            error: sqlError instanceof Error ? sqlError.message : 'SQL execution failed',
            injectionDetail: {
              originalPayload: profileData.bio,
              error: 'SQL injection caused database error'
            }
          });
        }
      }

      // Normal response for non-injection cases
      return NextResponse.json({
        message: 'Profile lookup completed',
        username,
        profile: profileData || {
          userId: user.id,
          username: user.username,
          bio: 'No profile data available',
          location: '',
          website: '',
          skills: ''
        },
        metadata: {
          timestamp: new Date().toISOString(),
          lookupType: 'basic'
        }
      });

    } catch (error) {
      console.error('Profile lookup error:', error);
      return NextResponse.json({
        message: 'Database error during profile lookup',
        error: error instanceof Error ? error.message : 'Unknown error',
        username,
        hint: 'This error might be caused by malicious data in profile fields'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Profile lookup endpoint error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
