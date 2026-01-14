import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import GoogleServiceConnector from '../components/integrations/GoogleServiceConnector';
import { Plug } from 'lucide-react';

export default function Integrations() {
  const [user, setUser] = useState(null);

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

  if (!user) {
    return (
      <div className="text-center py-20">
        <Plug className="w-16 h-16 text-slate-400 mx-auto mb-4 animate-pulse" />
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Integrations</h1>
        <p className="text-slate-600 text-lg">
          Connect your favorite tools and services to enhance your learning experience
        </p>
      </div>

      {/* Google Workspace */}
      <GoogleServiceConnector user={user} />
    </div>
  );
}