import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageCircle, ThumbsUp, Pin, CheckCircle, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function DiscussionThread({ discussions, courseId, lessonId, user }) {
  const [showNewPost, setShowNewPost] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.Discussion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions']);
      setTitle('');
      setContent('');
      setShowNewPost(false);
      toast.success('Posted successfully!');
    }
  });

  const replyMutation = useMutation({
    mutationFn: (data) => base44.entities.Discussion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions']);
      setReplyContent('');
      setReplyTo(null);
      toast.success('Reply posted!');
    }
  });

  const upvoteMutation = useMutation({
    mutationFn: ({ id, upvotes }) => 
      base44.entities.Discussion.update(id, { upvotes: upvotes + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions']);
    }
  });

  const handleCreatePost = () => {
    if (!title.trim() || !content.trim()) return;

    createPostMutation.mutate({
      course_id: courseId,
      lesson_id: lessonId,
      user_email: user.email,
      user_name: user.full_name,
      title,
      content
    });
  };

  const handleReply = (parentId) => {
    if (!replyContent.trim()) return;

    replyMutation.mutate({
      course_id: courseId,
      lesson_id: lessonId,
      user_email: user.email,
      user_name: user.full_name,
      content: replyContent,
      parent_id: parentId
    });
  };

  const topLevelPosts = discussions.filter(d => !d.parent_id);
  const getReplies = (parentId) => discussions.filter(d => d.parent_id === parentId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <span>Discussion ({discussions.length})</span>
        </h3>
        <Button onClick={() => setShowNewPost(!showNewPost)}>
          New Discussion
        </Button>
      </div>

      {showNewPost && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 space-y-4">
            <Input
              placeholder="Discussion title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Share your thoughts, questions, or insights..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-24"
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleCreatePost}
                disabled={createPostMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Post Discussion
              </Button>
              <Button variant="outline" onClick={() => setShowNewPost(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {topLevelPosts.length === 0 && (
          <Card className="bg-slate-50">
            <CardContent className="p-12 text-center">
              <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No discussions yet. Start the conversation!</p>
            </CardContent>
          </Card>
        )}

        {topLevelPosts.map((post) => {
          const replies = getReplies(post.id);
          
          return (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {post.is_pinned && (
                      <div className="flex items-center space-x-1 text-amber-600 text-xs mb-2">
                        <Pin className="w-3 h-3" />
                        <span>Pinned</span>
                      </div>
                    )}
                    <h4 className="font-bold text-lg text-slate-900">{post.title}</h4>
                    <div className="flex items-center space-x-3 text-sm text-slate-600 mt-1">
                      <span className="font-medium">{post.user_name}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(post.created_date))} ago</span>
                    </div>
                  </div>
                  {post.is_answered && (
                    <div className="flex items-center space-x-1 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Answered</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700 whitespace-pre-wrap">{post.content}</p>

                <div className="flex items-center space-x-4 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => upvoteMutation.mutate({ id: post.id, upvotes: post.upvotes || 0 })}
                    className="text-slate-600 hover:text-blue-600"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {post.upvotes || 0}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(replyTo === post.id ? null : post.id)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Reply ({replies.length})
                  </Button>
                </div>

                {replyTo === post.id && (
                  <div className="pl-8 border-l-2 border-blue-200">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(post.id)}
                        disabled={replyMutation.isPending}
                      >
                        Post Reply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReplyTo(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {replies.length > 0 && (
                  <div className="space-y-3 pl-8 border-l-2 border-slate-200">
                    {replies.map((reply) => (
                      <div key={reply.id} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
                          <span className="font-medium">{reply.user_name}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(reply.created_date))} ago</span>
                        </div>
                        <p className="text-slate-700 text-sm">{reply.content}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => upvoteMutation.mutate({ id: reply.id, upvotes: reply.upvotes || 0 })}
                          className="mt-2 text-xs"
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          {reply.upvotes || 0}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}