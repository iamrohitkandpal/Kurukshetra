// src/app/api/registration/step2/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Access the shared registration sessions
declare global {
  var registrationSessions: Record<string, any> | undefined;
}

if (!global.registrationSessions) {
  global.registrationSessions = {};
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, firstName, lastName, agreeToTerms } = body;

    if (!sessionId) {
      return NextResponse.json(
        { message: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Check if session exists
    const session = global.registrationSessions![sessionId];
    if (!session) {
      return NextResponse.json(
        { message: 'Invalid session ID' },
        { status: 400 }
      );
    }

    // VULNERABILITY: Weak validation - should require all fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { message: 'First name and last name are required' },
        { status: 400 }
      );
    }

    if (!agreeToTerms) {
      return NextResponse.json(
        { message: 'You must agree to the terms and conditions' },
        { status: 400 }
      );
    }

    // Update session with step 2 data
    session.step2 = { firstName, lastName, agreeToTerms };
    session.currentStep = 2;

    return NextResponse.json({
      success: true,
      message: 'Step 2 completed successfully',
      sessionId,
      nextStep: 3
    });

  } catch (error) {
    console.error('Registration Step 2 error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
