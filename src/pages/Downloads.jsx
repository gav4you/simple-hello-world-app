import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, BookOpen, Headphones, Lock } from 'lucide-react';
import { scopedFilter } from '../components/api/scoped';
import { isEntitlementActive } from '@/components/utils/entitlements';
import { toast } from 'sonner';

export default function Downloads() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [entitlements, setEntitlements] = useState([]);

  const activeEnts = useMemo(() => (entitlements || []).filter((e) => isEntitlementActive(e)), [entitlements]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const schoolId = localStorage.getItem('active_school_id');
        setActiveSchoolId(schoolId);
        
        // Load entitlements (use scoped helper)
        if (schoolId && currentUser) {
          const ents = await scopedFilter('Entitlement', schoolId, {
            user_email: currentUser.email
          });
          setEntitlements(ents);
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: downloads = [] } = useQuery({
    queryKey: ['downloads', activeSchoolId],
    queryFn: () => scopedFilter('Download', activeSchoolId, {}, '-created_date', 50),
    enabled: !!activeSchoolId
  });

  const { data: policy } = useQuery({
    queryKey: ['protection-policy', activeSchoolId],
    queryFn: async () => {
      const policies = await base44.entities.ContentProtectionPolicy.filter({ school_id: activeSchoolId });
      return policies[0] || { download_mode: 'DISALLOW' };
    },
    enabled: !!activeSchoolId
  });

  const iconMap = {
    pdf: FileText,
    ebook: BookOpen,
    audio: Headphones,
    workbook: BookOpen,
    template: FileText
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-900 to-emerald-900 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <Download className="w-12 h-12" />
          <div>
            <h1 className="text-4xl font-bold mb-2">Digital Downloads</h1>
            <p className="text-green-200 text-lg">Workbooks, eBooks & Study Materials</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {downloads.map((download) => {
          const Icon = iconMap[download.type] || FileText;

          // Check download access (expiry-aware)
          const hasDownloadLicense = activeEnts.some(e => {
            const type = e.type || e.entitlement_type;
            return type === 'DOWNLOAD_LICENSE';
          });
          const hasCourseAccess = download.course_id 
            ? activeEnts.some(e => {
                const type = e.type || e.entitlement_type;
                return (type === 'COURSE' && e.course_id === download.course_id) || type === 'ALL_COURSES';
              })
            : true;
          
          const canDownload = policy?.download_mode === 'INCLUDED_WITH_ACCESS' 
            ? hasCourseAccess
            : policy?.download_mode === 'ADDON'
            ? hasDownloadLicense
            : policy?.download_mode === 'DISALLOW'
            ? false
            : true; // Free downloads or no policy
          
          const isFree = !download.course_id || download.price === 0;
          const finalCanDownload = isFree || canDownload;
          
          return (
            <Card key={download.id} className="hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-green-600" />
                  </div>
                  <Badge>{download.type}</Badge>
                </div>

                <h3 className="font-bold text-lg text-slate-900 mb-2">{download.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{download.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {download.download_count || 0} downloads
                  </span>
                  {finalCanDownload ? (
                    <Button
                      onClick={async () => {
                        // Secure retrieval
                        const { getSecureDownloadUrl } = await import('../components/materials/materialsEngine');
                        const result = await getSecureDownloadUrl({
                          school_id: activeSchoolId,
                          download_id: download.id,
                          user_email: user.email,
                          entitlements,
                          policy
                        });
                        
                        if (result.allowed && result.url) {
                          window.open(result.url, '_blank');
                          // Update count
                          base44.entities.Download.update(download.id, {
                            download_count: (download.download_count || 0) + 1
                          }).catch(() => {});
                        } else {
                          toast.error(`Download blocked: ${result.reason}`);
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isFree ? 'Free' : 'Download'}
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      <Lock className="w-4 h-4 mr-2" />
                      License Required
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}