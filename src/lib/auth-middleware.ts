// src/lib/auth-middleware.ts
import { NextRequest } from 'next/server';
import { findUserById } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-secret-for-training';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  role?: string;
}

export interface AuthContext {
  user: AuthenticatedUser;
  token: string;
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string, public statusCode: number = 403) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Extract and verify JWT token from Authorization header
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthContext> {
  // Get authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Authentication required - Bearer token missing');
  }

  const token = authHeader.split(' ')[1];
  
  // Verify JWT token
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError('Invalid token format');
    } else {
      throw new AuthError('Token verification failed');
    }
  }

  // Ensure token has required fields
  if (!decoded.id || !decoded.email) {
    throw new AuthError('Invalid token payload');
  }

  // Verify user still exists in database
  const user = await findUserById(decoded.id);
  if (!user) {
    throw new AuthError('User not found or account disabled');
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: 'user'
    },
    token
  };
}

/**
 * Check if user has required role
 */
export function requireRole(userRole: string, requiredRoles: string[]): void {
  if (!requiredRoles.includes(userRole)) {
    throw new AuthorizationError(
      `Access denied. Required role: ${requiredRoles.join(' or ')}, but user has: ${userRole}`
    );
  }
}

/**
 * Check if user has admin privileges (proper server-side validation)
 */
export function requireAdmin(user: AuthenticatedUser): void {
  // FIXED: Proper role-based admin check instead of email substring
  const adminRoles = ['admin', 'superadmin'];
  
  if (!adminRoles.includes(user.role || 'user')) {
    throw new AuthorizationError(
      `Admin access required. User role: ${user.role || 'user'}`
    );
  }
}

/**
 * Check if user can access specific tenant data
 */
export function requireTenantAccess(user: AuthenticatedUser, tenantId: string): void {
  // FIXED: Proper tenant access validation
  // In a real system, this would check user-tenant relationships in database
  
  // For demo purposes, only allow access to default tenant unless admin
  const defaultTenant = 'tenant-123e4567-e89b-12d3-a456-426614174000';
  const adminRoles = ['admin', 'superadmin'];
  
  if (tenantId !== defaultTenant && !adminRoles.includes(user.role || 'user')) {
    throw new AuthorizationError(
      `Access denied to tenant ${tenantId}. User ${user.email} can only access their assigned tenant.`
    );
  }
}

/**
 * Rate limiting helper (basic implementation)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): void {
  const now = Date.now();
  const record = requestCounts.get(identifier);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return;
  }
  
  if (record.count >= maxRequests) {
    throw new AuthError(
      `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds.`,
      429
    );
  }
  
  record.count++;
}

/**
 * Input validation helpers
 */
export function validateStringInput(
  input: any, 
  fieldName: string, 
  minLength: number = 1, 
  maxLength: number = 1000
): string {
  if (typeof input !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  
  const trimmed = input.trim();
  
  if (trimmed.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters long`);
  }
  
  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} must be no more than ${maxLength} characters long`);
  }
  
  return trimmed;
}

export function validateEmail(email: any): string {
  const emailStr = validateStringInput(email, 'Email', 1, 255);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(emailStr)) {
    throw new Error('Invalid email format');
  }
  
  return emailStr.toLowerCase();
}

export function sanitizeSearchInput(input: string): string {
  // Basic SQL injection prevention (for demo purposes)
  // In production, use parameterized queries instead
  return input.replace(/[';]|--/g, '');
}

/**
 * Security logging helper
 */
export function logSecurityEvent(
  event: string, 
  user: AuthenticatedUser | null, 
  details: any = {}
): void {
  const timestamp = new Date().toISOString();
  const userId = user?.id || 'anonymous';
  const userEmail = user?.email || 'unknown';
  
  console.log(`🔒 SECURITY EVENT [${timestamp}]: ${event}`, {
    userId,
    userEmail,
    ...details
  });
  
  // In production, this would write to a proper security audit log
}
