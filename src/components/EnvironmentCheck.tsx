import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import config from '@/lib/config';

const EnvironmentCheck: React.FC = () => {
  const [envStatus, setEnvStatus] = useState<any>({});

  useEffect(() => {
    const checkEnvironment = () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      console.log('Environment check:', {
        url: url,
        key: key?.substring(0, 20) + '...',
        hasUrl: !!url,
        hasKey: !!key
      });
      
      setEnvStatus({
        hasUrl: !!url,
        hasKey: !!key,
        url: url,
        key: key?.substring(0, 20) + '...',
        urlValid: url?.startsWith('https://'),
        keyValid: key?.startsWith('eyJ'),
        isConfigured: config.isConfigured(),
        isValid: config.validate()
      });
    };

    checkEnvironment();
  }, []);

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? '✅' : '❌';
  };

  return (
    <div className="p-4 bg-yellow-50 m-4 rounded border-2 border-yellow-300">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔧</span>
            <span>Environment Variables Check</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>VITE_SUPABASE_URL:</strong>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(envStatus.hasUrl)}>
                    {getStatusIcon(envStatus.hasUrl)} {envStatus.hasUrl ? 'Present' : 'Missing'}
                  </Badge>
                  {envStatus.url && (
                    <Badge className={getStatusColor(envStatus.urlValid)}>
                      {getStatusIcon(envStatus.urlValid)} Valid Format
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-1 break-all">
                  {envStatus.url || 'Not set'}
                </div>
              </div>

              <div>
                <strong>VITE_SUPABASE_ANON_KEY:</strong>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(envStatus.hasKey)}>
                    {getStatusIcon(envStatus.hasKey)} {envStatus.hasKey ? 'Present' : 'Missing'}
                  </Badge>
                  {envStatus.key && (
                    <Badge className={getStatusColor(envStatus.keyValid)}>
                      {getStatusIcon(envStatus.keyValid)} Valid Format
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {envStatus.key || 'Not set'}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2">
                <strong>Overall Configuration:</strong>
                <Badge className={getStatusColor(envStatus.isConfigured)}>
                  {getStatusIcon(envStatus.isConfigured)} {envStatus.isConfigured ? 'Configured' : 'Not Configured'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <strong>Validation:</strong>
                <Badge className={getStatusColor(envStatus.isValid)}>
                  {getStatusIcon(envStatus.isValid)} {envStatus.isValid ? 'Valid' : 'Invalid'}
                </Badge>
              </div>
            </div>

            {!envStatus.isConfigured && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <h4 className="font-semibold text-red-800 mb-2">Environment Variables Missing!</h4>
                <p className="text-sm text-red-700 mb-2">
                  Create a <code>.env.local</code> file in your project root with:
                </p>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
                </pre>
              </div>
            )}

            {envStatus.isConfigured && !envStatus.isValid && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-semibold text-yellow-800 mb-2">Configuration Invalid!</h4>
                <p className="text-sm text-yellow-700">
                  Check that your Supabase URL starts with 'https://' and your key starts with 'eyJ'.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnvironmentCheck;
