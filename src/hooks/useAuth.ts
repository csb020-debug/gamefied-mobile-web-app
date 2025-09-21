import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserProfile = {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: string;
  school_id?: string;
  created_at: string;
  updated_at: string;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createUserProfile: (email: string, fullName?: string, role?: string, schoolId?: string) => Promise<{ error: any }>;
  createSchoolAndAdmin: (schoolData: any, adminData: any) => Promise<{ error: any; schoolId?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Load user profile when user changes
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      // Get user profile from user_profiles table
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
        setUserProfile(null);
        return;
      }

      if (profileData) {
        setUserProfile(profileData);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
    }
  };

  const signInWithEmail = async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    console.log('Starting Google sign-in process...');
    const redirectUrl = `${window.location.origin}/`;
    console.log('Redirect URL:', redirectUrl);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      
      console.log('Google sign-in response:', { data, error });
      
      if (error) {
        console.error('Google sign-in error:', error);
      }
      
      return { error };
    } catch (err) {
      console.error('Google sign-in exception:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    console.log('=== AUTH HOOK signOut called ===');
    try {
      console.log('Calling supabase.auth.signOut()');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }
      
      console.log('Supabase signOut successful, clearing user profile');
      setUserProfile(null);
      console.log('=== AUTH HOOK signOut completed ===');
    } catch (error) {
      console.error('=== AUTH HOOK signOut failed ===', error);
      // Still clear the local state even if Supabase fails
      setUserProfile(null);
      throw error;
    }
  };

  const createUserProfile = async (email: string, fullName?: string, role: string = 'teacher', schoolId?: string) => {
    if (!user) {
      return { error: { message: 'No user logged in' } };
    }

    try {
      // Use the database function to create user profile
      const { data, error } = await supabase.rpc('create_user_profile', {
        user_id_param: user.id,
        email_param: email,
        full_name_param: fullName,
        role_param: role,
        school_id_param: schoolId
      });

      if (error) throw error;
      
      // Check if the response indicates success
      if (data && typeof data === 'object' && 'success' in data && !data.success) {
        const errorMessage = 'error' in data && typeof data.error === 'string' ? data.error : 'Unknown error';
        throw new Error(errorMessage);
      }

      await loadUserProfile(user.id);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const createSchoolAndAdmin = async (schoolData: any, adminData: any) => {
    if (!user) {
      return { error: { message: 'No user logged in' } };
    }

    try {
      // Create school first
      const { data: schoolResult, error: schoolError } = await supabase
        .from('schools')
        .insert(schoolData)
        .select()
        .single();

      if (schoolError) throw schoolError;

      // Create school admin profile using the database function
      const { error: profileError } = await createUserProfile(
        user.email || '',
        adminData.fullName,
        'school_admin',
        schoolResult.id
      );

      if (profileError) throw profileError;

      return { error: null, schoolId: schoolResult.id };
    } catch (error: any) {
      return { error };
    }
  };

  return {
    user,
    session,
    userProfile,
    loading,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    createUserProfile,
    createSchoolAndAdmin
  };
};