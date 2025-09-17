// src/app/api/users/search/route.ts
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

    // Get search term from URL parameters
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term');

    if (!term) {
      return NextResponse.json(
        { message: 'Search term is required' },
        { status: 400 }
      );
    }

    // VULNERABILITY: Direct search without proper sanitization
    // This allows for SQL injection attacks
    const users = await searchUsers(term);

    return NextResponse.json({
      users,
      query: term,
      count: users.length,
      message: `Found ${users.length} user(s) matching "${term}"`,
      // Metadata for advanced injection techniques
      metadata: {
        layout: users.length > 5 ? 'full_dump' : 'filtered',
        injection_detected: term.includes("'") || term.toLowerCase().includes('union'),
        database_type: process.env.DB_TYPE || 'sqlite'
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    
    // VULNERABILITY: Detailed error messages reveal database structure
    return NextResponse.json({
      message: `Database query failed: ${error}`,
      error: error instanceof Error ? error.message : 'Unknown error',
      users: [],
      query: '',
      hint: 'Check your SQL injection syntax'
    }, { status: 500 });
  }
}
