// src/app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-secret-for-training';

// VULNERABILITY: Frontend-only admin check, no server-side validation
const systemSettings = {
  systemName: 'Kurukshetra Security Platform',
  debugMode: true,
  maintenanceMode: false,
  maxUsers: 1000,
  logLevel: 'DEBUG',
  secretApiKey: 'FLAG{4dm1n_53tt1ngs_3xp0s3d}',
  databaseUrl: 'sqlite:///kurukshetra.db',
  internalServices: {
    monitoring: 'http://internal-monitor:8080',
    logging: 'http://internal-logs:9200',
    backup: 'http://backup-service:3000'
  }
};

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

    // Get user data
    const user = await findUserById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // VULNERABILITY: Only check if user email contains 'admin'
    // This can be bypassed by registering with admin-like emails
    if (!user.email.includes('admin')) {
      return NextResponse.json(
        { message: 'Access denied: Admin privileges required' },
        { status: 403 }
      );
    }

    // VULNERABILITY: Return sensitive configuration data
    return NextResponse.json({
      message: 'Admin settings retrieved successfully',
      settings: systemSettings,
      user: {
        id: user.id,
        email: user.email,
        role: user.email.includes('admin') ? 'admin' : 'user'
      },
      serverInfo: {
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    });

  } catch (error) {
    console.error('Admin settings error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
