import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export default function OfflineMode({ lesson }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const downloadForOffline = async () => {
    try {
      // Cache video and content
      const cache = await caches.open('lesson-cache');
      await cache.add(lesson.video_url);
      setDownloaded(true);
      toast.success('Downloaded for offline viewing');
    } catch (error) {
      toast.error('Failed to download');
    }
  };

  return (
    <Card className={isOffline ? 'border-orange-400' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isOffline ? (
              <WifiOff className="w-5 h-5 text-orange-500" />
            ) : (
              <Wifi className="w-5 h-5 text-green-500" />
            )}
            <span className="text-sm font-medium">
              {isOffline ? 'Offline Mode' : 'Online'}
            </span>
          </div>
          {!downloaded && (
            <Button onClick={downloadForOffline} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}