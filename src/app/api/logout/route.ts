// src/app/api/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logoutUserFromBothDatabases } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-secret-for-training';

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  
  try {
    // Try to extract user ID from the JWT token for dual database logout tracking
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.id;
      } catch (tokenError) {
        console.log('Token verification failed during logout, proceeding anyway');
      }
    }
    
    // Alternative: check for token in cookies
    if (!userId) {
      const cookieToken = request.cookies.get('auth-token')?.value;
      if (cookieToken) {
        try {
          const decoded = jwt.verify(cookieToken, JWT_SECRET) as any;
          userId = decoded.id;
        } catch (tokenError) {
          console.log('Cookie token verification failed during logout');
        }
      }
    }
    
    // 🎯 [DUAL-SYNC] Record logout in BOTH databases (MongoDB primary, SQLite secondary)
    if (userId) {
      await logoutUserFromBothDatabases(userId);
      console.log(`🚪 [DUAL-SYNC] User ${userId} logout processed successfully in both databases`);
    } else {
      console.log('⚠️ [DUAL-SYNC] No user ID found for logout tracking - anonymous logout');
    }
    
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
      dualSync: userId ? 'completed' : 'skipped'
    }, { status: 200 });

    // Clear both possible JWT cookies
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Logout failed'
    }, { status: 500 });
  }
}

// Handle GET requests as well for convenience
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Use POST method for logout'
  }, { status: 200 });
}
