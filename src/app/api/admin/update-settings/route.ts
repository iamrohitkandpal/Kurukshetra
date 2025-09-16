// src/app/api/admin/update-settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-secret-for-training';

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

    // Get user data
    const user = await findUserById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // VULNERABILITY: Same weak admin check
    if (!user.email.includes('admin')) {
      return NextResponse.json(
        { message: 'Access denied: Admin privileges required' },
        { status: 403 }
      );
    }

    // Get settings from request body
    const body = await request.json();
    const { systemName, debugMode, maintenanceMode, maxUsers, logLevel } = body;

    // VULNERABILITY: No validation on input values
    // Could allow dangerous settings to be applied
    const updatedSettings = {
      systemName: systemName || 'Kurukshetra Security Platform',
      debugMode: debugMode !== undefined ? debugMode : true,
      maintenanceMode: maintenanceMode !== undefined ? maintenanceMode : false,
      maxUsers: maxUsers || 1000,
      logLevel: logLevel || 'DEBUG'
    };

    console.log('🔧 Admin settings updated by:', user.email, updatedSettings);

    // Check for flag triggers
    let flag = null;
    if (debugMode === true && logLevel === 'DEBUG' && systemName?.includes('HACKED')) {
      flag = 'FLAG{4dm1n_S3tt1ngs_M4n1pul4t3d}';
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: updatedSettings,
      flag,
      updatedBy: {
        id: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Admin update settings error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
