import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LegacyMigration() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [legacySchool, setLegacySchool] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAdmin(currentUser.role === 'admin');

      if (currentUser.role !== 'admin') {
        toast.error('Admin access required');
        return;
      }

      // Check if Legacy School exists
      const schools = await base44.entities.School.filter({ slug: 'legacy' });
      if (schools.length > 0) {
        setLegacySchool(schools[0]);
      }
    } catch (error) {
      base44.auth.redirectToLogin();
    }
  };

  const createLegacySchool = async () => {
    try {
      const school = await base44.entities.School.create({
        name: 'Legacy School',
        slug: 'legacy',
        description: 'Contains all historical content created before multi-school implementation',
        created_by_user: user.email,
        default_theme: 'system'
      });
      setLegacySchool(school);
      toast.success('Legacy School created');
      return school;
    } catch (error) {
      toast.error('Failed to create Legacy School');
      return null;
    }
  };

  const runMigration = async () => {
    setMigrating(true);
    setProgress(0);
    const migrationResults = {
      courses: 0,
      lessons: 0,
      progress: 0,
      posts: 0,
      comments: 0
    };

    try {
      let school = legacySchool;
      if (!school) {
        school = await createLegacySchool();
        if (!school) {
          setMigrating(false);
          return;
        }
      }

      // Migrate Courses
      setProgress(10);
      const courses = await base44.entities.Course.list();
      const coursesToMigrate = courses.filter(c => !c.school_id);
      for (const course of coursesToMigrate) {
        await base44.entities.Course.update(course.id, { school_id: school.id });
        migrationResults.courses++;
      }

      // Migrate Lessons
      setProgress(30);
      const lessons = await base44.entities.Lesson.list();
      const lessonsToMigrate = lessons.filter(l => !l.school_id);
      for (const lesson of lessonsToMigrate) {
        // Try to match parent course school first
        let schoolId = school.id;
        if (lesson.course_id) {
          const parentCourse = courses.find(c => c.id === lesson.course_id);
          if (parentCourse?.school_id) {
            schoolId = parentCourse.school_id;
          }
        }
        await base44.entities.Lesson.update(lesson.id, { school_id: schoolId });
        migrationResults.lessons++;
      }

      // Migrate UserProgress
      setProgress(50);
      const progressRecords = await base44.entities.UserProgress.list();
      const progressToMigrate = progressRecords.filter(p => !p.school_id);
      for (const progress of progressToMigrate) {
        let schoolId = school.id;
        // Match to course school
        if (progress.course_id) {
          const parentCourse = courses.find(c => c.id === progress.course_id);
          if (parentCourse?.school_id) {
            schoolId = parentCourse.school_id;
          }
        }
        await base44.entities.UserProgress.update(progress.id, { school_id: schoolId });
        migrationResults.progress++;
      }

      // Migrate Posts
      setProgress(70);
      const posts = await base44.entities.Post.list();
      const postsToMigrate = posts.filter(p => !p.school_id);
      for (const post of postsToMigrate) {
        await base44.entities.Post.update(post.id, { school_id: school.id });
        migrationResults.posts++;
      }

      // Migrate Comments
      setProgress(90);
      const comments = await base44.entities.Comment.list();
      const commentsToMigrate = comments.filter(c => !c.school_id);
      for (const comment of commentsToMigrate) {
        await base44.entities.Comment.update(comment.id, { school_id: school.id });
        migrationResults.comments++;
      }

      setProgress(100);
      setResults(migrationResults);
      toast.success('Migration completed successfully!');
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Migration failed: ' + error.message);
    } finally {
      setMigrating(false);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-slate-600">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <Database className="w-8 h-8 text-amber-400" />
          <h1 className="text-3xl font-bold text-white">Legacy Data Migration</h1>
        </div>
        <p className="text-slate-300">Backfill existing data to Legacy School for multi-tenant support</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legacy School Status</CardTitle>
          <CardDescription>Ensure Legacy School exists before running migration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {legacySchool ? (
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Legacy School exists</p>
                <p className="text-sm text-green-700">ID: {legacySchool.id}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">Legacy School not found</p>
                <p className="text-sm text-amber-700">Will be created during migration</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Migration Process</CardTitle>
          <CardDescription>
            This will assign all records without school_id to the Legacy School
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!migrating && !results && (
            <Button onClick={runMigration} size="lg" className="w-full">
              <Database className="w-5 h-5 mr-2" />
              Start Migration
            </Button>
          )}

          {migrating && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="text-slate-700">Migrating data...</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-slate-600">{progress}% complete</p>
            </div>
          )}

          {results && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="font-semibold text-green-900">Migration completed!</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Courses</p>
                  <p className="text-2xl font-bold text-slate-900">{results.courses}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Lessons</p>
                  <p className="text-2xl font-bold text-slate-900">{results.lessons}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Progress Records</p>
                  <p className="text-2xl font-bold text-slate-900">{results.progress}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Posts</p>
                  <p className="text-2xl font-bold text-slate-900">{results.posts}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Comments</p>
                  <p className="text-2xl font-bold text-slate-900">{results.comments}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>• This migration is idempotent - safe to run multiple times</p>
          <p>• Only records without school_id will be updated</p>
          <p>• Lessons will inherit their parent course's school when possible</p>
          <p>• Progress records will match their course's school</p>
          <p>• All community posts/comments go to Legacy School</p>
        </CardContent>
      </Card>
    </div>
  );
}