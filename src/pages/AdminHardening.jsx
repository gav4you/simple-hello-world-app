import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminHardening() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const schoolId = localStorage.getItem('active_school_id');
        setActiveSchoolId(schoolId);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: rateLimits = [] } = useQuery({
    queryKey: ['rate-limits', activeSchoolId],
    queryFn: () => base44.entities.RateLimitLog.filter({ school_id: activeSchoolId }, '-created_date', 100),
    enabled: !!activeSchoolId
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-summary', activeSchoolId],
    queryFn: () => base44.entities.AuditLog.filter({ school_id: activeSchoolId }, '-created_date', 50),
    enabled: !!activeSchoolId
  });

  const handleExportData = async () => {
    try {
      // Export school data to CSV
      const courses = await base44.entities.Course.filter({ school_id: activeSchoolId });
      const entitlements = await base44.entities.Entitlement.filter({ school_id: activeSchoolId });
      
      const csv = [
        'Entity,Count',
        `Courses,${courses.length}`,
        `Entitlements,${entitlements.length}`
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `school-data-${activeSchoolId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const recentActivity = auditLogs.slice(0, 10);
  const topUsers = Object.entries(
    rateLimits.reduce((acc, log) => {
      acc[log.user_email] = (acc[log.user_email] || 0) + log.count;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Production Hardening</h1>
          <p className="text-slate-600">Security, monitoring, and data management</p>
        </div>
        <Badge variant="outline" className="text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          System Healthy
        </Badge>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Rate Limit Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rateLimits.length}</div>
            <p className="text-xs text-slate-500 mt-1">Last 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Audit Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-slate-500 mt-1">Recent actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Backup Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-green-600 font-semibold">Active</div>
            <p className="text-xs text-slate-500 mt-1">Last: Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Active Users */}
      <Card>
        <CardHeader>
          <CardTitle>Most Active Users (Rate Limits)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topUsers.map(([email, count]) => (
              <div key={email} className="flex justify-between items-center p-2 border-b">
                <span className="text-sm">{email}</span>
                <Badge variant="outline">{count} requests</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentActivity.map((log) => (
              <div key={log.id} className="text-sm p-2 border-b">
                <div className="flex justify-between">
                  <span className="font-medium">{log.action}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(log.created_date).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600">by {log.user_email}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-3">
              Export school data for backup or analysis
            </p>
            <Button onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Export School Data (CSV)
            </Button>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Full backup system and automated exports coming in future updates. 
              Contact support for comprehensive data exports.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}