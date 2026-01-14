import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, Eye, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SchoolModeration({ school, user, membership }) {
  const [selectedReport, setSelectedReport] = React.useState(null);
  const queryClient = useQueryClient();

  const canModerate = ['OWNER', 'ADMIN', 'MODERATOR'].includes(membership?.role);

  const { data: reports = [] } = useQuery({
    queryKey: ['reports', school.id],
    queryFn: () => base44.entities.ContentReport.filter({ school_id: school.id }, '-created_date'),
    enabled: !!school && canModerate
  });

  const resolveReportMutation = useMutation({
    mutationFn: ({ reportId }) => base44.entities.ContentReport.update(reportId, {
      status: 'RESOLVED',
      resolved_by_user: user.email,
      resolved_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      setSelectedReport(null);
      toast.success('Report resolved');
    }
  });

  const moderateContentMutation = useMutation({
    mutationFn: (data) => base44.entities.ModerationAction.create(data),
    onSuccess: () => {
      toast.success('Moderation action recorded');
    }
  });

  const handleHideContent = async (report) => {
    await moderateContentMutation.mutateAsync({
      school_id: school.id,
      moderator_user: user.email,
      action_type: 'HIDE',
      entity_type: report.entity_type,
      entity_id: report.entity_id,
      notes: 'Hidden via report'
    });

    await resolveReportMutation.mutateAsync({ reportId: report.id });
  };

  if (!canModerate) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">You don't have permission to access moderation tools</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Content Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No reports pending</p>
          ) : (
            <div className="space-y-3">
              {reports.filter(r => r.status !== 'RESOLVED').map((report) => (
                <div key={report.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="destructive">{report.reason}</Badge>
                        <Badge variant="outline">{report.entity_type}</Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{report.details}</p>
                      <p className="text-xs text-slate-500">
                        Reported by {report.reporter_user} on{' '}
                        {new Date(report.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleHideContent(report)}
                      >
                        <EyeOff className="w-4 h-4 mr-1" />
                        Hide
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveReportMutation.mutate({ reportId: report.id })}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}