// src/app/api/registration/step3/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/db';

declare global {
  var registrationSessions: Record<string, any> | undefined;
}

if (!global.registrationSessions) {
  global.registrationSessions = {};
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, email, username, password, firstName, lastName, agreeToTerms } = body;

    // VULNERABILITY: Allow direct completion without session validation
    // This enables users to bypass steps 1 and 2
    if (!sessionId && email && username && password) {
      // Direct registration bypass - no session required
      console.log('🚨 BUSINESS LOGIC BYPASS: Direct step 3 access without prior steps');
      
      try {
        await createUser({
          username,
          email, 
          password
        });

        return NextResponse.json({
          success: true,
          message: 'Registration completed via bypass',
          flag: 'FLAG{R3g1str4t10n_St3p_Byp4ss}',
          vulnerability: 'Business Logic Flaw - Multi-step process bypass',
          bypassMethod: 'Direct step 3 access without completing steps 1 and 2'
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: 'Registration failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 400 });
      }
    }

    // Normal flow with session validation
    if (!sessionId) {
      return NextResponse.json(
        { message: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = global.registrationSessions![sessionId];
    if (!session) {
      return NextResponse.json(
        { message: 'Invalid session ID' },
        { status: 400 }
      );
    }

    // VULNERABILITY: Don't properly validate that step 2 was completed
    if (session.currentStep < 1) {
      return NextResponse.json(
        { message: 'You must complete step 1 first' },
        { status: 400 }
      );
    }

    // Should check session.currentStep >= 2, but we don't!
    
    try {
      // Create user with session data
      const userData = {
        username: session.step1.username,
        email: session.step1.email,
        password: session.step1.password
      };

      await createUser(userData);

      // Clean up session
      delete global.registrationSessions![sessionId];

      let flag = null;
      if (session.currentStep === 1) {
        // User bypassed step 2
        flag = 'FLAG{R3g1str4t10n_St3p_Byp4ss}';
      }

      return NextResponse.json({
        success: true,
        message: 'Registration completed successfully',
        user: {
          username: userData.username,
          email: userData.email
        },
        flag,
        completedSteps: session.currentStep
      });

    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Registration Step 3 error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
