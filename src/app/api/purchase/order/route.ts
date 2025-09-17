// src/app/api/purchase/order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-secret-for-training';

// Product catalog with server-side prices
const PRODUCTS = {
  'premium-course': { name: 'Premium Security Course', price: 299.99 },
  'enterprise-license': { name: 'Enterprise License', price: 1999.99 },
  'individual-module': { name: 'Individual Module', price: 49.99 }
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

    // Verify user exists
    const user = await findUserById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Get order data from request
    const body = await request.json();
    const { productId, quantity, finalPrice, discountCode, discountAmount, totalPrice } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { message: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    // Validate product exists
    const product = PRODUCTS[productId as keyof typeof PRODUCTS];
    if (!product) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // VULNERABILITY: Trust client-side pricing without validation
    // Should validate prices server-side, but we don't!
    const serverPrice = product.price;
    
    // Calculate what the price should be
    const expectedTotal = serverPrice * quantity;
    
    // VULNERABILITY: Accept client-provided final price
    const clientTotal = finalPrice * quantity;
    
    // Check for price manipulation
    let flag = null;
    let hint = null;
    
    if (clientTotal < expectedTotal * 0.5) {
      // Significant price manipulation detected
      flag = 'FLAG{Pr1c3_M4n1pul4t10n_Succ3ss}';
      hint = 'Price manipulation successful! You exploited client-side pricing logic.';
    } else if (clientTotal < expectedTotal) {
      hint = 'Partial price manipulation detected. Try manipulating the price further.';
    }

    // Process the order (even with manipulated prices!)
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const order = {
      id: orderId,
      userId: user.id,
      product: {
        id: productId,
        name: product.name,
        serverPrice: serverPrice,
        clientPrice: finalPrice
      },
      quantity,
      pricing: {
        basePrice: serverPrice,
        clientSubmittedPrice: finalPrice,
        discountCode: discountCode || null,
        discountAmount: discountAmount || 0,
        totalPrice: clientTotal // VULNERABILITY: Use client price!
      },
      metadata: {
        priceManipulation: clientTotal < expectedTotal,
        expectedPrice: expectedTotal,
        actualPrice: clientTotal,
        savings: expectedTotal - clientTotal
      },
      timestamp: new Date().toISOString()
    };

    console.log('💰 Order processed:', {
      user: user.email,
      product: product.name,
      expectedPrice: expectedTotal,
      paidPrice: clientTotal,
      manipulation: clientTotal < expectedTotal
    });

    return NextResponse.json({
      success: true,
      message: 'Order processed successfully',
      order,
      flag,
      hint,
      vulnerability: clientTotal < expectedTotal ? {
        type: 'Business Logic Flaw - Price Manipulation',
        description: 'Client-side pricing logic can be manipulated',
        impact: 'Financial loss, unauthorized discounts'
      } : null
    });

  } catch (error) {
    console.error('Purchase order error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
