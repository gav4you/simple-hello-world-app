import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import useStorefrontContext from '../components/hooks/useStorefrontContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, BookOpen, Users, ArrowRight } from 'lucide-react';

export default function SchoolLanding() {
  const [user, setUser] = useState(null);
  const { schoolSlug: slug } = useStorefrontContext();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // User not logged in - that's ok for public page
      }
    };
    loadUser();
  }, []);

  // Track page view + capture attribution
  useEffect(() => {
    if (slug) {
      // Capture attribution from URL
      import('../components/analytics/attribution').then(({ captureAttributionFromUrl }) => {
        captureAttributionFromUrl({ schoolSlug: slug });
      });
      
      // Track page view
      import('../components/analytics/track').then(({ trackPageView }) => {
        import('../components/analytics/attribution').then(({ getAttribution, attachAttribution }) => {
          base44.entities.School.filter({ slug }).then(schools => {
            if (schools[0]) {
              const attribution = getAttribution({ schoolSlug: slug });
              trackPageView({
                school_id: schools[0].id,
                user_email: user?.email,
                path: '/schoollanding',
                meta: attachAttribution({ slug }, attribution)
              });
            }
          });
        });
      });
    }
  }, [slug, user]);

  const { data: school } = useQuery({
    queryKey: ['school-by-slug', slug],
    queryFn: async () => {
      const schools = await base44.entities.School.filter({ slug });
      return schools[0];
    },
    enabled: !!slug
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['public-courses', school?.id],
    queryFn: () => base44.entities.Course.filter({
      school_id: school.id,
      is_published: true
    }, '-created_date', 6),
    enabled: !!school?.id
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials', school?.id],
    queryFn: () => base44.entities.Testimonial.filter({ school_id: school.id }, '-created_date', 6),
    enabled: !!school?.id
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ['instructors', school?.id],
    queryFn: async () => {
      const members = await base44.entities.SchoolMembership.filter({
        school_id: school.id,
        role: { $in: ['INSTRUCTOR', 'ADMIN', 'OWNER'] }
      });
      return members.slice(0, 4);
    },
    enabled: !!school?.id
  });

  if (!school) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600">School not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 px-4"
        style={{
          backgroundImage: school.hero_image_url ? `url(${school.hero_image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {school.hero_image_url && (
          <div className="absolute inset-0 bg-slate-900/80" />
        )}
        <div className="relative max-w-6xl mx-auto text-center">
          {school.logo_url && (
            <img src={school.logo_url} alt={school.name} className="w-24 h-24 mx-auto mb-6 rounded-full" />
          )}
          <h1 className="text-5xl font-bold mb-4">{school.name}</h1>
          {school.tagline && (
            <p className="text-2xl text-slate-300 mb-8">{school.tagline}</p>
          )}
          {school.description && (
            <p className="text-lg text-slate-200 max-w-3xl mx-auto mb-8">{school.description}</p>
          )}
          <div className="flex items-center justify-center space-x-4">
            <Link to={createPageUrl(`SchoolCourses?slug=${slug}`)}>
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                Browse Courses
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            {!user && (
              <Button size="lg" variant="outline" onClick={() => base44.auth.redirectToLogin()}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Featured Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {course.cover_image_url && (
                  <img 
                    src={course.cover_image_url} 
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <Link to={createPageUrl(`CourseSales?slug=${slug}&courseId=${course.id}`)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="bg-slate-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">What Students Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-4">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      {testimonial.avatar_url && (
                        <img src={testimonial.avatar_url} className="w-10 h-10 rounded-full mr-3" />
                      )}
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        {testimonial.role && (
                          <p className="text-sm text-slate-600">{testimonial.role}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructors */}
      {instructors.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Meet Our Instructors</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {instructors.map((instructor) => (
              <Card key={instructor.id} className="text-center">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Users className="w-10 h-10 text-slate-600" />
                  </div>
                  <p className="font-semibold">{instructor.user_email}</p>
                  <p className="text-sm text-slate-600">{instructor.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-lg mb-8">Join thousands of students already learning with us</p>
          <Link to={createPageUrl(`SchoolCourses?slug=${slug}`)}>
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-100">
              View All Courses
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}