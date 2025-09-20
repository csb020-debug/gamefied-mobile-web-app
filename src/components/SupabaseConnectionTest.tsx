import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const SupabaseConnectionTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('=== SUPABASE CONNECTION TEST ===');
      
      // Test 1: Check environment variables
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      console.log('Environment variables:', {
        url: url ? `${url.substring(0, 20)}...` : 'MISSING',
        key: key ? `${key.substring(0, 20)}...` : 'MISSING'
      });
      
      if (!url || !key) {
        throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
      }
      
      // Test 2: Check auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', session ? 'Authenticated' : 'Not authenticated');
      
      // Test 3: Try to select from schools table (should work for everyone)
      console.log('Testing SELECT from schools...');
      const { data: schools, error: selectError } = await supabase
        .from('schools')
        .select('id, name')
        .limit(1);
        
      console.log('SELECT result:', { schools, selectError });
      
      // Test 4: Try to insert a test school
      console.log('Testing INSERT into schools...');
      const testSchoolData = {
        name: `Test School ${Date.now()}`,
        city: 'Test City',
        country: 'Test Country'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('schools')
        .insert(testSchoolData)
        .select()
        .single();
        
      console.log('INSERT result:', { insertData, insertError });
      
      // Test 5: If insert worked, clean up by deleting the test record
      if (insertData && !insertError) {
        console.log('Cleaning up test record...');
        await supabase
          .from('schools')
          .delete()
          .eq('id', insertData.id);
      }
      
      setResult({
        success: !insertError,
        environmentOK: !!url && !!key,
        session: session ? 'Authenticated' : 'Not authenticated',
        selectError: selectError?.message,
        insertError: insertError?.message,
        details: {
          url: url ? `${url.substring(0, 30)}...` : 'MISSING',
          keyLength: key ? key.length : 0,
          insertData: insertData ? 'Success' : 'Failed'
        }
      });
      
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setResult({
        success: false,
        error: error.message,
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>
          Test database connection and school creation functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testConnection}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            'Test Supabase Connection'
          )}
        </Button>
        
        {result && (
          <div className="mt-4 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">
              Test Result: {result.success ? '✅ Success' : '❌ Failed'}
            </h3>
            
            <div className="space-y-2 text-sm">
              <div>
                <strong>Environment:</strong> {result.environmentOK ? '✅ OK' : '❌ Missing vars'}
              </div>
              <div>
                <strong>Auth Session:</strong> {result.session}
              </div>
              {result.selectError && (
                <div className="text-red-600">
                  <strong>SELECT Error:</strong> {result.selectError}
                </div>
              )}
              {result.insertError && (
                <div className="text-red-600">
                  <strong>INSERT Error:</strong> {result.insertError}
                </div>
              )}
              {result.error && (
                <div className="text-red-600">
                  <strong>Connection Error:</strong> {result.error}
                </div>
              )}
              
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Technical Details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result.details || result, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p><strong>What this test does:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Checks environment variables are configured</li>
            <li>Tests database SELECT permission</li>
            <li>Tests database INSERT permission (the main issue)</li>
            <li>Shows detailed error messages for debugging</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseConnectionTest;