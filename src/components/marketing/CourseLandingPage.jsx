import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Users, Clock, Award, PlayCircle } from 'lucide-react';

export default function CourseLandingPage({ course, lessons, reviews, instructorInfo }) {
  const avgRating = reviews?.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-amber-500">{course.category?.replace(/_/g, ' ')}</Badge>
              <h1 className="text-5xl font-bold mb-4">{course.title}</h1>
              {course.title_hebrew && (
                <p className="text-2xl text-blue-200 mb-6" dir="rtl">{course.title_hebrew}</p>
              )}
              <p className="text-xl text-slate-300 mb-8">{course.description}</p>
              
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-amber-400 mr-1" />
                  <span className="font-bold">{avgRating.toFixed(1)}</span>
                  <span className="text-slate-400 ml-1">({reviews?.length || 0} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  <span>1,234 students</span>
                </div>
              </div>

              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-lg px-8 py-6">
                Enroll Now - ${course.price || 'Free'}
              </Button>
            </div>

            <div className="relative">
              <Card className="overflow-hidden shadow-2xl">
                <div className="aspect-video bg-slate-800 flex items-center justify-center relative">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <PlayCircle className="w-24 h-24 text-white opacity-50" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors cursor-pointer">
                    <PlayCircle className="w-20 h-20 text-white" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* What You'll Learn */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">What You'll Learn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Deep understanding of Rebbe Nachman\'s teachings', 
            'Practical application to daily life',
            'Hebrew and Aramaic text study',
            'Connection to Breslov chassidus',
            'Spiritual growth techniques',
            'Prayer and meditation practices'].map((item, idx) => (
            <div key={idx} className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Course Content */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Course Content</h2>
          <div className="space-y-2">
            {lessons?.slice(0, 5).map((lesson, idx) => (
              <Card key={lesson.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-blue-600">{idx + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{lesson.title}</h4>
                      {lesson.duration_minutes && (
                        <p className="text-sm text-slate-600">{lesson.duration_minutes} min</p>
                      )}
                    </div>
                  </div>
                  {lesson.is_preview && (
                    <Badge variant="outline">Preview</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
            {lessons?.length > 5 && (
              <p className="text-center text-slate-600 pt-4">+ {lessons.length - 5} more lessons</p>
            )}
          </div>
        </div>
      </div>

      {/* Instructor */}
      {instructorInfo && (
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Your Instructor</h2>
          <Card>
            <CardContent className="p-8 flex items-start space-x-6">
              {instructorInfo.photo_url && (
                <img src={instructorInfo.photo_url} alt={instructorInfo.name} className="w-24 h-24 rounded-full" />
              )}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{instructorInfo.name}</h3>
                <p className="text-slate-600 mb-4">{instructorInfo.title}</p>
                <p className="text-slate-700">{instructorInfo.bio}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">Ready to Begin Your Journey?</h2>
          <p className="text-xl text-blue-200 mb-8">
            Join thousands of students learning Torah with Breslov Academy
          </p>
          <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-lg px-12 py-6">
            Enroll Now
          </Button>
        </div>
      </div>
    </div>
  );
}