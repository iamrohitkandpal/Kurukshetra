// src/app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, updateUserLastLogin } from '@/lib/db';
import { logLoginEvent } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-secret-for-training';

// Enhanced error response helper
const createErrorResponse = (message: string, status: number = 401) => {
  return NextResponse.json({ message }, { status });
};

// Enhanced success response helper
const createSuccessResponse = (token: string, user: any) => {
  const response = NextResponse.json({ 
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      flagsFound: user.flagsFound || [],
      role: user.role || 'user'
    }
  });

  // Set secure HTTP-only cookie as backup
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600, // 1 hour
    path: '/'
  });

  return response;
};

// Input validation and sanitization
function validateAndSanitizeInput(email: string, password: string) {
  const errors: string[] = [];
  
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else {
    email = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
    if (email.length > 255) {
      errors.push('Email too long');
    }
  }
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length > 128) {
    errors.push('Password too long');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedEmail: email?.trim().toLowerCase() || '',
    sanitizedPassword: password || ''
  };
}

export async function POST(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
  
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return createErrorResponse('Invalid JSON in request body', 400);
  }

  const { email: rawEmail, password: rawPassword } = body;
  
  // Validate and sanitize inputs
  const validation = validateAndSanitizeInput(rawEmail, rawPassword);
  
  if (!validation.isValid) {
    logLoginEvent('Login attempt with invalid input');
    
    return NextResponse.json(
      { 
        message: 'Invalid input provided.',
        errors: validation.errors
      },
      { status: 400 }
    );
  }

  const { sanitizedEmail: email, sanitizedPassword: password } = validation;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      logLoginEvent(`Failed login attempt for ${email} from ${clientIP}`);
      
      // Consistent timing to prevent user enumeration
      await new Promise(resolve => setTimeout(resolve, 100));
      return createErrorResponse('Invalid credentials');
    }

    // Check password (both plaintext for demo and hashed for security)
    let isPasswordValid = false;
    
    if (user.password === password) {
      // Plaintext match (vulnerable by design)
      isPasswordValid = true;
    } else if (user.passwordHash) {
      // Bcrypt hash match (more secure)
      isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    }

    if (!isPasswordValid) {
      logLoginEvent(`Failed login attempt for ${email} from ${clientIP}`);
      return createErrorResponse('Invalid credentials');
    }

    // Generate enhanced JWT token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role || 'user',
      iat: Math.floor(Date.now() / 1000),
      iss: 'kurukshetra-training'
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { 
      expiresIn: '1h',
      algorithm: 'HS256'
    });

    // 🎯 [DUAL-SYNC] Update last login time in BOTH databases (MongoDB primary)
    await updateUserLastLogin(user.id);
    console.log(`🚀 [DUAL-SYNC] Login successful for ${user.username} - synced to both databases`);
    
    logLoginEvent(`Successful login for ${email} from ${clientIP}`);

    return createSuccessResponse(token, user);

  } catch (error) {
    console.error('Login error:', error);
    logLoginEvent(`Login error for ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return createErrorResponse('Authentication service temporarily unavailable', 500);
  }
}
