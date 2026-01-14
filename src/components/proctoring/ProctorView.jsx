import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Camera, Monitor } from 'lucide-react';

export default function ProctorView({ sessionId, onViolation }) {
  const videoRef = useRef(null);
  const [violations, setViolations] = useState([]);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Webcam access denied');
      }
    };
    startWebcam();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Proctoring Active</span>
          </div>
          <Badge className="bg-red-600">Recording</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <video ref={videoRef} autoPlay muted className="w-full rounded-lg mb-4" />
        <div className="space-y-2">
          <div className="flex items-center text-sm text-slate-600">
            <Monitor className="w-4 h-4 mr-2" />
            <span>Screen monitoring active</span>
          </div>
          {violations.length > 0 && (
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center text-orange-800 text-sm">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span>{violations.length} violation(s) detected</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}