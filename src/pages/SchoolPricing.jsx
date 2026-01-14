import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import useStorefrontContext from '../components/hooks/useStorefrontContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Crown } from 'lucide-react';

export default function SchoolPricing() {
  const [user, setUser] = useState(null);
  const { schoolSlug: slug } = useStorefrontContext();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Guest ok
      }
    };
    loadUser();
  }, []);

  // Track page view
  useEffect(() => {
    if (school) {
      import('../components/analytics/track').then(({ trackEvent }) => {
        trackEvent({
          school_id: school.id,
          user_email: user?.email,
          event_type: 'viewed_pricing'
        });
      });
    }
  }, [school, user]);

  const { data: school } = useQuery({
    queryKey: ['school-by-slug', slug],
    queryFn: async () => {
      const schools = await base44.entities.School.filter({ slug });
      return schools[0];
    },
    enabled: !!slug
  });

  const { data: offers = [] } = useQuery({
    queryKey: ['offers', school?.id],
    queryFn: () => base44.entities.Offer.filter({ 
      school_id: school.id 
    }, '-created_date'),
    enabled: !!school
  });

  // Group offers by type
  const courseOffers = offers.filter(o => o.offer_type === 'COURSE');
  const bundleOffers = offers.filter(o => o.offer_type === 'BUNDLE');
  const subscriptions = offers.filter(o => o.offer_type === 'SUBSCRIPTION');
  const addOns = offers.filter(o => o.offer_type === 'ADDON');

  if (!school) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 text-center">
        <p className="text-slate-600">Loading pricing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-xl text-slate-300">
            Invest in your learning journey with {school.name}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Subscriptions (Best Value) */}
        {subscriptions.length > 0 && (
          <div>
            <div className="text-center mb-8">
              <Badge className="bg-amber-500 text-white mb-3">
                <Crown className="w-3 h-3 mr-1" />
                Best Value
              </Badge>
              <h2 className="text-3xl font-bold mb-2">Unlimited Access</h2>
              <p className="text-slate-600">All courses, one simple price</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {subscriptions.map((sub) => (
                <Card key={sub.id} className="border-2 border-amber-300 shadow-xl hover:shadow-2xl transition-all">
                  <CardHeader>
                    <CardTitle className="text-2xl">{sub.name}</CardTitle>
                    <CardDescription>{sub.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">${(sub.price_cents / 100).toFixed(0)}</span>
                      <span className="text-slate-600">/month</span>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Access all courses</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">New courses added monthly</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Download materials</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Certificate of completion</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link to={createPageUrl(`SchoolCheckout?slug=${slug}&offerId=${sub.id}`)} className="w-full">
                      <Button size="lg" className="w-full bg-amber-600 hover:bg-amber-700">
                        Start Subscription
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Bundles */}
        {bundleOffers.length > 0 && (
          <div>
            <div className="text-center mb-8">
              <Badge className="bg-blue-500 text-white mb-3">
                Popular Choice
              </Badge>
              <h2 className="text-3xl font-bold mb-2">Course Bundles</h2>
              <p className="text-slate-600">Save when you bundle multiple courses</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {bundleOffers.map((bundle) => (
                <Card key={bundle.id} className="border-blue-200 hover:shadow-xl transition-all">
                  <CardHeader>
                    <CardTitle>{bundle.name}</CardTitle>
                    <CardDescription>{bundle.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">${(bundle.price_cents / 100).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      Multiple courses included
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link to={createPageUrl(`SchoolCheckout?slug=${slug}&offerId=${bundle.id}`)} className="w-full">
                      <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                        Get Bundle
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Individual Courses */}
        {courseOffers.length > 0 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Individual Courses</h2>
              <p className="text-slate-600">Lifetime access, one-time payment</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {courseOffers.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-2xl font-bold">${(course.price_cents / 100).toFixed(2)}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to={createPageUrl(`SchoolCheckout?slug=${slug}&offerId=${course.id}`)} className="w-full">
                      <Button size="lg" variant="outline" className="w-full">
                        Enroll Now
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons */}
        {addOns.length > 0 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Add-On Licenses</h2>
              <p className="text-slate-600 text-sm">Enhance your purchased courses</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {addOns.map((addon) => (
                <Card key={addon.id} className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{addon.name}</p>
                        <p className="text-xs text-slate-600">{addon.description}</p>
                      </div>
                      <Link to={createPageUrl(`SchoolCheckout?slug=${slug}&offerId=${addon.id}`)}>
                        <Button size="sm">
                          ${(addon.price_cents / 100).toFixed(2)}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Trust Section */}
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center space-x-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-slate-700 mb-2">
            Join thousands of students learning with {school.name}
          </p>
          <p className="text-sm text-slate-500">
            Money-back guarantee • Secure payment • Instant access
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to={createPageUrl(`SchoolCourses?slug=${slug}`)}>
            <Button size="lg" variant="outline">
              Browse All Courses
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}