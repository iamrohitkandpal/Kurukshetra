// src/app/api/flags/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { findUserById, addFlagToUser } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-secret-for-training';

// 🔒 SECURE FLAG STORAGE - Flags are now properly secured and match enhanced vulnerabilities
// These flags are only accessible server-side and correspond to the advanced vulnerability challenges
const FLAGS: Record<string, string> = {
  // Advanced authentication vulnerabilities with multiple attack vectors
  'insecure-auth': 'FLAG{4dv4nc3d_4uth_3xpl01t4t10n_M4st3r}',
  
  // Sophisticated access control testing with horizontal/vertical privilege escalation
  'access-control-flaws': 'FLAG{H0r1z0nt4l_V3rt1c4l_IDORs_PWN3D}',
  
  // Advanced injection techniques including UNION-based and NoSQL injection
  'injection-vulnerabilities': 'FLAG{UN10N_S3L3CT_1nf0rm4t10n_sch3m4_PWN}',
  
  // Cryptographic exploitation and encoding analysis
  'crypto-weakness': 'FLAG{B45e_64_IS_NOT_ENCRYPTION}',
  
  // Infrastructure security assessment and configuration hunting
  'misconfiguration': 'FLAG{3xp0s3d_3nv_v4r_m1sc0nf1g}',
  
  // Dependency vulnerability exploitation
  'vulnerable-dependencies': 'FLAG{CVE-2022-24999-exploited!}',
  
  // Advanced SSRF with internal network reconnaissance
  'ssrf': 'FLAG{1nt3rn4l_n3tw0rk_m3t4d4t4_3xtr4ct3d}',
  
  // Business logic and design flaws
  'insecure-design': 'FLAG{S3cur1ty_By_D3s1gn_M4tt3rs}',
  
  // Security monitoring and logging assessment
  'logging-failures': 'FLAG{L0gg1ng_1s_L0v3}',
  
  // Data integrity and software supply chain security
  'data-integrity-failures': 'FLAG{D4t4_1nt3gr1ty_M4tt3rs!}'
};

export async function POST(request: NextRequest) {
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
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { slug, flag } = body;

    if (!slug || !flag) {
      return NextResponse.json(
        { message: 'Both slug and flag are required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await findUserById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if flag is correct
    const correctFlag = FLAGS[slug];
    if (!correctFlag) {
      return NextResponse.json(
        { message: 'Invalid vulnerability slug' },
        { status: 400 }
      );
    }

    if (flag.trim() !== correctFlag) {
      return NextResponse.json(
        { message: 'Incorrect flag' },
        { status: 400 }
      );
    }

    // Check if user already found this flag
    if (user.flagsFound && user.flagsFound.includes(slug)) {
      return NextResponse.json(
        { message: 'Flag already submitted for this vulnerability' },
        { status: 409 }
      );
    }

    // Add flag to user's record
    await addFlagToUser(decoded.id, slug);

    return NextResponse.json({
      message: 'Flag submitted successfully!',
      slug,
      flag: correctFlag,
      points: 100 // Each flag is worth 100 points
    });

  } catch (error) {
    console.error('Flag submission error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
