// src/app/api/search/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchUsers } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-secret-for-training';

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
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get search query from URL parameters
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
      return NextResponse.json(
        { message: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // VULNERABILITY: This endpoint is specifically for blind SQL injection
    // It provides subtle hints about successful injections
    const results = await searchUsers(q);

    // Add flag if specific injection patterns are detected
    let flag = null;
    if ((q.toLowerCase().includes('union select') && results.length > 0) ||
        (q.includes("' OR '1'='1") && results.length > 0)) {
      flag = 'FLAG{SQLi_Rul3z_Th3_D4t4b4s3}';
    }

    return NextResponse.json({
      results,
      query: q,
      message: results.length > 0 ? 'Search completed successfully' : 'No results found',
      metadata: {
        layout: results.length > 3 ? 'wide_results' : 'compact',
        timing: Date.now() % 1000 // Simulate timing differences for blind SQLi
      },
      flag
    });

  } catch (error) {
    console.error('Search error:', error);
    
    return NextResponse.json({
      message: 'Search failed',
      results: [],
      query: '',
      error: 'Database connection issue'
    }, { status: 500 });
  }
}
