import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import useStorefrontContext from '../components/hooks/useStorefrontContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, Lock, Play, User } from 'lucide-react';

export default function CourseSales() {
  const [user, setUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  
  const { schoolSlug: slug, courseId } = useStorefrontContext();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Not logged in
      }
    };
    loadUser();
  }, []);

  // Track page view
  useEffect(() => {
    if (school && courseId) {
      import('../components/analytics/track').then(({ trackEvent }) => {
        trackEvent({
          school_id: school.id,
          user_email: user?.email,
          event_type: 'viewed_course_sales',
          entity_type: 'Course',
          entity_id: courseId
        });
      });
    }
  }, [school, courseId, user]);

  const { data: school } = useQuery({
    queryKey: ['school-by-slug', slug],
    queryFn: async () => {
      const schools = await base44.entities.School.filter({ slug });
      return schools[0];
    },
    enabled: !!slug
  });

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order'),
    enabled: !!courseId
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['course-reviews', courseId],
    queryFn: () => base44.entities.CourseReview.filter({ course_id: courseId }, '-created_date', 10),
    enabled: !!courseId
  });

  const { data: offers = [] } = useQuery({
    queryKey: ['course-offers', school?.id, courseId],
    queryFn: async () => {
      const allOffers = await base44.entities.Offer.filter({ school_id: school.id });
      return allOffers.filter(o => 
        o.offer_type === 'COURSE' && o.courses?.includes(courseId) ||
        o.offer_type === 'ALL_COURSES'
      );
    },
    enabled: !!school?.id && !!courseId
  });

  const { data: entitlements = [] } = useQuery({
    queryKey: ['my-entitlements', user?.email, school?.id],
    queryFn: () => base44.entities.Entitlement.filter({
      school_id: school.id,
      user_email: user.email
    }),
    enabled: !!user && !!school
  });

  useEffect(() => {
    if (user && entitlements.length > 0 && course) {
      const hasAllCourses = entitlements.some(e => e.entitlement_type === 'ALL_COURSES');
      const hasCourse = entitlements.some(e => 
        e.entitlement_type === 'COURSE' && e.course_id === course.id
      );
      setHasAccess(hasAllCourses || hasCourse);
    }
  }, [user, entitlements, course]);

  if (!course || !school) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Link to={createPageUrl(`SchoolCourses?slug=${slug}`)} className="text-amber-400 hover:underline mb-4 block">
            ← Back to Courses
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              {course.category && (
                <Badge className="mb-3">{course.category}</Badge>
              )}
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              {course.subtitle && (
                <p className="text-xl text-slate-300 mb-6">{course.subtitle}</p>
              )}
              <p className="text-slate-200 mb-6">{course.description}</p>
              
              <div className="flex items-center space-x-4 mb-6">
                {avgRating > 0 && (
                  <div className="flex items-center">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400 mr-1" />
                    <span className="font-semibold mr-2">{avgRating.toFixed(1)}</span>
                    <span className="text-slate-400">({reviews.length} reviews)</span>
                  </div>
                )}
                {course.created_by && (
                  <div className="flex items-center text-slate-300">
                    <User className="w-4 h-4 mr-1" />
                    {course.created_by}
                  </div>
                )}
              </div>

              {hasAccess ? (
                <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    <Play className="w-5 h-5 mr-2" />
                    Go to Course
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center space-x-3">
                  {course.access_level === 'FREE' ? (
                    user ? (
                      <Button size="lg" className="bg-green-600 hover:bg-green-700">
                        Enroll for Free
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => base44.auth.redirectToLogin()}>
                        Sign up to Enroll
                      </Button>
                    )
                  ) : (
                    user ? (
                      offers.length > 0 && (
                        <Link to={createPageUrl(`SchoolCheckout?slug=${slug}&offerId=${offers[0].id}`)}>
                          <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                            Purchase Course
                          </Button>
                        </Link>
                      )
                    ) : (
                      <Button size="lg" onClick={() => base44.auth.redirectToLogin()}>
                        Sign up to Purchase
                      </Button>
                    )
                  )}
                </div>
              )}
            </div>

            {course.cover_image_url && (
              <div>
                <img 
                  src={course.cover_image_url} 
                  alt={course.title}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* What You'll Learn */}
        {course.outcomes && course.outcomes.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What You'll Learn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.outcomes.map((outcome, i) => (
                  <div key={i} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Syllabus Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Course Syllabus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lessons.map((lesson, i) => (
                <div key={lesson.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                  <div className="flex items-center">
                    <span className="font-mono text-sm text-slate-500 mr-3">{i + 1}.</span>
                    <span className="font-medium">{lesson.title}</span>
                  </div>
                  {!hasAccess && course.access_level !== 'FREE' && (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        {reviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Student Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="font-semibold">{review.user_name || review.user_email}</span>
                    </div>
                    <p className="text-slate-700">{review.body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}