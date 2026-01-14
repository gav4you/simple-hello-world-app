import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Shield } from 'lucide-react';
import { scopedFilter } from '../components/api/scoped';
import { isSchoolAdmin } from '../components/auth/roles';

export default function AuditLogViewer() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [membership, setMembership] = useState(null);
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterEmail, setFilterEmail] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const schoolId = localStorage.getItem('active_school_id');
        setActiveSchoolId(schoolId);
        
        const memberships = await base44.entities.SchoolMembership.filter({
          school_id: schoolId,
          user_email: currentUser.email
        });
        
        if (memberships.length === 0 || !isSchoolAdmin(memberships[0].role)) {
          return;
        }
        
        setMembership(memberships[0]);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: logs = [] } = useQuery({
    queryKey: ['audit-logs', activeSchoolId, filterAction, filterEmail],
    queryFn: async () => {
      const filters = {};
      if (filterAction !== 'ALL') filters.action = filterAction;
      if (filterEmail) filters.user_email = filterEmail;
      
      return scopedFilter('AuditLog', activeSchoolId, filters, '-created_date', 200);
    },
    enabled: !!activeSchoolId && !!membership
  });

  if (!membership || !isSchoolAdmin(membership.role)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Card>
          <CardContent className="p-12">
            <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-slate-600">Audit logs are only accessible to school administrators</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const actionTypes = ['ALL', 'STAFF_INVITED', 'STAFF_REMOVED', 'ENTITLEMENT_GRANTED', 
    'COMMISSION_CREATED', 'PAYOUT_BATCH_CREATED', 'APPROVE_TRANSACTION', 'DOWNLOAD_GRANTED',
    'DOWNLOAD_BLOCKED', 'SUBSCRIPTION_RECONCILED'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Audit Log</h1>
        <p className="text-slate-600">View system activity and administrative actions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Filter by Action</Label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map(action => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filter by User Email</Label>
              <Input
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="p-3 border rounded-lg hover:bg-slate-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">{log.action}</Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(log.created_date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">{log.user_email}</span>
                        {log.entity_type && (
                          <span className="text-slate-500"> → {log.entity_type}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                        View metadata
                      </summary>
                      <pre className="text-xs bg-slate-100 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
              
              {logs.length === 0 && (
                <p className="text-slate-500 text-center py-12">No audit logs found</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}