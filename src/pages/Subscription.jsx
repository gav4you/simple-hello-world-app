import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Crown, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import PricingCard from '../components/subscription/PricingCard';

export default function Subscription() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs[0] || null;
    },
    enabled: !!user?.email
  });

  const subscribeMutation = useMutation({
    mutationFn: async (tier) => {
      if (subscription) {
        return await base44.entities.Subscription.update(subscription.id, {
          tier,
          status: 'active',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      } else {
        return await base44.entities.Subscription.create({
          user_email: user.email,
          tier,
          status: 'active',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          auto_renew: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription']);
      toast.success('Subscription updated successfully!');
    }
  });

  const handleSubscribe = (tier) => {
    subscribeMutation.mutate(tier);
  };

  const currentTier = subscription?.tier || 'free';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3">Choose Your Learning Path</h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Unlock deeper access to the Torah of Rebbe Nachman with our premium plans
        </p>
      </div>

      {/* Current Subscription Alert */}
      {subscription && subscription.tier !== 'free' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 flex items-center space-x-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">Active Subscription</h3>
            <p className="text-green-700">
              You're currently on the <span className="font-bold capitalize">{subscription.tier}</span> plan
              {subscription.end_date && ` until ${new Date(subscription.end_date).toLocaleDateString()}`}
            </p>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PricingCard 
          tier="free" 
          isCurrentTier={currentTier === 'free'}
          onSubscribe={handleSubscribe}
        />
        <PricingCard 
          tier="premium" 
          isCurrentTier={currentTier === 'premium'}
          onSubscribe={handleSubscribe}
        />
        <PricingCard 
          tier="elite" 
          isCurrentTier={currentTier === 'elite'}
          onSubscribe={handleSubscribe}
        />
      </div>

      {/* Features Comparison */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          Why Invest in Your Torah Learning?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Expert Teachers</h3>
            <p className="text-slate-600 text-sm">
              Learn from renowned Breslov Rabbis and scholars
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Structured Learning</h3>
            <p className="text-slate-600 text-sm">
              Follow a clear path through the teachings of Rebbe Nachman
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Community Support</h3>
            <p className="text-slate-600 text-sm">
              Join a vibrant community of Breslov chassidim
            </p>
          </div>
        </div>
      </div>

      {/* Demo Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <p className="text-amber-900">
          <strong>Demo Mode:</strong> This is a demonstration platform. In production, payment processing would be integrated with Stripe or similar payment providers.
        </p>
      </div>
    </div>
  );
}