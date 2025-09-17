// src/app/api/ssrf/fetch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-secret-for-training';

// VULNERABILITY: No proper URL validation allows SSRF attacks
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

    // Get URL from query parameters
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { message: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // VULNERABILITY: Basic validation can be bypassed
    // Should use allowlist, not blocklist
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0'];
    
    try {
      const urlObj = new URL(url);
      
      // Check for obvious internal hosts (but can be bypassed)
      if (blockedHosts.some(host => urlObj.hostname.includes(host))) {
        return NextResponse.json({
          message: 'Access to internal hosts is blocked',
          content: 'BLOCKED: Internal host detected',
          url: url
        });
      }

      // VULNERABILITY: No additional validation for internal IPs, IPv6, etc.
      // Attackers can use: http://127.1, http://[::1], http://2130706433, etc.
      
      // Detect potential SSRF attempts and provide flags
      let flag = null;
      let content = '';
      
      if (urlObj.hostname === '127.1' || 
          urlObj.hostname === '2130706433' ||
          urlObj.hostname.includes('::1') ||
          url.includes('file://') ||
          url.includes('gopher://')) {
        
        flag = 'FLAG{S3rv3r_S1d3_R3qu3st_F0rg3ry}';
        content = `SSRF SUCCESS! Internal service response:
{
  "service": "internal-api",
  "version": "1.0.0",
  "secrets": {
    "admin_token": "super-secret-admin-token-123",
    "database_url": "internal://db.local:5432/prod",
    "api_keys": ["key-1", "key-2", "key-3"]
  },
  "flag": "${flag}"
}`;
      } else {
        // Try to fetch the actual URL for legitimate requests
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'User-Agent': 'Kurukshetra-SSRF-Demo/1.0'
            },
            // Timeout to prevent hanging
            signal: AbortSignal.timeout(5000)
          });
          
          content = await response.text();
          
          // Limit response size
          if (content.length > 2000) {
            content = content.substring(0, 2000) + '\n\n[Response truncated...]';
          }
          
        } catch (fetchError) {
          content = `Error fetching URL: ${fetchError}`;
        }
      }

      return NextResponse.json({
        message: 'URL fetched successfully',
        content,
        url,
        flag,
        metadata: {
          hostname: urlObj.hostname,
          protocol: urlObj.protocol,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      return NextResponse.json({
        message: 'Invalid URL format',
        content: `Error: ${error}`,
        url
      }, { status: 400 });
    }

  } catch (error) {
    console.error('SSRF endpoint error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
