import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import useStorefrontContext from '../components/hooks/useStorefrontContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, Plus } from 'lucide-react';
import { hasCopyLicense, hasDownloadLicense } from '../components/utils/entitlements';
import confetti from 'canvas-confetti';

export default function SchoolThankYou() {
  const [user, setUser] = useState(null);
  const { schoolSlug: slug, transactionId } = useStorefrontContext();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Celebration confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        // Clear referral code and attribution
        localStorage.removeItem('referral_code');
        
        if (slug) {
          import('../components/analytics/attribution').then(({ clearAttribution }) => {
            clearAttribution({ schoolSlug: slug });
          });
        }
      } catch (error) {
        // Guest ok
      }
    };
    loadUser();
  }, []);

  // Track purchase completion
  useEffect(() => {
    if (transaction && school) {
      import('../components/analytics/track').then(({ trackEvent }) => {
        trackEvent({
          school_id: school.id,
          user_email: transaction.user_email,
          event_type: 'completed_purchase',
          entity_type: 'Transaction',
          entity_id: transaction.id,
          metadata: { amount_cents: transaction.amount_cents }
        });
      });
    }
  }, [transaction, school]);

  const { data: school } = useQuery({
    queryKey: ['school-by-slug', slug],
    queryFn: async () => {
      const schools = await base44.entities.School.filter({ slug });
      return schools[0];
    },
    enabled: !!slug
  });

  const { data: transaction } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      const transactions = await base44.entities.Transaction.filter({ id: transactionId });
      return transactions[0];
    },
    enabled: !!transactionId
  });

  const { data: offer } = useQuery({
    queryKey: ['offer', transaction?.offer_id],
    queryFn: async () => {
      const offers = await base44.entities.Offer.filter({ id: transaction.offer_id });
      return offers[0];
    },
    enabled: !!transaction?.offer_id
  });

  const { data: entitlements = [] } = useQuery({
    queryKey: ['entitlements', user?.email, school?.id],
    queryFn: () => base44.entities.Entitlement.filter({
      school_id: school.id,
      user_email: user.email
    }),
    enabled: !!user && !!school
  });

  const { data: addOnOffers = [] } = useQuery({
    queryKey: ['addon-offers', school?.id],
    queryFn: async () => {
      const offers = await base44.entities.Offer.filter({
        school_id: school.id,
        offer_type: { $in: ['COPY_LICENSE', 'DOWNLOAD_LICENSE'] }
      });
      return offers;
    },
    enabled: !!school
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center">
          <CardContent className="p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Order Received!</h1>
            
            <p className="text-lg text-slate-600 mb-6">
              Thank you for your purchase. We've received your order and will process it shortly.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-slate-700 mb-2">
                <strong>What happens next?</strong>
              </p>
              <p className="text-sm text-slate-600">
                Our team will contact you via email within 24 hours with payment instructions. 
                Once payment is confirmed, you'll receive immediate access to your course(s).
              </p>
            </div>

            {transaction && (
              <div className="text-left bg-slate-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Order ID:</span>
                    <span className="font-mono">{transactionId?.substring(0, 8)}</span>
                  </div>
                  {offer && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Item:</span>
                      <span>{offer.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Amount:</span>
                    <span className="font-semibold">${((transaction.amount_cents || 0) / 100).toFixed(2)}</span>
                  </div>
                  {transaction.discount_cents > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${(transaction.discount_cents / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-slate-600">Status:</span>
                    <Badge variant="secondary">Pending Payment</Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link to={createPageUrl(`SchoolLanding?slug=${slug}`)}>
                <Button size="lg" className="w-full">
                  Return to School
                </Button>
              </Link>
              <Link to={createPageUrl('Dashboard')}>
                <Button size="lg" variant="outline" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upsell: Add-on Licenses */}
        {user && addOnOffers.length > 0 && !hasCopyLicense(entitlements) && !hasDownloadLicense(entitlements) && (
          <Card className="border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-900">
                <Plus className="w-5 h-5 mr-2" />
                Enhance Your Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-800 mb-4">
                Unlock additional features for your purchased content
              </p>
              <div className="space-y-3">
                {addOnOffers.map((addOn) => (
                  <div key={addOn.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-200">
                    <div>
                      <p className="font-medium text-sm">{addOn.name}</p>
                      <p className="text-xs text-slate-600">{addOn.description}</p>
                    </div>
                    <Link 
                      to={createPageUrl(`SchoolCheckout?slug=${slug}&offerId=${addOn.id}`)}
                      onClick={() => {
                        import('../components/analytics/track').then(({ trackEvent }) => {
                          trackEvent({
                            school_id: school.id,
                            user_email: user?.email,
                            event_type: 'upsell_clicked',
                            entity_type: 'Offer',
                            entity_id: addOn.id
                          });
                        });
                      }}
                    >
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                        ${(addOn.price_cents / 100).toFixed(2)}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}