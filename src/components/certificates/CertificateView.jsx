import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Award } from 'lucide-react';
import { format } from 'date-fns';

export default function CertificateView({ certificate }) {
  const handleDownload = () => {
    // In production, generate PDF using a service
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Certificate - ${certificate.course_title}`,
        text: `I completed ${certificate.course_title}!`,
        url: certificate.verification_url
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-amber-50 via-white to-blue-50 border-4 border-amber-400 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-blue-500 to-amber-400" />
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-blue-500 to-amber-400" />
        
        <CardContent className="p-12 print:p-16">
          <div className="text-center space-y-6">
            {/* Logo/Header */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl">
                <Award className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                Certificate of Completion
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-blue-500 mx-auto rounded-full" />
            </div>

            {/* Recipient */}
            <div className="py-8">
              <p className="text-slate-600 text-lg mb-3">This certifies that</p>
              <h2 className="text-5xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Crimson Text, serif' }}>
                {certificate.user_name}
              </h2>
              <p className="text-slate-600 text-lg mb-3">has successfully completed</p>
              <h3 className="text-3xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                {certificate.course_title}
              </h3>
              {certificate.total_hours && (
                <p className="text-slate-600">
                  Total Hours: {certificate.total_hours}
                </p>
              )}
            </div>

            {/* Instructor */}
            <div className="py-6">
              <p className="text-slate-600 mb-2">Instructed by</p>
              <p className="text-xl font-semibold text-slate-900">
                {certificate.instructor_name}
              </p>
            </div>

            {/* Date and Certificate Number */}
            <div className="border-t border-slate-300 pt-6 flex justify-between items-center">
              <div className="text-left">
                <p className="text-sm text-slate-600">Date of Completion</p>
                <p className="font-semibold text-slate-900">
                  {format(new Date(certificate.completion_date), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Certificate No.</p>
                <p className="font-semibold text-slate-900 font-mono text-xs">
                  {certificate.certificate_number}
                </p>
              </div>
            </div>

            {/* Signature Line */}
            <div className="pt-8">
              <div className="border-t-2 border-slate-900 w-64 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Breslov Academy</p>
            </div>

            {/* Grade (if applicable) */}
            {certificate.grade && (
              <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4 inline-block">
                <p className="text-sm text-green-800 mb-1">Final Grade</p>
                <p className="text-3xl font-bold text-green-900">{certificate.grade}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 print:hidden">
        <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button onClick={handleShare} variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Verification Link */}
      {certificate.verification_url && (
        <div className="text-center text-sm text-slate-600 print:block">
          <p>Verify this certificate at:</p>
          <p className="font-mono text-blue-600 break-all">
            {certificate.verification_url}
          </p>
        </div>
      )}
    </div>
  );
}