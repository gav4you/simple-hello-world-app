import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function SchoolCheckout() {
  const [user, setUser] = useState(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();
  
  const { schoolSlug: slug, offerId, refCode } = useStorefrontContext();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Guest checkout allowed - no redirect
      }
    };
    loadUser();
  }, []);

  // Track checkout started
  useEffect(() => {
    if (school && offer) {
      import('../components/analytics/track').then(({ trackEvent }) => {
        trackEvent({
          school_id: school.id,
          user_email: user?.email,
          event_type: 'started_checkout',
          entity_type: 'Offer',
          entity_id: offer.id
        });
      });
    }
  }, [school, offer, user]);

  const { data: school } = useQuery({
    queryKey: ['school-by-slug', slug],
    queryFn: async () => {
      const schools = await base44.entities.School.filter({ slug });
      return schools[0];
    },
    enabled: !!slug
  });

  const { data: offer } = useQuery({
    queryKey: ['offer', offerId],
    queryFn: async () => {
      const offers = await base44.entities.Offer.filter({ id: offerId });
      return offers[0];
    },
    enabled: !!offerId
  });

  const { data: coupon } = useQuery({
    queryKey: ['coupon', couponCode, school?.id],
    queryFn: async () => {
      if (!couponCode) return null;
      const coupons = await base44.entities.Coupon.filter({
        school_id: school.id,
        code: couponCode
      });
      return coupons[0];
    },
    enabled: !!couponCode && !!school
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data) => base44.entities.Transaction.create(data),
    onSuccess: (transaction) => {
      // Log purchase initiation
      try {
        base44.entities.EventLog.create({
          school_id: school.id,
          user_email: transaction.user_email,
          event_type: 'purchase_initiated',
          entity_type: 'TRANSACTION',
          entity_id: transaction.id,
          metadata: { offer_id: offer.id }
        });
      } catch (e) {
        // Optional log
      }
      
      navigate(createPageUrl(`SchoolThankYou?slug=${slug}&transactionId=${transaction.id}`));
    }
  });

  const handleApplyCoupon = () => {
    if (coupon) {
      const discountAmount = coupon.discount_type === 'PERCENTAGE'
        ? (offer.price_cents * coupon.discount_value / 100)
        : coupon.discount_value * 100;
      setDiscount(discountAmount);
      toast.success('Coupon applied!');
      
      // Track coupon applied
      import('../components/analytics/track').then(({ trackEvent }) => {
        trackEvent({
          school_id: school.id,
          user_email: user?.email,
          event_type: 'applied_coupon',
          metadata: { coupon_code: couponCode, discount_cents: discountAmount }
        });
      });
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handleCheckout = () => {
    const email = user?.email || guestEmail;
    if (!email) {
      toast.error('Please provide an email address');
      return;
    }
    
    const finalAmount = Math.max(0, offer.price_cents - discount);
    const discountAmount = discount;
    
    // Build metadata with attribution
    import('../components/analytics/attribution').then(({ getAttribution, attachAttribution }) => {
      const attribution = getAttribution({ schoolSlug: slug });
      const baseMetadata = refCode ? { referral_code: refCode } : {};
      const metadata = attachAttribution(baseMetadata, attribution);
      
      createTransactionMutation.mutate({
        school_id: school.id,
        user_email: email,
        offer_id: offer.id,
        amount_cents: finalAmount,
        discount_cents: discountAmount,
        coupon_code: couponCode || undefined,
        provider: 'MANUAL',
        status: 'pending',
        metadata
      });
    });
  };

  if (!offer || !school) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  const finalAmount = Math.max(0, offer.price_cents - discount);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

        <div className="grid gap-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">{offer.name}</span>
                <span className="font-semibold">${(offer.price_cents / 100).toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({couponCode})</span>
                  <span>-${(discount / 100).toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t pt-4 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${(finalAmount / 100).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Coupon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Have a Coupon?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                />
                <Button onClick={handleApplyCoupon} variant="outline">
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email (for guests) */}
          {!user && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    We'll send payment instructions and access details to this email
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <p className="text-amber-800 mb-2">
                  <strong>Manual Payment Processing</strong>
                </p>
                <p className="text-sm text-amber-700">
                  After submitting your order, our team will contact you via email with payment instructions. 
                  Your access will be granted within 24 hours of payment confirmation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button 
            size="lg" 
            className="w-full"
            onClick={handleCheckout}
            disabled={createTransactionMutation.isPending}
          >
            {createTransactionMutation.isPending ? 'Processing...' : 'Complete Order'}
          </Button>
        </div>
      </div>
    </div>
  );
}