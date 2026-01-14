import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Zap } from 'lucide-react';

export default function AutomationBuilder({ onSave }) {
  const [automation, setAutomation] = useState({
    name: '',
    trigger: 'course_enrollment',
    actions: []
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>Create Automation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">When this happens...</label>
          <Select value={automation.trigger} onValueChange={(v) => setAutomation({...automation, trigger: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="course_enrollment">Student enrolls in course</SelectItem>
              <SelectItem value="lesson_complete">Student completes lesson</SelectItem>
              <SelectItem value="course_complete">Student completes course</SelectItem>
              <SelectItem value="inactivity">Student is inactive for X days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Do this...</label>
          <Button variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Action
          </Button>
        </div>

        <Button onClick={() => onSave?.(automation)} className="w-full">
          Create Automation
        </Button>
      </CardContent>
    </Card>
  );
}