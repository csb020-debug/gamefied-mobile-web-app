import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ProfileDebug = () => {
  const { user, userProfile, loading, createUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createTestProfile = async () => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      console.log('ProfileDebug: Creating test profile for user:', user.id);
      
      const { error } = await createUserProfile(
        user.email || '',
        user.user_metadata?.full_name || user.user_metadata?.name || 'Test School Admin',
        'school_admin'
      );
      
      if (error) {
        console.error('ProfileDebug: Profile creation failed:', error);
        toast({
          title: "Error",
          description: `Failed to create profile: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('ProfileDebug: Profile created successfully');
        toast({
          title: "Success",
          description: "Profile created successfully!",
        });
        // Reload the page to see the new profile
        window.location.reload();
      }
    } catch (error: any) {
      console.error('ProfileDebug: Exception:', error);
      toast({
        title: "Error",
        description: `Exception: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Profile Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Authentication Status:</h3>
            <p className="text-sm">Loading: {loading ? 'Yes' : 'No'}</p>
            <p className="text-sm">User Authenticated: {user ? 'Yes' : 'No'}</p>
            <p className="text-sm">Profile Loaded: {userProfile ? 'Yes' : 'No'}</p>
            <p className="text-sm">Show Create Button: {!userProfile && user ? 'Yes' : 'No'}</p>
          </div>
          
          {user && (
            <div>
              <h3 className="font-semibold mb-2">User Information:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify({
                  id: user.id,
                  email: user.email,
                  metadata: user.user_metadata,
                  created_at: user.created_at
                }, null, 2)}
              </pre>
            </div>
          )}
          
          {userProfile && (
            <div>
              <h3 className="font-semibold mb-2">Profile Information:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(userProfile, null, 2)}
              </pre>
            </div>
          )}
          
          {!userProfile && user && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Profile Not Found</h3>
              <p className="text-sm text-yellow-700 mb-3">
                User is authenticated but no profile exists in the database.
                This could mean the profile creation failed during registration.
              </p>
              <Button 
                onClick={createTestProfile} 
                disabled={isCreating}
                className="bg-blue-600 hover:bg-blue-700 text-white mr-2"
              >
                {isCreating ? 'Creating Profile...' : 'Create Test Profile'}
              </Button>
              
              <Button 
                onClick={async () => {
                  if (!user) return;
                  console.log('Testing DB connection for user:', user.id);
                  
                  // Test direct query instead of RPC
                  const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();
                  
                  console.log('Direct query result:', { data, error });
                  
                  toast({
                    title: "DB Test",
                    description: error ? `Error: ${error.message}` : `Success: ${data ? 'Profile found' : 'No profile'}`,
                    variant: error ? "destructive" : "default",
                  });
                }}
                variant="outline"
                className="text-xs"
              >
                Test DB Query
              </Button>
            </div>
          )}
          
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
            <Button onClick={() => navigate('/school-admin/signup')} variant="default">
              Go to School Signup
            </Button>
            {userProfile?.role === 'school_admin' && (
              <Button 
                onClick={() => navigate('/schools/admin-dashboard')} 
                variant="default" 
                className="bg-green-600 hover:bg-green-700"
              >
                Go to Admin Dashboard
              </Button>
            )}
            
            {/* Backup Create Profile Button - Always Visible */}
            {user && (
              <Button 
                onClick={createTestProfile} 
                disabled={isCreating}
                className="bg-red-600 hover:bg-red-700 text-white text-xs"
              >
                {isCreating ? 'Creating...' : 'Force Create Profile'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileDebug;