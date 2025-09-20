import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const QuickConnectionTest = () => {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testQuickConnection = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log('🔍 Starting Supabase connection diagnostic...');
      
      // Step 1: Check environment variables
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      console.log('Environment check:', {
        url: url ? 'LOADED' : 'MISSING',
        urlValue: url,
        key: key ? 'LOADED' : 'MISSING',
        keyLength: key?.length || 0
      });

      if (!url || !key) {
        throw new Error('Environment variables not loaded. Please check .env.local file.');
      }

      // Step 2: Test basic ping to Supabase (just check if URL is reachable)
      const pingUrl = `${url}/rest/v1/`;
      console.log('Testing ping to:', pingUrl);
      
      const pingResponse = await fetch(pingUrl, {
        method: 'GET',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });

      console.log('Ping response:', {
        status: pingResponse.status,
        statusText: pingResponse.statusText,
        ok: pingResponse.ok
      });

      if (!pingResponse.ok) {
        throw new Error(`API not reachable. Status: ${pingResponse.status} ${pingResponse.statusText}`);
      }

      // Step 3: Test Supabase client initialization
      console.log('Testing Supabase client...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('Session check:', {
        hasSession: !!session,
        error: sessionError?.message
      });

      // Step 4: Test basic database query (simplest possible)
      console.log('Testing database query...');
      const { data, error, status } = await supabase
        .from('schools')
        .select('count', { count: 'exact', head: true });

      console.log('Database query result:', {
        status,
        error: error?.message,
        hasData: !!data
      });

      if (error) {
        // Analyze the error type
        let errorAnalysis = 'Unknown error';
        if (error.code === 'PGRST116') {
          errorAnalysis = 'Table not found - Database schema not set up';
        } else if (error.code === 'PGRST301') {
          errorAnalysis = 'Permission denied - RLS policy issue';
        } else if (error.message?.includes('JWT')) {
          errorAnalysis = 'Invalid API key';
        } else if (error.message?.includes('timeout')) {
          errorAnalysis = 'Connection timeout - Network issue';
        }
        
        setResult({
          success: false,
          stage: 'Database Query',
          error: error.message,
          errorCode: error.code,
          errorAnalysis,
          environment: { urlOk: !!url, keyOk: !!key },
          apiReachable: pingResponse.ok
        });
      } else {
        setResult({
          success: true,
          message: 'Supabase connection working perfectly!',
          environment: { urlOk: !!url, keyOk: !!key },
          apiReachable: pingResponse.ok,
          databaseAccessible: true
        });
      }

    } catch (error: any) {
      console.error('Connection test failed:', error);
      
      let stage = 'Unknown';
      if (error.message?.includes('Environment variables')) {
        stage = 'Environment Variables';
      } else if (error.message?.includes('API not reachable')) {
        stage = 'API Connectivity';
      } else if (error.message?.includes('fetch')) {
        stage = 'Network Request';
      }

      setResult({
        success: false,
        stage,
        error: error.message,
        stack: error.stack
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-run test when component loads
    testQuickConnection();
  }, []);

  const getStatusIcon = (success: boolean) => success ? '✅' : '❌';
  const getStatusColor = (success: boolean) => success ? 'text-green-600' : 'text-red-600';

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Supabase Connection Diagnostic</CardTitle>
        <CardDescription>
          Quick test to identify the exact connection issue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testQuickConnection}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing Connection...' : 'Retry Connection Test'}
        </Button>

        {result && (
          <div className={`p-4 rounded-lg border ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <h3 className={`font-bold text-lg mb-3 ${getStatusColor(result.success)}`}>
              {getStatusIcon(result.success)} {result.success ? 'Connection Successful!' : 'Connection Failed'}
            </h3>

            {result.success ? (
              <div className="space-y-2">
                <p className="text-green-700">🎉 Your Supabase API is connected and working properly!</p>
                <div className="text-sm text-green-600">
                  <p>✓ Environment variables loaded</p>
                  <p>✓ API endpoint reachable</p>
                  <p>✓ Database accessible</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-red-700">
                  <p><strong>Failed at:</strong> {result.stage}</p>
                  <p><strong>Error:</strong> {result.error}</p>
                  {result.errorAnalysis && (
                    <p><strong>Analysis:</strong> {result.errorAnalysis}</p>
                  )}
                  {result.errorCode && (
                    <p><strong>Error Code:</strong> {result.errorCode}</p>
                  )}
                </div>

                <div className="mt-4 p-3 bg-white rounded border">
                  <h4 className="font-semibold mb-2">🛠️ How to Fix:</h4>
                  <div className="text-sm space-y-1">
                    {result.stage === 'Environment Variables' && (
                      <div>
                        <p>1. Check your <code>.env.local</code> file exists</p>
                        <p>2. Verify it contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</p>
                        <p>3. Restart your development server</p>
                      </div>
                    )}
                    {result.stage === 'API Connectivity' && (
                      <div>
                        <p>1. Check your internet connection</p>
                        <p>2. Verify the Supabase URL is correct</p>
                        <p>3. Check if your Supabase project is active</p>
                      </div>
                    )}
                    {result.errorAnalysis === 'Table not found - Database schema not set up' && (
                      <div>
                        <p>1. Go to your Supabase Dashboard</p>
                        <p>2. Run the SQL from create_tables_manually.sql</p>
                        <p>3. Or use: npx supabase db push</p>
                      </div>
                    )}
                    {result.errorAnalysis === 'Invalid API key' && (
                      <div>
                        <p>1. Get a fresh API key from your Supabase Dashboard</p>
                        <p>2. Use the "anon/public" key, not the service role key</p>
                        <p>3. Update your .env.local file</p>
                      </div>
                    )}
                  </div>
                </div>

                {result.environment && (
                  <div className="text-xs text-gray-600">
                    <p>Environment: URL {result.environment.urlOk ? '✓' : '✗'}, Key {result.environment.keyOk ? '✓' : '✗'}</p>
                    {result.apiReachable !== undefined && <p>API Reachable: {result.apiReachable ? '✓' : '✗'}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickConnectionTest;