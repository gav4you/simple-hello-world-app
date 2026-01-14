import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Link as LinkIcon, Calendar, FileText, Presentation, Mail, Users, Video, Image, GraduationCap, MessageSquare, Folder } from 'lucide-react';

export default function GoogleServiceConnector({ user }) {
  // Configuration for all Google services
  const services = [
    {
      id: 'drive',
      name: 'Google Drive',
      icon: Folder,
      color: 'from-yellow-500 to-yellow-600',
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly'
      ],
      description: 'Access and manage files in Google Drive'
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      description: 'Manage calendar events and schedules'
    },
    {
      id: 'sheets',
      name: 'Google Sheets',
      icon: FileText,
      color: 'from-green-500 to-green-600',
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/spreadsheets.readonly'
      ],
      description: 'Create and edit spreadsheets'
    },
    {
      id: 'docs',
      name: 'Google Docs',
      icon: FileText,
      color: 'from-blue-600 to-blue-700',
      scopes: [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/documents.readonly'
      ],
      description: 'Create and edit documents'
    },
    {
      id: 'slides',
      name: 'Google Slides',
      icon: Presentation,
      color: 'from-orange-500 to-orange-600',
      scopes: [
        'https://www.googleapis.com/auth/presentations',
        'https://www.googleapis.com/auth/presentations.readonly'
      ],
      description: 'Create and edit presentations'
    },
    {
      id: 'gmail',
      name: 'Gmail',
      icon: Mail,
      color: 'from-red-500 to-red-600',
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose'
      ],
      description: 'Send and read emails'
    },
    {
      id: 'contacts',
      name: 'Google Contacts',
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      scopes: [
        'https://www.googleapis.com/auth/contacts.readonly',
        'https://www.googleapis.com/auth/contacts'
      ],
      description: 'Manage contacts'
    },
    {
      id: 'meet',
      name: 'Google Meet',
      icon: Video,
      color: 'from-teal-500 to-teal-600',
      scopes: [
        'https://www.googleapis.com/auth/meetings.space.created'
      ],
      description: 'Create and manage video meetings'
    },
    {
      id: 'classroom',
      name: 'Google Classroom',
      icon: GraduationCap,
      color: 'from-purple-500 to-purple-600',
      scopes: [
        'https://www.googleapis.com/auth/classroom.courses.readonly',
        'https://www.googleapis.com/auth/classroom.coursework.students',
        'https://www.googleapis.com/auth/classroom.rosters.readonly'
      ],
      description: 'Integrate with Google Classroom'
    },
    {
      id: 'photos',
      name: 'Google Photos',
      icon: Image,
      color: 'from-pink-500 to-pink-600',
      scopes: [
        'https://www.googleapis.com/auth/photoslibrary.readonly'
      ],
      description: 'Access photo library'
    },
    {
      id: 'chat',
      name: 'Google Chat',
      icon: MessageSquare,
      color: 'from-emerald-500 to-emerald-600',
      scopes: [
        'https://www.googleapis.com/auth/chat.spaces.readonly',
        'https://www.googleapis.com/auth/chat.messages'
      ],
      description: 'Send and manage chat messages'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Video,
      color: 'from-red-600 to-red-700',
      scopes: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube.upload'
      ],
      description: 'Upload and manage videos'
    }
  ];

  // Fetch connected services
  const { data: connectedServices = [], refetch } = useQuery({
    queryKey: ['google-oauth-tokens', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.GoogleOAuthToken.filter({ user_email: user.email });
    },
    enabled: !!user?.email
  });

  const isConnected = (serviceId) => {
    return connectedServices.some(token => token.service === serviceId);
  };

  const handleConnect = (service) => {
    // ===== OAUTH CONFIGURATION =====
    // Update CLIENT_ID if needed
    const CLIENT_ID = '467836355270-lc5rpg2sfufl3m9dov7ab9okppvrrl33.apps.googleusercontent.com';
    const REDIRECT_URI = 'https://breslov.base44.app/oauth2callback';
    
    const scopes = service.scopes.join(' ');
    
    // Build OAuth URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('access_type', 'offline'); // Get refresh token
    authUrl.searchParams.set('prompt', 'consent'); // Force consent to get refresh token
    authUrl.searchParams.set('state', service.id); // Pass service type in state
    
    // Redirect to Google OAuth
    window.location.href = authUrl.toString();
  };

  const handleDisconnect = async (serviceId) => {
    const token = connectedServices.find(t => t.service === serviceId);
    if (token) {
      await base44.entities.GoogleOAuthToken.delete(token.id);
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Google Workspace Integration</h2>
        <p className="text-slate-600">Connect your Google services to enhance your learning experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          const connected = isConnected(service.id);

          return (
            <Card key={service.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${service.color}`} />
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      {connected && (
                        <Badge className="bg-green-100 text-green-800 mt-1">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">{service.description}</CardDescription>
              </CardHeader>

              <CardContent>
                {connected ? (
                  <Button
                    variant="outline"
                    onClick={() => handleDisconnect(service.id)}
                    className="w-full"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleConnect(service)}
                    className={`w-full bg-gradient-to-r ${service.color} text-white hover:opacity-90`}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p><strong>1.</strong> Ensure your Google Cloud project has the required APIs enabled</p>
          <p><strong>2.</strong> Set up OAuth 2.0 credentials in Google Cloud Console</p>
          <p><strong>3.</strong> Add the redirect URI: <code className="bg-blue-100 px-2 py-1 rounded">https://breslov.base44.app/oauth2callback</code></p>
          <p><strong>4.</strong> Update the CLIENT_ID and CLIENT_SECRET in the code</p>
        </CardContent>
      </Card>
    </div>
  );
}