import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
              <p className="text-slate-600 mb-6">
                An error occurred while loading this page
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full"
                >
                  Reload Page
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="w-full"
                >
                  Go Back
                </Button>
              </div>
              {this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-xs text-slate-500 cursor-pointer">
                    Technical details
                  </summary>
                  <pre className="text-xs bg-slate-100 p-2 rounded mt-2 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;