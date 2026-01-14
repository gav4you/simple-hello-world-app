import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentProtectionSettings({ schoolId }) {
  const queryClient = useQueryClient();

  const { data: policy } = useQuery({
    queryKey: ['protection-policy', schoolId],
    queryFn: async () => {
      const policies = await base44.entities.ContentProtectionPolicy.filter({ school_id: schoolId });
      return policies[0];
    },
    enabled: !!schoolId
  });

  const [localPolicy, setLocalPolicy] = useState(policy || {
    protect_content: true,
    require_payment_for_materials: true,
    allow_previews: true,
    max_preview_seconds: 90,
    max_preview_chars: 1500,
    watermark_enabled: true,
    watermark_opacity: 0.18,
    block_right_click: true,
    block_copy: true,
    block_print: true,
    download_mode: 'DISALLOW',
    copy_mode: 'DISALLOW'
  });

  React.useEffect(() => {
    if (policy) {
      setLocalPolicy(policy);
    }
  }, [policy]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (policy) {
        return await base44.entities.ContentProtectionPolicy.update(policy.id, data);
      } else {
        return await base44.entities.ContentProtectionPolicy.create({
          ...data,
          school_id: schoolId
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['protection-policy']);
      toast.success('Content protection settings saved');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(localPolicy);
  };

  const getProtectionScore = () => {
    let score = 0;
    if (localPolicy.protect_content) score += 20;
    if (localPolicy.require_payment_for_materials) score += 20;
    if (localPolicy.watermark_enabled) score += 15;
    if (localPolicy.block_copy) score += 15;
    if (localPolicy.block_right_click) score += 10;
    if (localPolicy.block_print) score += 10;
    if (localPolicy.download_mode === 'DISALLOW') score += 10;
    return score;
  };

  const protectionScore = getProtectionScore();

  return (
    <div className="space-y-6">
      {/* Protection Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Content Protection Score
            </span>
            <Badge variant={protectionScore >= 80 ? 'default' : protectionScore >= 50 ? 'secondary' : 'destructive'}>
              {protectionScore}%
            </Badge>
          </CardTitle>
          <CardDescription>
            {protectionScore >= 80 ? 'Strong protection' : protectionScore >= 50 ? 'Moderate protection' : 'Weak protection'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Core Protection */}
      <Card>
        <CardHeader>
          <CardTitle>Core Protection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="protect_content">Enable Content Protection</Label>
            <Switch
              id="protect_content"
              checked={localPolicy.protect_content}
              onCheckedChange={(checked) => setLocalPolicy({...localPolicy, protect_content: checked})}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="require_payment">Require Payment for Materials</Label>
            <Switch
              id="require_payment"
              checked={localPolicy.require_payment_for_materials}
              onCheckedChange={(checked) => setLocalPolicy({...localPolicy, require_payment_for_materials: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="block_right_click">Block Right-Click</Label>
            <Switch
              id="block_right_click"
              checked={localPolicy.block_right_click}
              onCheckedChange={(checked) => setLocalPolicy({...localPolicy, block_right_click: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="block_copy">Block Copy/Paste</Label>
            <Switch
              id="block_copy"
              checked={localPolicy.block_copy}
              onCheckedChange={(checked) => setLocalPolicy({...localPolicy, block_copy: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="block_print">Block Printing</Label>
            <Switch
              id="block_print"
              checked={localPolicy.block_print}
              onCheckedChange={(checked) => setLocalPolicy({...localPolicy, block_print: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Preview Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="allow_previews">Allow Previews</Label>
            <Switch
              id="allow_previews"
              checked={localPolicy.allow_previews}
              onCheckedChange={(checked) => setLocalPolicy({...localPolicy, allow_previews: checked})}
            />
          </div>

          {localPolicy.allow_previews && (
            <>
              <div className="space-y-2">
                <Label htmlFor="max_preview_seconds">Max Preview Seconds (Video)</Label>
                <Input
                  id="max_preview_seconds"
                  type="number"
                  value={localPolicy.max_preview_seconds}
                  onChange={(e) => setLocalPolicy({...localPolicy, max_preview_seconds: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_preview_chars">Max Preview Characters (Text)</Label>
                <Input
                  id="max_preview_chars"
                  type="number"
                  value={localPolicy.max_preview_chars}
                  onChange={(e) => setLocalPolicy({...localPolicy, max_preview_chars: parseInt(e.target.value)})}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Watermark */}
      <Card>
        <CardHeader>
          <CardTitle>Watermark</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="watermark_enabled">Enable Watermark</Label>
            <Switch
              id="watermark_enabled"
              checked={localPolicy.watermark_enabled}
              onCheckedChange={(checked) => setLocalPolicy({...localPolicy, watermark_enabled: checked})}
            />
          </div>

          {localPolicy.watermark_enabled && (
            <div className="space-y-2">
              <Label htmlFor="watermark_opacity">Opacity (0.0 - 1.0)</Label>
              <Input
                id="watermark_opacity"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={localPolicy.watermark_opacity}
                onChange={(e) => setLocalPolicy({...localPolicy, watermark_opacity: parseFloat(e.target.value)})}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Copy/Download Licensing */}
      <Card>
        <CardHeader>
          <CardTitle>Copy & Download Licensing</CardTitle>
          <CardDescription>Monetize additional usage rights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="copy_mode">Copy Mode</Label>
            <Select 
              value={localPolicy.copy_mode} 
              onValueChange={(value) => setLocalPolicy({...localPolicy, copy_mode: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DISALLOW">Disallow</SelectItem>
                <SelectItem value="INCLUDED_WITH_ACCESS">Included with Access</SelectItem>
                <SelectItem value="ADDON">Paid Add-on</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="download_mode">Download Mode</Label>
            <Select 
              value={localPolicy.download_mode} 
              onValueChange={(value) => setLocalPolicy({...localPolicy, download_mode: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DISALLOW">Disallow</SelectItem>
                <SelectItem value="INCLUDED_WITH_ACCESS">Included with Access</SelectItem>
                <SelectItem value="ADDON">Paid Add-on</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full">
        Save Protection Settings
      </Button>
    </div>
  );
}