import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { scopedCreate, scopedFilter, scopedUpdate } from '@/components/api/scoped';
import { useSession } from '@/components/hooks/useSession';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function Feed() {
  const { user, activeSchoolId, isLoading } = useSession();
  const [newPost, setNewPost] = useState('');
  const queryClient = useQueryClient();
useEffect(() => {
    if (!isLoading && !user) {
      try { base44.auth.redirectToLogin(); } catch {}
    }
  }, [isLoading, user]);

const { data: posts = [] } = useQuery({
    queryKey: ['posts', activeSchoolId],
    queryFn: async () => {
      if (!activeSchoolId) return [];
      return await scopedFilter('Post', activeSchoolId, {}, '-created_date', 50);
    },
    enabled: !!activeSchoolId
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => scopedCreate('Post', activeSchoolId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts', activeSchoolId]);
      setNewPost('');
      toast.success('Posted!');
    }
  });

  const likeMutation = useMutation({
    mutationFn: (post) => scopedUpdate('Post', post.id, { likes: (post.likes || 0) + 1 }, activeSchoolId, true),
    onSuccess: () => queryClient.invalidateQueries(['posts', activeSchoolId])
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-6">
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your learning journey..."
            className="mb-4"
            rows={3}
          />
          <Button onClick={() => createPostMutation.mutate({ 
            author_email: user.email, 
            author_name: user.full_name, 
            content: newPost 
          })} disabled={!newPost.trim()}>
            <Send className="w-4 h-4 mr-2" />
            Post
          </Button>
        </CardContent>
      </Card>

      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {post.author_name?.[0]}
              </div>
              <div>
                <h4 className="font-bold">{post.author_name}</h4>
                <p className="text-xs text-slate-500">{new Date(post.created_date).toLocaleDateString()}</p>
              </div>
            </div>
            <p className="text-slate-700 mb-4">{post.content}</p>
            <div className="flex items-center space-x-6 text-slate-600">
              <button onClick={() => likeMutation.mutate(post)} className="flex items-center space-x-2 hover:text-red-600">
                <Heart className="w-5 h-5" />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-blue-600">
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments_count}</span>
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}