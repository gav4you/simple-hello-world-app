import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, Lock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const PRESETS = {
  strict: {
    label: 'Strict Protection',
    protect_content: true,
    require_payment_for_materials: true,
    allow_previews: false,
    watermark_enabled: true,
    block_right_click: true,
    block_copy: true,
    block_print: true,
    copy_mode: 'DISALLOW',
    download_mode: 'DISALLOW'
  },
  previewFriendly: {
    label: 'Preview Friendly',
    protect_content: true,
    require_payment_for_materials: true,
    allow_previews: true,
    max_preview_seconds: 120,
    max_preview_chars: 2000,
    watermark_enabled: true,
    watermark_opacity: 0.15,
    block_right_click: true,
    block_copy: true,
    block_print: true,
    copy_mode: 'ADDON',
    download_mode: 'ADDON'
  },
  open: {
    label: 'Open Access',
    protect_content: false,
    require_payment_for_materials: false,
    allow_previews: true,
    watermark_enabled: false,
    block_right_click: false,
    block_copy: false,
    block_print: false,
    copy_mode: 'INCLUDED_WITH_ACCESS',
    download_mode: 'INCLUDED_WITH_ACCESS'
  }
};

export default function SchoolProtectionSettings({ schoolId }) {
  const queryClient = useQueryClient();
  
  const { data: policyRecord, isLoading } = useQuery({
    queryKey: ['protection-policy', schoolId],
    queryFn: async () => {
      const policies = await base44.entities.ContentProtectionPolicy.filter({ school_id: schoolId });
      return policies[0];
    },
    enabled: !!schoolId
  });

  const [policy, setPolicy] = useState(policyRecord || {
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
    copy_mode: 'ADDON',
    download_mode: 'ADDON'
  });

  useEffect(() => {
    if (policyRecord) setPolicy(policyRecord);
  }, [policyRecord]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (policyRecord) {
        await base44.entities.ContentProtectionPolicy.update(policyRecord.id, policy);
      } else {
        await base44.entities.ContentProtectionPolicy.create({
          school_id: schoolId,
          ...policy
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['protection-policy']);
      toast.success('Protection settings saved');
    }
  });

  const applyPreset = (presetKey) => {
    setPolicy({ ...policy, ...PRESETS[presetKey] });
    toast.success(`Applied ${PRESETS[presetKey].label} preset`);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex space-x-2">
        {Object.entries(PRESETS).map(([key, preset]) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            onClick={() => applyPreset(key)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Protection Checklist */}
      <Alert>
        <Shield className="w-4 h-4" />
        <AlertDescription>
          <strong>Protection Status:</strong>
          {' '}
          {policy.protect_content ? (
            <Badge className="bg-green-600">Active</Badge>
          ) : (
            <Badge variant="outline">Disabled</Badge>
          )}
          {' • '}
          Copy: {policy.copy_mode}
          {' • '}
          Download: {policy.download_mode}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Protection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Core Protection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Protect Content</Label>
              <Switch
                checked={policy.protect_content}
                onCheckedChange={(v) => setPolicy({...policy, protect_content: v})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Require Payment</Label>
              <Switch
                checked={policy.require_payment_for_materials}
                onCheckedChange={(v) => setPolicy({...policy, require_payment_for_materials: v})}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Block Right-Click</Label>
              <Switch
                checked={policy.block_right_click}
                onCheckedChange={(v) => setPolicy({...policy, block_right_click: v})}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Block Copy</Label>
              <Switch
                checked={policy.block_copy}
                onCheckedChange={(v) => setPolicy({...policy, block_copy: v})}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Block Print</Label>
              <Switch
                checked={policy.block_print}
                onCheckedChange={(v) => setPolicy({...policy, block_print: v})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Allow Previews</Label>
              <Switch
                checked={policy.allow_previews}
                onCheckedChange={(v) => setPolicy({...policy, allow_previews: v})}
              />
            </div>

            {policy.allow_previews && (
              <>
                <div className="space-y-2">
                  <Label>Max Preview (seconds)</Label>
                  <Slider
                    value={[policy.max_preview_seconds || 90]}
                    onValueChange={([v]) => setPolicy({...policy, max_preview_seconds: v})}
                    min={30}
                    max={300}
                    step={10}
                  />
                  <p className="text-xs text-slate-500">{policy.max_preview_seconds || 90}s</p>
                </div>

                <div className="space-y-2">
                  <Label>Max Preview (characters)</Label>
                  <Slider
                    value={[policy.max_preview_chars || 1500]}
                    onValueChange={([v]) => setPolicy({...policy, max_preview_chars: v})}
                    min={500}
                    max={5000}
                    step={100}
                  />
                  <p className="text-xs text-slate-500">{policy.max_preview_chars || 1500} chars</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Watermark */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Watermark</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Watermark</Label>
              <Switch
                checked={policy.watermark_enabled}
                onCheckedChange={(v) => setPolicy({...policy, watermark_enabled: v})}
              />
            </div>

            {policy.watermark_enabled && (
              <div className="space-y-2">
                <Label>Opacity</Label>
                <Slider
                  value={[(policy.watermark_opacity || 0.18) * 100]}
                  onValueChange={([v]) => setPolicy({...policy, watermark_opacity: v / 100})}
                  min={5}
                  max={50}
                  step={1}
                />
                <p className="text-xs text-slate-500">{((policy.watermark_opacity || 0.18) * 100).toFixed(0)}%</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Licensing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Copy & Download Rights</CardTitle>
            <CardDescription>Monetize additional usage rights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Copy Mode</Label>
              <Select 
                value={policy.copy_mode || 'DISALLOW'} 
                onValueChange={(v) => setPolicy({...policy, copy_mode: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISALLOW">Disallow</SelectItem>
                  <SelectItem value="INCLUDED_WITH_ACCESS">Included</SelectItem>
                  <SelectItem value="ADDON">Paid Add-on</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Download Mode</Label>
              <Select 
                value={policy.download_mode || 'DISALLOW'} 
                onValueChange={(v) => setPolicy({...policy, download_mode: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISALLOW">Disallow</SelectItem>
                  <SelectItem value="INCLUDED_WITH_ACCESS">Included</SelectItem>
                  <SelectItem value="ADDON">Paid Add-on</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(policy.copy_mode === 'ADDON' || policy.download_mode === 'ADDON') && (
              <Alert className="bg-blue-50 border-blue-200">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  Create add-on offers in Monetization dashboard with type COPY_LICENSE or DOWNLOAD_LICENSE
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} size="lg" className="w-full">
        Save Protection Settings
      </Button>
    </div>
  );
}