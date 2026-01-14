import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Accessibility, Type, Moon } from 'lucide-react';

export default function AccessibilityMenu() {
  const [fontSize, setFontSize] = useState(100);
  const [contrast, setContrast] = useState('normal');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  useEffect(() => {
    if (contrast === 'high') {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [contrast]);

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-2xl z-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Accessibility className="w-5 h-5" />
          <span>Accessibility</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 flex items-center">
            <Type className="w-4 h-4 mr-2" />
            Font Size: {fontSize}%
          </label>
          <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={80} max={150} step={10} />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Contrast</label>
          <div className="flex space-x-2">
            <Button variant={contrast === 'normal' ? 'default' : 'outline'} size="sm" onClick={() => setContrast('normal')}>
              Normal
            </Button>
            <Button variant={contrast === 'high' ? 'default' : 'outline'} size="sm" onClick={() => setContrast('high')}>
              High
            </Button>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setReducedMotion(!reducedMotion)}
        >
          {reducedMotion ? 'Enable' : 'Disable'} Animations
        </Button>
      </CardContent>
    </Card>
  );
}