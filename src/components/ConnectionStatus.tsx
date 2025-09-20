import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const ConnectionStatus: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  const testConnection = async () => {
    setConnectionStatus('testing');
    setErrorMessage('');
    
    try {
      // Test basic connection
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      
      if (error) {
        throw error;
      }
      
      // Test auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      setConnectionStatus('connected');
      setUser(authUser);
    } catch (error: any) {
      setConnectionStatus('error');
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {connectionStatus === 'testing' && <Loader2 className="h-5 w-5 animate-spin" />}
          {connectionStatus === 'connected' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {connectionStatus === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
          Supabase Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Status:</p>
          <p className={`font-medium ${
            connectionStatus === 'connected' ? 'text-green-600' : 
            connectionStatus === 'error' ? 'text-red-600' : 
            'text-yellow-600'
          }`}>
            {connectionStatus === 'testing' && 'Testing connection...'}
            {connectionStatus === 'connected' && '✅ Connected successfully!'}
            {connectionStatus === 'error' && '❌ Connection failed'}
          </p>
        </div>
        
        {connectionStatus === 'connected' && user && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current User:</p>
            <p className="text-sm font-medium">{user.email}</p>
          </div>
        )}
        
        {connectionStatus === 'error' && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Error:</p>
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}
        
        <Button onClick={testConnection} variant="outline" className="w-full">
          Test Connection Again
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConnectionStatus;
