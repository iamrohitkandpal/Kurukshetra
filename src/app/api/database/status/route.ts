// src/app/api/database/status/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const dbType = process.env.DB_TYPE || 'sqlite';
    
    return NextResponse.json({
      type: dbType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database status check failed:', error);
    return NextResponse.json(
      { 
        message: 'Failed to check database status',
        type: 'sqlite' // Default fallback
      },
      { status: 500 }
    );
  }
}
