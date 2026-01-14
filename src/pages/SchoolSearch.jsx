import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { scopedFilter } from '../components/api/scoped';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, FileText, MessageSquare, Book } from 'lucide-react';

export default function SchoolSearch() {
  const [user, setUser] = useState(null);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const schoolId = localStorage.getItem('active_school_id');
        setActiveSchoolId(schoolId);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // SECURITY: Search metadata only (titles, descriptions) - never content bodies
  const searchFilter = (query) => ({
    school_id: activeSchoolId,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ]
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['search-courses', activeSchoolId, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const results = await base44.entities.Course.filter({
        school_id: activeSchoolId,
        is_published: true
      });
      return results.filter(c => 
        c.title?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    },
    enabled: !!activeSchoolId && debouncedQuery.length > 2
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['search-lessons', activeSchoolId, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      // SECURITY: Only search lesson titles/metadata, never content (prevents leakage)
      const results = await base44.entities.Lesson.filter({ 
        school_id: activeSchoolId,
        status: 'published'
      }, '-order', 100); // Limit to prevent performance issues
      return results.filter(l => 
        l.title?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        l.title_hebrew?.includes(debouncedQuery)
      ).slice(0, 20);
    },
    enabled: !!activeSchoolId && debouncedQuery.length > 2
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['search-posts', activeSchoolId, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const results = await base44.entities.Post.filter({ 
        school_id: activeSchoolId 
      }, '-created_date', 100); // Limit for performance
      return results.filter(p => 
        p.content?.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 20);
    },
    enabled: !!activeSchoolId && debouncedQuery.length > 2
  });

  const { data: texts = [] } = useQuery({
    queryKey: ['search-texts', activeSchoolId, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      // SECURITY: Search titles/metadata only, not full text bodies
      const results = await base44.entities.Text.filter({ 
        school_id: activeSchoolId 
      }, '-created_date', 100); // Limit for performance
      return results.filter(t => 
        t.title?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        t.source_ref?.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 20);
    },
    enabled: !!activeSchoolId && debouncedQuery.length > 2
  });

  const totalResults = courses.length + lessons.length + posts.length + texts.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search</h1>

      {/* Search Input */}
      <div className="mb-8 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search courses, lessons, posts, and texts..."
          className="pl-12 text-lg h-14"
        />
      </div>

      {debouncedQuery.length > 2 && (
        <>
          <p className="text-slate-600 mb-6">
            Found {totalResults} results for "{debouncedQuery}"
          </p>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
              <TabsTrigger value="courses">Courses ({courses.length})</TabsTrigger>
              <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
              <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
              <TabsTrigger value="texts">Texts ({texts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {courses.map(course => (
                <Link key={course.id} to={createPageUrl(`CourseDetail?id=${course.id}`)}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <BookOpen className="w-5 h-5 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
                          <Badge variant="outline" className="mt-2">Course</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {lessons.map(lesson => (
                <Link key={lesson.id} to={createPageUrl(`LessonViewerPremium?id=${lesson.id}`)}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-green-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{lesson.title}</h3>
                          {lesson.title_hebrew && (
                            <p className="text-sm text-amber-700 mb-1" dir="rtl">{lesson.title_hebrew}</p>
                          )}
                          {lesson.is_preview && (
                            <Badge variant="secondary" className="mt-2">Preview Available</Badge>
                          )}
                          <Badge variant="outline" className="mt-2">Lesson</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {posts.map(post => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="w-5 h-5 text-purple-600 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 line-clamp-3">{post.content}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">Post</Badge>
                          <span className="text-xs text-slate-500">by {post.author_name}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {texts.map(text => (
                <Link key={text.id} to={createPageUrl(`Reader?id=${text.text_id}`)}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Book className="w-5 h-5 text-amber-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{text.title}</h3>
                          {text.source_ref && (
                            <p className="text-sm text-slate-600 mb-2">{text.source_ref}</p>
                          )}
                          <Badge variant="outline" className="mt-2">Sacred Text</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {totalResults === 0 && (
                <p className="text-center text-slate-500 py-12">No results found</p>
              )}
            </TabsContent>

            <TabsContent value="courses" className="space-y-4 mt-6">
              {courses.map(course => (
                <Link key={course.id} to={createPageUrl(`CourseDetail?id=${course.id}`)}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                      <p className="text-sm text-slate-600">{course.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </TabsContent>

            <TabsContent value="lessons" className="space-y-4 mt-6">
              {lessons.map(lesson => (
                <Link key={lesson.id} to={createPageUrl(`LessonViewerPremium?id=${lesson.id}`)}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{lesson.title}</h3>
                      {lesson.title_hebrew && (
                        <p className="text-sm text-amber-700" dir="rtl">{lesson.title_hebrew}</p>
                      )}
                      {lesson.is_preview && (
                        <Badge variant="secondary" className="mt-2">Preview Available</Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </TabsContent>

            <TabsContent value="posts" className="space-y-4 mt-6">
              {posts.map(post => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-700">{post.content}</p>
                    <p className="text-xs text-slate-500 mt-2">by {post.author_name}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="texts" className="space-y-4 mt-6">
              {texts.map(text => (
                <Link key={text.id} to={createPageUrl(`Reader?id=${text.text_id}`)}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">{text.title}</h3>
                      {text.source_ref && (
                        <p className="text-sm text-slate-600">{text.source_ref}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </TabsContent>
          </Tabs>
        </>
      )}

      {debouncedQuery.length <= 2 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Enter at least 3 characters to search</p>
        </div>
      )}
    </div>
  );
}