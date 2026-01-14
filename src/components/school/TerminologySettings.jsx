import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const PRESETS = {
  breslov: {
    label: 'Breslov',
    teacher_singular: 'Rav',
    teacher_plural: 'Rabbanim',
    student_singular: 'talmid',
    student_plural: 'talmidim'
  },
  yeshiva: {
    label: 'Yeshiva',
    teacher_singular: 'Rabbi',
    teacher_plural: 'Rabbanim',
    student_singular: 'bachur',
    student_plural: 'bachurim'
  },
  generic: {
    label: 'Generic',
    teacher_singular: 'Instructor',
    teacher_plural: 'Instructors',
    student_singular: 'Student',
    student_plural: 'Students'
  }
};

export default function TerminologySettings({ school, onSave }) {
  const [preset, setPreset] = useState(school?.terminology_preset || 'breslov');
  const [terms, setTerms] = useState({
    teacher_singular: school?.teacher_singular || 'Rav',
    teacher_plural: school?.teacher_plural || 'Rabbanim',
    student_singular: school?.student_singular || 'talmid',
    student_plural: school?.student_plural || 'talmidim'
  });

  const handlePresetChange = (newPreset) => {
    setPreset(newPreset);
    setTerms(PRESETS[newPreset]);
  };

  const handleSave = async () => {
    try {
      await base44.entities.School.update(school.id, {
        terminology_preset: preset,
        ...terms
      });
      toast.success('Terminology settings saved');
      if (onSave) onSave();
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Terminology</CardTitle>
        <CardDescription>
          Customize how teachers and students are referred to throughout the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset Selector */}
        <div className="space-y-2">
          <Label>Quick Preset</Label>
          <div className="flex space-x-2">
            {Object.entries(PRESETS).map(([key, p]) => (
              <Button
                key={key}
                variant={preset === key ? 'default' : 'outline'}
                onClick={() => handlePresetChange(key)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Terms */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Teacher (Singular)</Label>
            <Input
              value={terms.teacher_singular}
              onChange={(e) => setTerms({...terms, teacher_singular: e.target.value})}
              placeholder="Rav"
            />
          </div>
          <div className="space-y-2">
            <Label>Teacher (Plural)</Label>
            <Input
              value={terms.teacher_plural}
              onChange={(e) => setTerms({...terms, teacher_plural: e.target.value})}
              placeholder="Rabbanim"
            />
          </div>
          <div className="space-y-2">
            <Label>Student (Singular)</Label>
            <Input
              value={terms.student_singular}
              onChange={(e) => setTerms({...terms, student_singular: e.target.value})}
              placeholder="talmid"
            />
          </div>
          <div className="space-y-2">
            <Label>Student (Plural)</Label>
            <Input
              value={terms.student_plural}
              onChange={(e) => setTerms({...terms, student_plural: e.target.value})}
              placeholder="talmidim"
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Terminology
        </Button>
      </CardContent>
    </Card>
  );
}