import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import DataService from '@/lib/dataService';
import config from '@/lib/config';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: 'school_admin' | 'teacher' | 'student';
  school_id?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createUserProfile: (email: string, fullName?: string, role?: string, schoolId?: string) => Promise<{ error: any }>;
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
    console.log('useAuth: Setting up auth state listener');
    
    let isInitialized = false;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Auth state changed', { event, hasUser: !!session?.user });
        setSession(session);
        setUser(session?.user ?? null);
        
        // Load user profile when user changes
        if (session?.user) {
          console.log('useAuth: Loading user profile for user:', session.user.id);
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        
        // Only set loading to false after we've processed the auth state
        if (!isInitialized) {
          setLoading(false);
          isInitialized = true;
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
      
      if (!isInitialized) {
        setLoading(false);
        isInitialized = true;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('loadUserProfile: Attempting to load profile for user:', userId);
      
      if (!config.isConfigured()) {
        console.error('loadUserProfile: Supabase not configured - cannot load profile');
        return;
      }

      const profile = await DataService.getUserProfile(userId);
      
      if (profile) {
        console.log('loadUserProfile: Profile found and loaded:', profile);
        setUserProfile({
          ...profile,
          role: profile.role as 'school_admin' | 'teacher' | 'student'
        });
      } else {
        console.log('loadUserProfile: User profile not found - user needs to complete registration flow');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('loadUserProfile: Error loading user profile:', error);
      setUserProfile(null);
    }
  };

  const createDefaultProfile = async (user: User) => {
    try {
      console.log('createDefaultProfile: Creating default profile for user:', user.id);
      
      if (!config.isConfigured()) {
        console.error('Supabase not configured - cannot create profile');
        return;
      }

      const { error } = await createUserProfile(
        user.email || '',
        user.user_metadata?.name || user.user_metadata?.full_name || 'School Administrator',
        'school_admin'
      );

      if (error) {
        console.error('Failed to create default profile:', error);
      } else {
        console.log('Default profile created successfully');
        // Reload the profile
        await loadUserProfile(user.id);
      }
    } catch (error) {
      console.error('Error creating default profile:', error);
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
    // Redirect to school admin signup page after successful OAuth
    const redirectUrl = `${window.location.origin}/school-admin/signup`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    try {
      console.log('useAuth: Starting sign out process');
      await supabase.auth.signOut();
      setUserProfile(null);
      setUser(null);
      setSession(null);
      console.log('useAuth: Sign out completed successfully');
    } catch (error) {
      console.error('useAuth: Error during sign out:', error);
      // Force clear local state even if Supabase signOut fails
      setUserProfile(null);
      setUser(null);
      setSession(null);
    }
  };

  const createUserProfile = async (email: string, fullName?: string, role: string = 'teacher', schoolId?: string) => {
    if (!user) {
      return { error: { message: 'No user logged in' } };
    }

    try {
      console.log('createUserProfile: Creating profile for user:', user.id, 'with role:', role);
      
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (existingProfile && !checkError) {
        console.log('createUserProfile: Profile already exists, updating instead');
        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update({
            email: email,
            full_name: fullName,
            role: role as 'school_admin' | 'teacher' | 'student',
            school_id: schoolId,
            is_active: true
          })
          .eq('user_id', user.id)
          .select()
          .single();
          
        if (updateError) {
          console.error('createUserProfile: Update error:', updateError);
          return { error: updateError };
        }
        
        console.log('createUserProfile: Profile updated successfully:', updatedProfile);
        setUserProfile({
          ...updatedProfile,
          role: updatedProfile.role as 'school_admin' | 'teacher' | 'student'
        });
        return { error: null };
      }
      
      // Create new profile
      const profileData = {
        user_id: user.id,
        email: email,
        full_name: fullName,
        role: role as 'school_admin' | 'teacher' | 'student',
        school_id: schoolId,
        is_active: true
      };

      console.log('createUserProfile: Creating new profile with data:', profileData);
      const newProfile = await DataService.createUserProfile(profileData);
      console.log('createUserProfile: New profile created successfully:', newProfile);
      
      setUserProfile({
        ...newProfile,
        role: newProfile.role as 'school_admin' | 'teacher' | 'student'
      });
      return { error: null };
    } catch (error: any) {
      console.error('createUserProfile: Exception:', error);
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
    createUserProfile
  };
};