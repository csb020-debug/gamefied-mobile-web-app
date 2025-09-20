import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import config from '@/lib/config';

const SupabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    // Check environment variables using config
    setEnvVars({
      hasUrl: !!config.supabase.url,
      hasKey: !!config.supabase.anonKey,
      url: config.supabase.url?.substring(0, 30) + '...',
      key: config.supabase.anonKey?.substring(0, 30) + '...',
      isValid: config.validate()
    });

    // Test Supabase connection
    const testConnection = async () => {
      try {
        if (!config.isConfigured()) {
          setConnectionStatus('❌ Environment variables not configured');
          return;
        }

        if (!config.validate()) {
          setConnectionStatus('❌ Configuration validation failed');
          return;
        }

        console.log('Testing Supabase connection...');
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000);
        });

        const connectionPromise = supabase
          .from('user_profiles')
          .select('id')
          .limit(1);

        const { data, error } = await Promise.race([connectionPromise, timeoutPromise]);
        
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus(`❌ Error: ${error.message} (Code: ${error.code})`);
        } else {
          console.log('Supabase connection successful');
          setConnectionStatus('✅ Connected successfully!');
        }
      } catch (err: any) {
        console.error('Supabase connection exception:', err);
        setConnectionStatus(`❌ Connection failed: ${err.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-blue-100 m-4 rounded border-2 border-blue-300">
      <h3 className="text-lg font-bold mb-2">Supabase Connection Test</h3>
      <div className="space-y-2 text-sm">
        <div><strong>Environment Variables:</strong></div>
        <div>• URL: {envVars.hasUrl ? '✅' : '❌'} {envVars.url}</div>
        <div>• Key: {envVars.hasKey ? '✅' : '❌'} {envVars.key}</div>
        <div>• Valid: {envVars.isValid ? '✅' : '❌'}</div>
        <div><strong>Connection Status:</strong> {connectionStatus}</div>
      </div>
    </div>
  );
};

export default SupabaseTest;
