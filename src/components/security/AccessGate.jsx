import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, ShoppingCart, Eye, Clock } from 'lucide-react';

export default function AccessGate({ 
  courseId, 
  schoolSlug,
  mode = 'LOCKED', // LOCKED | DRIP_LOCKED | PREVIEW_NOTICE
  message,
  showPreviewButton = false,
  onPreviewClick,
  showCopyLicenseCTA = false,
  showDownloadLicenseCTA = false,
  copyLicenseOfferId,
  downloadLicenseOfferId,
  dripAvailableAt,
  dripCountdownLabel
}) {
  const defaultMessage = mode === 'DRIP_LOCKED'
    ? 'This lesson will unlock soon'
    : 'This content is only available to enrolled students';
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="max-w-md">
        <CardContent className="p-8 text-center">
          {mode === 'DRIP_LOCKED' ? (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lesson Locked</h3>
              <p className="text-slate-600 mb-4">{message || defaultMessage}</p>
              
              {dripAvailableAt && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900 mb-1">Unlocks on</p>
                  <p className="text-lg font-bold text-blue-900">
                    {new Date(dripAvailableAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  {dripCountdownLabel && (
                    <p className="text-xs text-blue-700 mt-2">{dripCountdownLabel}</p>
                  )}
                </div>
              )}
              
              <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
                Back to Course
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-slate-600" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">Content Protected</h3>
              <p className="text-slate-600 mb-6">{message || defaultMessage}</p>

          <div className="space-y-3">
            {showPreviewButton && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onPreviewClick}
              >
                <Eye className="w-4 h-4 mr-2" />
                Watch Preview
              </Button>
            )}

            <Link to={createPageUrl(`CourseSales?slug=${schoolSlug}&courseId=${courseId}`)}>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Purchase Access
              </Button>
            </Link>

            {showCopyLicenseCTA && copyLicenseOfferId && (
              <Link to={createPageUrl(`SchoolCheckout?offerId=${copyLicenseOfferId}`)}>
                <Button variant="outline" className="w-full">
                  Unlock Copy Rights
                </Button>
              </Link>
            )}

            {showDownloadLicenseCTA && downloadLicenseOfferId && (
              <Link to={createPageUrl(`SchoolCheckout?offerId=${downloadLicenseOfferId}`)}>
                <Button variant="outline" className="w-full">
                  Unlock Download Rights
                </Button>
              </Link>
            )}
          </div>

              <p className="text-xs text-slate-500 mt-4">
                Need help? Contact school administration
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}