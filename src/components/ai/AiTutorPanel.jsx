import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, BookOpen, HelpCircle, List } from 'lucide-react';
import { toast } from 'sonner';

export default function AiTutorPanel({ contextType, contextId, contextTitle, contextContent, user, schoolId }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ['ai-session', contextId],
    queryFn: async () => {
      const sessions = await base44.entities.AiTutorSession.filter({
        school_id: schoolId,
        user_email: user.email,
        context_id: contextId
      }, '-updated_date', 1);
      if (sessions[0]?.messages) {
        setMessages(sessions[0].messages);
      }
      return sessions[0];
    },
    enabled: !!contextId && !!user && !!schoolId
  });

  const askMutation = useMutation({
    mutationFn: async ({ prompt, action }) => {
      // Mock AI response for now - wire to real API later
      const mockResponse = action === 'explain' 
        ? `Here's an explanation: ${contextContent?.substring(0, 100)}... (This is a placeholder response. Real AI integration coming soon!)`
        : action === 'quiz'
        ? `Quiz time! Question 1: What is the main topic discussed? (Mock question - real AI coming soon!)`
        : `Summary: ${contextTitle} covers important concepts. (Mock summary - real AI coming soon!)`;

      const newMessages = [
        ...messages,
        { role: 'user', content: prompt },
        { role: 'assistant', content: mockResponse }
      ];

      // Save session
      if (session) {
        await base44.entities.AiTutorSession.update(session.id, {
          messages: newMessages
        });
      } else {
        await base44.entities.AiTutorSession.create({
          school_id: schoolId,
          user_email: user.email,
          context_type: contextType,
          context_id: contextId,
          messages: newMessages
        });
      }

      // Log for safety
      await base44.entities.AiTutorPolicyLog.create({
        school_id: schoolId,
        user_email: user.email,
        action: 'ALLOWED',
        reason: `AI ${action} request`
      });

      return newMessages;
    },
    onSuccess: (newMessages) => {
      setMessages(newMessages);
      setInput('');
      queryClient.invalidateQueries(['ai-session']);
    },
    onError: () => {
      toast.error('Request limit reached. Please try again later.');
    }
  });

  const handleQuickAction = (action) => {
    const prompts = {
      explain: `Explain the main concepts in "${contextTitle}"`,
      quiz: `Create quiz questions about "${contextTitle}"`,
      summarize: `Summarize the key points in "${contextTitle}"`
    };
    askMutation.mutate({ prompt: prompts[action], action });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
          Ask the Rav (AI)
          <Badge variant="secondary" className="ml-2 text-xs">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleQuickAction('explain')}
            disabled={askMutation.isPending}
          >
            <BookOpen className="w-4 h-4 mr-1" />
            Explain
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleQuickAction('quiz')}
            disabled={askMutation.isPending}
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Quiz Me
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleQuickAction('summarize')}
            disabled={askMutation.isPending}
          >
            <List className="w-4 h-4 mr-1" />
            Summarize
          </Button>
        </div>

        {/* Messages */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-50 ml-8' : 'bg-slate-50 mr-8'
            }`}>
              <p className="text-sm font-medium mb-1">
                {msg.role === 'user' ? 'You' : 'AI Tutor'}
              </p>
              <p className="text-sm text-slate-700">{msg.content}</p>
            </div>
          ))}
          {askMutation.isPending && (
            <div className="text-center py-4">
              <div className="animate-pulse text-slate-500">Thinking...</div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            rows={3}
          />
          <Button 
            onClick={() => askMutation.mutate({ prompt: input, action: 'custom' })}
            disabled={!input.trim() || askMutation.isPending}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            Ask
          </Button>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Note: AI responses are in beta. Real AI integration coming soon!
        </p>
      </CardContent>
    </Card>
  );
}