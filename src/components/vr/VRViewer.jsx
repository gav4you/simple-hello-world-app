import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize, Eye } from 'lucide-react';

export default function VRViewer({ experience }) {
  const containerRef = useRef(null);

  const enterFullscreen = () => {
    if (containerRef.current) {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>VR Experience: {experience?.title}</span>
          </div>
          <Button size="sm" onClick={enterFullscreen}>
            <Maximize className="w-4 h-4 mr-2" />
            Fullscreen
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
          {experience?.experience_type === '360_video' ? (
            <video
              src={experience.vr_content_url}
              controls
              className="w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <Eye className="w-16 h-16 mx-auto mb-4" />
                <p>VR Content Loading...</p>
                {experience?.requires_headset && (
                  <p className="text-sm text-slate-400 mt-2">VR Headset Required</p>
                )}
              </div>
            </div>
          )}
        </div>
        <p className="text-sm text-slate-600 mt-4">{experience?.description}</p>
      </CardContent>
    </Card>
  );
}