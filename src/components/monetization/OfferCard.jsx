import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

export default function OfferCard({ offer, schoolSlug, highlighted = false }) {
  const price = offer.price_cents ? (offer.price_cents / 100).toFixed(2) : '0.00';

  return (
    <Card className={`${highlighted ? 'border-2 border-amber-500 shadow-xl scale-105' : ''} relative`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-amber-500 text-white">Most Popular</Badge>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="text-2xl">{offer.name}</CardTitle>
        <div className="text-3xl font-bold mt-2">
          ${price}
          {offer.billing_cycle && (
            <span className="text-sm text-slate-600 font-normal">/{offer.billing_cycle}</span>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-slate-600 mb-4">{offer.description}</p>
        
        {offer.features && (
          <ul className="space-y-2 mb-6">
            {offer.features.map((feature, i) => (
              <li key={i} className="flex items-start text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <Link to={createPageUrl(`SchoolCheckout?slug=${schoolSlug}&offerId=${offer.id}`)}>
          <Button 
            className={`w-full ${highlighted ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
          >
            Select Plan
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}