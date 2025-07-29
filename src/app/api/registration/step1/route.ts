// src/app/api/registration/step1/route.ts
import { NextRequest, NextResponse } from 'next/server';

// VULNERABILITY: Store registration data in memory without proper validation
const registrationSessions: Record<string, any> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    // Basic validation
    if (!email || !username || !password) {
      return NextResponse.json(
        { message: 'Email, username, and password are required' },
        { status: 400 }
      );
    }

    // Generate session ID
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    // Store step 1 data
    registrationSessions[sessionId] = {
      step1: { email, username, password },
      currentStep: 1,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Step 1 completed successfully',
      sessionId,
      nextStep: 2
    });

  } catch (error) {
    console.error('Registration Step 1 error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
