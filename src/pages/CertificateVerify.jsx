import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import useStorefrontContext from '../components/hooks/useStorefrontContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Award } from 'lucide-react';
import { maskEmail } from '../components/certificates/certificatesEngine';

export default function CertificateVerify() {
  const { schoolSlug } = useStorefrontContext();
  const urlParams = new URLSearchParams(window.location.search);
  const certificateId = urlParams.get('certificateId');

  const { data: school } = useQuery({
    queryKey: ['school-by-slug', schoolSlug],
    queryFn: async () => {
      const schools = await base44.entities.School.filter({ slug: schoolSlug });
      return schools[0];
    },
    enabled: !!schoolSlug
  });

  const { data: certificate } = useQuery({
    queryKey: ['certificate', school?.id, certificateId],
    queryFn: async () => {
      const certs = await base44.entities.Certificate.filter({
        school_id: school.id,
        certificate_id: certificateId
      });
      return certs[0];
    },
    enabled: !!school && !!certificateId
  });

  const { data: course } = useQuery({
    queryKey: ['course', certificate?.course_id],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({
        id: certificate.course_id,
        school_id: school.id
      });
      return courses[0];
    },
    enabled: !!certificate && !!school
  });

  // Track verification
  useEffect(() => {
    if (school && certificate) {
      import('../components/analytics/track').then(({ trackEvent }) => {
        trackEvent({
          school_id: school.id,
          event_type: 'certificate_verified',
          entity_type: 'Certificate',
          entity_id: certificate.id,
          metadata: { certificate_id: certificateId }
        });
      });
    }
  }, [school, certificate]);

  if (!school) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <XCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">School Not Found</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Certificate Not Found</h2>
            <p className="text-slate-600">
              This certificate ID is invalid or does not exist
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-green-200 shadow-2xl">
          <CardContent className="p-12">
            {/* Verified Badge */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <Badge className="bg-green-600 text-white text-lg px-4 py-1">
                Verified Certificate
              </Badge>
            </div>

            {/* School Info */}
            {school.logo_url && (
              <img 
                src={school.logo_url} 
                alt={school.name}
                className="w-16 h-16 rounded-full mx-auto mb-4"
              />
            )}
            <h1 className="text-center text-2xl font-bold text-slate-900 mb-2">
              {school.name}
            </h1>

            {/* Certificate Details */}
            <div className="bg-slate-50 rounded-lg p-6 my-8 space-y-4">
              <div className="flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
              
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-1">This certifies that</p>
                <p className="text-xl font-bold text-slate-900 mb-3">
                  {maskEmail(certificate.user_email)}
                </p>
                <p className="text-sm text-slate-600 mb-1">has successfully completed</p>
                <p className="text-2xl font-bold text-slate-900 mb-4">
                  {certificate.course_title || course?.title}
                </p>
                <p className="text-sm text-slate-600">
                  Issued on {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Certificate ID */}
            <div className="text-center text-xs text-slate-500 font-mono">
              Certificate ID: {certificate.certificate_id}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-slate-600 mt-6">
          This certificate was verified on {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}