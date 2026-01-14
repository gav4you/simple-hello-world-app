import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', user?.email],
    queryFn: async () => {
      const sent = await base44.entities.Message.filter({ sender_email: user.email });
      const received = await base44.entities.Message.filter({ recipient_email: user.email });
      return [...sent, ...received].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user?.email
  });

  const sendMutation = useMutation({
    mutationFn: async (data) => await base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      setNewMessage('');
      toast.success('Message sent!');
    }
  });

  // Group messages by conversation
  const conversations = messages.reduce((acc, msg) => {
    const otherId = msg.sender_email === user?.email ? msg.recipient_email : msg.sender_email;
    if (!acc[otherId]) acc[otherId] = [];
    acc[otherId].push(msg);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <MessageCircle className="w-12 h-12" />
          <div>
            <h1 className="text-4xl font-bold">Messages</h1>
            <p className="text-slate-300">Connect with instructors and students</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">Conversations</h3>
            <div className="space-y-2">
              {Object.keys(conversations).map((email) => (
                <div
                  key={email}
                  onClick={() => setSelectedConversation(email)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === email ? 'bg-blue-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <p className="font-medium text-sm">{email}</p>
                  <p className="text-xs text-slate-600 truncate">
                    {conversations[email][0]?.content}
                  </p>
                </div>
              ))}
              {Object.keys(conversations).length === 0 && (
                <p className="text-center text-slate-500 py-8">No messages yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <div className="md:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardContent className="flex-1 p-4 overflow-y-auto">
              {selectedConversation ? (
                <div className="space-y-4">
                  {conversations[selectedConversation]?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_email === user?.email ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          msg.sender_email === user?.email
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.created_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  Select a conversation to view messages
                </div>
              )}
            </CardContent>
            {selectedConversation && (
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    rows={2}
                  />
                  <Button
                    onClick={() => sendMutation.mutate({
                      sender_email: user.email,
                      recipient_email: selectedConversation,
                      content: newMessage
                    })}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}