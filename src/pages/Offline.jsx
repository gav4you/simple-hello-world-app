import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Trash2, HardDrive } from 'lucide-react';
import { toast } from 'sonner';

export default function Offline() {
  const [user, setUser] = useState(null);
  const [cachedItems, setCachedItems] = useState([]);
  const [storageUsed, setStorageUsed] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        loadCachedData();
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const loadCachedData = () => {
    try {
      const cached = JSON.parse(localStorage.getItem('offline_cache') || '[]');
      setCachedItems(cached);
      
      // Estimate storage (rough)
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length;
        }
      }
      setStorageUsed(Math.round(total / 1024)); // KB
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  };

  const handleDownloadCourse = async (courseId) => {
    try {
      // Fetch course data
      const courses = await base44.entities.Course.filter({ id: courseId });
      const course = courses[0];
      
      const lessons = await base44.entities.Lesson.filter({ course_id: courseId });
      
      // Store in localStorage
      const cacheData = {
        id: courseId,
        type: 'course',
        title: course.title,
        data: { course, lessons },
        cachedAt: new Date().toISOString()
      };
      
      const existing = JSON.parse(localStorage.getItem('offline_cache') || '[]');
      existing.push(cacheData);
      localStorage.setItem('offline_cache', JSON.stringify(existing));
      
      toast.success('Course downloaded for offline access!');
      loadCachedData();
    } catch (error) {
      toast.error('Failed to download course');
    }
  };

  const handleRemoveCache = (id) => {
    const existing = JSON.parse(localStorage.getItem('offline_cache') || '[]');
    const filtered = existing.filter(item => item.id !== id);
    localStorage.setItem('offline_cache', JSON.stringify(filtered));
    toast.success('Removed from offline storage');
    loadCachedData();
  };

  const storagePercent = Math.min((storageUsed / 5000) * 100, 100); // Assume 5MB limit

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Offline Study</h1>
        <p className="text-slate-600">Download content for offline access</p>
      </div>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="w-5 h-5 mr-2" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>{storageUsed} KB used</span>
              <span>~5 MB available</span>
            </div>
            <Progress value={storagePercent} />
          </div>
        </CardContent>
      </Card>

      {/* Cached Items */}
      <Card>
        <CardHeader>
          <CardTitle>Downloaded Content</CardTitle>
        </CardHeader>
        <CardContent>
          {cachedItems.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No offline content yet</p>
          ) : (
            <div className="space-y-3">
              {cachedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      Downloaded {new Date(item.cachedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveCache(item.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Offline Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>1. Download courses or texts for offline access using the download button</p>
          <p>2. Your highlights and notes are automatically saved locally</p>
          <p>3. When online, changes will sync automatically</p>
          <p className="text-amber-600 font-medium mt-4">
            Note: Offline functionality is limited in this version. Full PWA support coming soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}