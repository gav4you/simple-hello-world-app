import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function OAuth2Callback() {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Connecting to Google...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Step 1: Get the authorization code and service type from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const state = urlParams.get('state');
        
        // State contains the service type (drive, calendar, sheets, etc.)
        const service = state || 'drive';

        if (error) {
          setStatus('error');
          setMessage(`Authorization failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          return;
        }

        // Step 2: Get current user
        const user = await base44.auth.me();

        // ===== CONFIGURATION SECTION =====
        // SECURITY: Use environment variables, NOT hardcoded secrets
        // Set these in Base44 Dashboard -> Settings -> Environment Variables:
        // - GOOGLE_OAUTH_CLIENT_ID
        // 
        // CRITICAL: This flow uses Authorization Code without PKCE for simplicity
        // Backend token exchange would be more secure but requires backend functions
        // For production, implement PKCE or use app connectors instead
        
        const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '467836355270-lc5rpg2sfufl3m9dov7ab9okppvrrl33.apps.googleusercontent.com';
        const REDIRECT_URI = window.location.origin + '/oauth2callback';
        
        // Service-specific scope configurations
        // Add or modify scopes based on your app's needs
        const SERVICE_SCOPES = {
          drive: [
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.readonly'
          ],
          calendar: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
          ],
          sheets: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/spreadsheets.readonly'
          ],
          docs: [
            'https://www.googleapis.com/auth/documents',
            'https://www.googleapis.com/auth/documents.readonly'
          ],
          slides: [
            'https://www.googleapis.com/auth/presentations',
            'https://www.googleapis.com/auth/presentations.readonly'
          ],
          gmail: [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.compose'
          ],
          contacts: [
            'https://www.googleapis.com/auth/contacts.readonly',
            'https://www.googleapis.com/auth/contacts'
          ],
          youtube: [
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtube.upload'
          ],
          photos: [
            'https://www.googleapis.com/auth/photoslibrary.readonly'
          ],
          classroom: [
            'https://www.googleapis.com/auth/classroom.courses.readonly',
            'https://www.googleapis.com/auth/classroom.coursework.students'
          ],
          meet: [
            'https://www.googleapis.com/auth/meetings.space.created'
          ],
          chat: [
            'https://www.googleapis.com/auth/chat.spaces.readonly'
          ]
        };
        
        const SCOPES = SERVICE_SCOPES[service] || SERVICE_SCOPES.drive;
        
        // ===== END CONFIGURATION SECTION =====

        const serviceNames = {
          drive: 'Google Drive',
          calendar: 'Google Calendar',
          sheets: 'Google Sheets',
          docs: 'Google Docs',
          slides: 'Google Slides',
          gmail: 'Gmail',
          contacts: 'Google Contacts',
          youtube: 'YouTube',
          photos: 'Google Photos',
          classroom: 'Google Classroom',
          meet: 'Google Meet',
          chat: 'Google Chat'
        };

        setMessage(`Connecting to ${serviceNames[service] || service}...`);

        setMessage('Requesting access token...');

        // Step 3: Token exchange SECURITY NOTE:
        // This is a frontend-only OAuth flow which is less secure than backend exchange
        // For production, consider:
        // 1. Using Base44 app connectors (recommended)
        // 2. Implementing PKCE (Authorization Code with Proof Key)
        // 3. Backend function for token exchange
        //
        // Current implementation stores tokens in Base44 entities for user convenience
        // but requires CORS-enabled token endpoint (Google allows this for web apps)
        
        setStatus('error');
        setMessage('OAuth token exchange requires backend function or app connector. Please use Base44 app connectors for Google services instead of manual OAuth.');
        return;
        
        // Token exchange code removed for security - use app connectors instead
        
        // Step 4: Calculate token expiration
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

        setMessage('Storing access token securely...');

        // Step 5: Store tokens in Base44
        const existingTokens = await base44.entities.GoogleOAuthToken.filter({
          user_email: user.email,
          service: service
        });

        const tokenRecord = {
          user_email: user.email,
          service: service,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || (existingTokens[0]?.refresh_token || ''),
          expires_at: expiresAt.toISOString(),
          scopes: tokenData.scope ? tokenData.scope.split(' ') : SCOPES,
          token_type: tokenData.token_type || 'Bearer'
        };

        if (existingTokens.length > 0) {
          // Update existing token
          await base44.entities.GoogleOAuthToken.update(existingTokens[0].id, tokenRecord);
        } else {
          // Create new token record
          await base44.entities.GoogleOAuthToken.create(tokenRecord);
        }

        setStatus('success');
        setMessage(`${serviceNames[service] || service} connected successfully!`);

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);

      } catch (error) {
        console.error('OAuth error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to complete authorization');
      }
    };

    handleOAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Connecting...</h2>
            <p className="text-slate-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Success!</h2>
            <p className="text-slate-600">{message}</p>
            <p className="text-sm text-slate-500 mt-4">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Connection Failed</h2>
            <p className="text-slate-600 mb-4">{message}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Return to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}