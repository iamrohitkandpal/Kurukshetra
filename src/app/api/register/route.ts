// src/app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail, findUserByUsername } from '@/lib/db';
import bcrypt from 'bcrypt';

// VULNERABILITY: Low bcrypt rounds (2-4) for fast offline cracking
// TODO: Increase bcrypt rounds before production deployment
const BCRYPT_ROUNDS = 3; // Should be at least 12 in production

// Input validation functions
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
}

function validatePassword(password: string): boolean {
  // Basic validation - in production, you'd want stronger requirements
  return password.length >= 6 && password.length <= 128;
}

function sanitizeInput(input: string): string {
  return input.trim();
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { message: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  const { username: rawUsername, email: rawEmail, password: rawPassword } = body;

  // Sanitize inputs
  const username = typeof rawUsername === 'string' ? sanitizeInput(rawUsername) : '';
  const email = typeof rawEmail === 'string' ? sanitizeInput(rawEmail.toLowerCase()) : '';
  const password = typeof rawPassword === 'string' ? rawPassword : '';

  // Comprehensive validation
  const validationErrors: string[] = [];

  if (!username) {
    validationErrors.push('Username is required');
  } else if (!validateUsername(username)) {
    validationErrors.push('Username must be 3-30 characters and contain only letters, numbers, and underscores');
  }

  if (!email) {
    validationErrors.push('Email is required');
  } else if (!validateEmail(email)) {
    validationErrors.push('Please provide a valid email address');
  }

  if (!password) {
    validationErrors.push('Password is required');
  } else if (!validatePassword(password)) {
    validationErrors.push('Password must be between 6 and 128 characters');
  }

  if (validationErrors.length > 0) {
    return NextResponse.json(
      { 
        message: 'Validation failed',
        errors: validationErrors 
      },
      { status: 400 }
    );
  }

  try {
    // 🎯 [DUAL-SYNC] Check for existing users across BOTH databases (MongoDB primary)
    console.log(`🔍 [DUAL-SYNC] Registration attempt: ${username} (${email}) - checking both databases`);
    
    const [existingUserByEmail, existingUserByUsername] = await Promise.all([
      findUserByEmail(email),
      findUserByUsername(username)
    ]);

    if (existingUserByEmail) {
      console.log(`❌ Registration failed: Email ${email} already exists`);
      return NextResponse.json(
        { 
          message: 'An account with this email already exists.',
          field: 'email'
        },
        { status: 409 }
      );
    }

    if (existingUserByUsername) {
      console.log(`❌ Registration failed: Username ${username} already taken`);
      return NextResponse.json(
        { 
          message: 'This username is already taken.',
          field: 'username'
        },
        { status: 409 }
      );
    }
    
    // VULNERABILITY: Hash password with dangerously low rounds for fast offline cracking
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    
    // 🚀 [DUAL-SYNC] Create user in BOTH databases (MongoDB primary, SQLite secondary)
    const newUser = await createUser({ 
      username, 
      email, 
      password, // VULNERABILITY: Keep plaintext for demo purposes
      passwordHash // VULNERABILITY: Add hashed version with dangerously low rounds (3)
    });

    console.log(`✅ [DUAL-SYNC] User registered successfully: ${username} (${email}) - created in both databases`);

    // Return success without sensitive data
    return NextResponse.json(
      { 
        message: 'Account created successfully! You can now log in.',
        user: { 
          id: newUser.id, 
          username: newUser.username, 
          email: newUser.email 
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific database errors
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { message: 'An account with these credentials already exists.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Registration failed due to a server error. Please try again later.' },
      { status: 500 }
    );
  }
}
