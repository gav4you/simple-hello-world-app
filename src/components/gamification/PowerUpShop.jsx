import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function PowerUpShop({ userEmail }) {
  const queryClient = useQueryClient();

  const { data: powerups = [] } = useQuery({
    queryKey: ['powerups'],
    queryFn: () => base44.entities.PowerUp.list()
  });

  const purchaseMutation = useMutation({
    mutationFn: async (powerup) => {
      return await base44.entities.UserPowerUp.create({
        user_email: userEmail,
        powerup_id: powerup.id,
        activated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + powerup.duration_hours * 3600000).toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-powerups']);
      toast.success('Power-up activated!');
    }
  });

  const rarityColors = {
    common: 'bg-slate-100 text-slate-800',
    rare: 'bg-blue-100 text-blue-800',
    epic: 'bg-purple-100 text-purple-800',
    legendary: 'bg-amber-100 text-amber-800'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {powerups.map((powerup) => (
        <Card key={powerup.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold mb-2">{powerup.name}</h3>
                <Badge className={rarityColors[powerup.rarity]}>
                  <Star className="w-3 h-3 mr-1" />
                  {powerup.rarity}
                </Badge>
              </div>
              <Zap className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-sm text-slate-600 mb-4">{powerup.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600">{powerup.cost_points} pts</span>
              <Button size="sm" onClick={() => purchaseMutation.mutate(powerup)}>
                Activate
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}