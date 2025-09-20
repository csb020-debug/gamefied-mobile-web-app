import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const EnvChecker = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Environment variables check:', {
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_ANON_KEY: key?.substring(0, 20) + '...',
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Environment Variables Check</CardTitle>
        <CardDescription>
          Quick check of your environment configuration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">VITE_SUPABASE_URL:</span>
            <span className={`text-sm ${url ? 'text-green-600' : 'text-red-600'}`}>
              {url ? `✅ ${url.substring(0, 30)}...` : '❌ Not found'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">VITE_SUPABASE_ANON_KEY:</span>
            <span className={`text-sm ${key ? 'text-green-600' : 'text-red-600'}`}>
              {key ? `✅ ${key.substring(0, 20)}...` : '❌ Not found'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-medium">Mode:</span>
            <span className="text-sm text-blue-600">
              {import.meta.env.MODE} {import.meta.env.DEV ? '(Development)' : '(Production)'}
            </span>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <strong>Status:</strong> {url && key ? 
                '✅ Environment variables are loaded correctly' : 
                '❌ Missing environment variables. Check .env.local file.'
              }
            </p>
            {(!url || !key) && (
              <div className="mt-2 text-sm text-red-600">
                <p><strong>Fix:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Ensure .env.local file exists in project root</li>
                  <li>Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
                  <li>Restart development server</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvChecker;