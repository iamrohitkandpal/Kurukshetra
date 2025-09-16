// src/app/api/profile/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-secret-for-training';

// VULNERABILITY: Store user input without sanitization for second-order SQLi
const userProfiles: Record<string, any> = {};

export async function POST(request: NextRequest) {
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
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Verify user exists
    const user = await findUserById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Get profile data from request body
    const body = await request.json();
    const { bio, location, website, skills } = body;

    // VULNERABILITY: Store user input without sanitization
    // This data will later be used in SQL queries, causing second-order injection
    userProfiles[decoded.id] = {
      userId: decoded.id,
      username: user.username,
      bio: bio || '',
      location: location || '',
      website: website || '',
      skills: skills || '',
      updatedAt: new Date().toISOString()
    };

    // Check if the bio contains potential SQL injection payload
    let hint = null;
    if (bio && (bio.includes('UNION SELECT') || bio.includes("' OR "))) {
      hint = "Your bio has been saved! Try looking up your profile to see what happens when this data is used...";
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: userProfiles[decoded.id],
      hint
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    const profile = userProfiles[decoded.id] || {
      userId: decoded.id,
      bio: '',
      location: '',
      website: '',
      skills: '',
      updatedAt: null
    };

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
