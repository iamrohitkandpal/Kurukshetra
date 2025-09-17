// src/app/api/tenants/[id]/data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-secret-for-training';

// Mock tenant data - simulating a multi-tenant application
const tenantData = {
  'tenant-123e4567-e89b-12d3-a456-426614174000': {
    name: 'Default Corp',
    type: 'Standard',
    data: {
      users: 150,
      revenue: 50000,
      plan: 'basic',
      public: {
        companyInfo: 'Default Corp - Standard Business'
      }
    }
  },
  'tenant-987fcdeb-51d2-43a1-9876-426614174001': {
    name: 'Admin Corp',
    type: 'Enterprise', 
    data: {
      users: 500,
      revenue: 250000,
      plan: 'enterprise',
      sensitive: {
        adminCredentials: 'admin:super-secret-password',
        apiKeys: ['key-1', 'key-2', 'key-3'],
        flag: 'FLAG{1D0R_T3n4nt_D4t4_L34k}',
        internalNotes: 'This tenant has elevated privileges'
      },
      public: {
        companyInfo: 'Admin Corp - Enterprise Client'
      }
    }
  },
  'tenant-456def78-9abc-1234-5678-426614174002': {
    name: 'Secret Corp',
    type: 'VIP',
    data: {
      users: 1000,
      revenue: 500000,
      plan: 'vip',
      sensitive: {
        vipSecrets: 'Top secret project data',
        flag: 'FLAG{V1P_T3n4nt_4cc3ss}',
        criticalData: {
          project: 'Operation Phoenix',
          budget: 2000000,
          contacts: ['ceo@secretcorp.com', 'cto@secretcorp.com']
        }
      },
      public: {
        companyInfo: 'Secret Corp - VIP Client'
      }
    }
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: tenantId } = await params;
    
    // VULNERABILITY: No proper authorization check
    // Should verify if user has access to this specific tenant
    // Currently any authenticated user can access any tenant's data
    
    const tenant = tenantData[tenantId as keyof typeof tenantData];
    
    if (!tenant) {
      return NextResponse.json(
        { message: 'Tenant not found' },
        { status: 404 }
      );
    }

    // VULNERABILITY: Return all data including sensitive information
    // Should filter based on user's role and tenant access
    
    let warning = null;
    if (tenantId !== 'tenant-123e4567-e89b-12d3-a456-426614174000') {
      warning = `⚠️ Cross-tenant access detected! User accessed tenant ${tenantId} data`;
    }

    return NextResponse.json({
      message: 'Tenant data retrieved successfully',
      tenantId,
      tenant: tenant.name,
      data: tenant.data,
      warning,
      accessedBy: {
        userId: decoded.id,
        email: decoded.email,
        timestamp: new Date().toISOString()
      },
      vulnerability: {
        type: 'IDOR (Insecure Direct Object Reference)',
        description: 'User can access other tenants data by modifying the tenant ID',
        impact: 'Data breach, unauthorized access to sensitive information'
      }
    });

  } catch (error) {
    console.error('Tenant data access error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
