import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '@/lib/db';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: string;
  email: string;
  username: string;
  iat: number;
  iss: string;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-secret-for-training';

async function authenticateRequest(request: NextRequest): Promise<DecodedToken | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { message: 'Invalid user ID.' },
      { status: 400 }
    );
  }

  // Authenticate the request
  const user = await authenticateRequest(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Unauthorized: Invalid or missing token.' },
      { status: 401 }
    );
  }

  // Authorization check: users can only access their own data
  if (user.id !== id) {
    return NextResponse.json(
      { message: 'Forbidden: You can only access your own user data.' },
      { status: 403 }
    );
  }

  try {
    const userData = await findUserById(id);

    if (!userData) {
      return NextResponse.json(
        { message: 'User not found.' },
        { status: 404 }
      );
    }

    // Return a safe user object, omitting the password
    const { password, passwordHash, ...safeUser } = userData;
    return NextResponse.json(safeUser);
    
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
