import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ContentReportForm({ contentId, contentType, userEmail, onClose }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    try {
      await base44.entities.ContentModeration.create({
        content_id: contentId,
        content_type: contentType,
        reported_by: userEmail,
        reason,
        description
      });
      toast.success('Report submitted. Thank you for helping keep our community safe.');
      onClose?.();
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Flag className="w-5 h-5" />
          <span>Report Content</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Reason</label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spam">Spam</SelectItem>
              <SelectItem value="harassment">Harassment</SelectItem>
              <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
              <SelectItem value="plagiarism">Plagiarism</SelectItem>
              <SelectItem value="misinformation">Misinformation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Additional Details</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide more details..."
            rows={4}
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!reason} className="flex-1">
            Submit Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}