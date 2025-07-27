// src/components/insecure-design-demo.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, ShoppingCart, AlertTriangle, Zap } from 'lucide-react';

const PRODUCTS = {
  'premium-course': { name: 'Premium Security Course', price: 299.99 },
  'enterprise-license': { name: 'Enterprise License', price: 1999.99 },
  'individual-module': { name: 'Individual Module', price: 49.99 }
};

export function InsecureDesignDemo() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Registration states
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    agreeToTerms: false
  });

  // Purchase states
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [discountCode, setDiscountCode] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');

  const handleRegistrationStep = async (step: number) => {
    try {
      const response = await fetch(`/api/registration/step${step}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Step Completed",
          description: data.message,
          variant: "default",
        });

        if (data.flag) {
          toast({
            title: "🚩 Flag Found!",
            description: data.flag,
            variant: "default",
          });
        }

        if (step < 3) {
          setCurrentStep(step + 1);
        }
      }
    } catch (error) {
      toast({
        title: "❌ Step Failed",
        description: "Registration step error",
        variant: "destructive",
      });
    }
  };

  const skipToFinalStep = async () => {
    // VULNERABILITY: Direct jump to step 3, bypassing step 2 validation
    try {
      const response = await fetch('/api/registration/step3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: registrationData.email,
          username: registrationData.username,
          password: registrationData.password,
          firstName: registrationData.firstName || 'Bypassed',
          lastName: registrationData.lastName || 'User',
          agreeToTerms: true // Force agreement
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "🚩 Step Bypass Success!",
          description: "Registration completed by skipping step 2!",
          variant: "default",
        });
        
        toast({
          title: "🚩 Business Logic Flaw",
          description: "FLAG{R3g1str4t10n_St3p_Byp4ss}",
          variant: "default",
        });
      }
    } catch (error) {
      console.log('Bypass attempt failed:', error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct || !user) return;

    const product = PRODUCTS[selectedProduct as keyof typeof PRODUCTS];
    if (!product) return;
    
    const basePrice = product.price;
    
    // Client handles discount logic before submission
    let finalPrice = parseFloat(customPrice) || basePrice;
    let calculatedDiscount = parseFloat(discountAmount) || 0;
    
    // Apply client-side discount logic
    if (discountCode === 'INSIDER50') {
      calculatedDiscount = basePrice * 0.5;
      finalPrice = basePrice - calculatedDiscount;
    } else if (discountCode === 'EMPLOYEE90') {
      calculatedDiscount = basePrice * 0.9;
      finalPrice = basePrice - calculatedDiscount;
    }

    try {
      const response = await fetch('/api/purchase/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: selectedProduct,
          quantity: quantity,
          finalPrice: finalPrice,
          discountCode: discountCode,
          discountAmount: calculatedDiscount,
          totalPrice: finalPrice * quantity
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Purchase Successful",
          description: `Order placed for $${data.order.pricing.totalPrice.toFixed(2)}`,
          variant: "default",
        });

        if (data.flag) {
          toast({
            title: "🚩 Flag Found!",
            description: data.flag,
            variant: "default",
          });
        }

        if (data.hint) {
          toast({
            title: "💡 Hint",
            description: data.hint,
            variant: "default",
          });
        }
      }
    } catch (error) {
      toast({
        title: "❌ Purchase Failed",
        description: "Order processing error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Multi-Step Registration Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Multi-Step Registration (Business Logic Flaw)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Streamlined Process</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                🚀 Streamlined process – just click and you're done! Our smart system handles validation efficiently.
              </p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Step {currentStep} of 3</h3>
              <div className="flex gap-2">
                {[1, 2, 3].map(step => (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {currentStep === 1 && (
              <div className="space-y-4">
                <h4 className="font-medium">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      value={registrationData.email}
                      onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-username">Username</Label>
                    <Input
                      id="reg-username"
                      value={registrationData.username}
                      onChange={(e) => setRegistrationData({...registrationData, username: e.target.value})}
                      placeholder="username"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={registrationData.password}
                    onChange={(e) => setRegistrationData({...registrationData, password: e.target.value})}
                    placeholder="password"
                  />
                </div>
                <Button onClick={() => handleRegistrationStep(1)}>Continue to Step 2</Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h4 className="font-medium">Profile Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={registrationData.firstName}
                      onChange={(e) => setRegistrationData({...registrationData, firstName: e.target.value})}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={registrationData.lastName}
                      onChange={(e) => setRegistrationData({...registrationData, lastName: e.target.value})}
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={registrationData.agreeToTerms}
                    onCheckedChange={(checked) => setRegistrationData({...registrationData, agreeToTerms: checked as boolean})}
                  />
                  <Label htmlFor="terms">I agree to the terms and conditions</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleRegistrationStep(2)}>Continue to Step 3</Button>
                  <Button variant="outline" onClick={skipToFinalStep}>
                    Skip to Final Step (Test Bypass)
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h4 className="font-medium">Confirmation</h4>
                <p className="text-sm text-muted-foreground">
                  Review your information and complete registration.
                </p>
                <Button onClick={() => handleRegistrationStep(3)}>Complete Registration</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Purchase System Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase System (Pricing Logic Flaw)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Smart Pricing</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💰 Our advanced system calculates discounts automatically for the best user experience!
              </p>
            </div>

            <div>
              <Label htmlFor="product">Select Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRODUCTS).map(([id, product]) => (
                    <SelectItem key={id} value={id}>
                      {product.name} - ${product.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount Code</Label>
                <Input
                  id="discount"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Try: INSIDER50, EMPLOYEE90"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customPrice">Custom Price ($)</Label>
                <Input
                  id="customPrice"
                  type="number"
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Override price (test manipulation)"
                />
              </div>
              <div>
                <Label htmlFor="discountAmt">Discount Amount ($)</Label>
                <Input
                  id="discountAmt"
                  type="number"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="Manual discount amount"
                />
              </div>
            </div>

            {selectedProduct && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p><strong>Selected:</strong> {PRODUCTS[selectedProduct as keyof typeof PRODUCTS].name}</p>
                <p><strong>Base Price:</strong> ${PRODUCTS[selectedProduct as keyof typeof PRODUCTS].price}</p>
                {/* Client handles discount logic before submission */}
                <p><strong>Final Price:</strong> ${parseFloat(customPrice) || PRODUCTS[selectedProduct as keyof typeof PRODUCTS].price}</p>
              </div>
            )}

            <Button 
              onClick={handlePurchase} 
              disabled={!selectedProduct || !user}
              className="w-full"
            >
              {!user ? 'Login Required' : 'Process Order'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
