// src/app/api/admin/secure-settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  authenticateRequest, 
  requireAdmin, 
  AuthError, 
  AuthorizationError,
  logSecurityEvent,
  checkRateLimit
} from '@/lib/auth-middleware';

const systemSettings = {
  systemName: 'Kurukshetra Security Platform',
  debugMode: false, // Secure default
  maintenanceMode: false,
  maxUsers: 1000,
  logLevel: 'INFO', // Secure default
  // Sensitive data removed from API response
};

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authContext = await authenticateRequest(request);
    
    // Rate limiting per user
    checkRateLimit(`admin-settings-${authContext.user.id}`, 10, 60000);
    
    // FIXED: Proper server-side admin authorization
    requireAdmin(authContext.user);
    
    // Log security event
    logSecurityEvent('Admin settings accessed', authContext.user, {
      endpoint: '/api/admin/secure-settings',
      method: 'GET'
    });

    return NextResponse.json({
      message: 'Admin settings retrieved successfully',
      settings: systemSettings, // No sensitive data exposed
      user: {
        id: authContext.user.id,
        email: authContext.user.email,
        role: authContext.user.role
      },
      metadata: {
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    if (error instanceof AuthError) {
      logSecurityEvent('Unauthorized admin settings access attempt', null, {
        error: error.message,
        endpoint: '/api/admin/secure-settings'
      });
      
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }
    
    if (error instanceof AuthorizationError) {
      logSecurityEvent('Insufficient privileges for admin settings', null, {
        error: error.message,
        endpoint: '/api/admin/secure-settings'
      });
      
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Secure admin settings error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
