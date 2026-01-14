import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollText, Search } from 'lucide-react';

export default function SchoolAuditLog({ school }) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs', school.id],
    queryFn: () => base44.entities.AuditLog.filter({ school_id: school.id }, '-created_date', 100),
    enabled: !!school
  });

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ScrollText className="w-5 h-5 mr-2" />
          Audit Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search actions..."
            className="pl-10"
          />
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-3 border rounded text-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-slate-900">{log.action}</span>
                <span className="text-xs text-slate-500">
                  {new Date(log.created_date).toLocaleString()}
                </span>
              </div>
              <p className="text-slate-600">
                by <span className="font-medium">{log.user_email}</span>
              </p>
              {log.entity_type && (
                <p className="text-xs text-slate-500 mt-1">
                  {log.entity_type}: {log.entity_id}
                </p>
              )}
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <p className="text-slate-500 text-center py-8">No audit logs found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}