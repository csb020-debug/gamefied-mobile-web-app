import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import DataService from '@/lib/dataService';
import config from '@/lib/config';
import { useAuthCache } from './useAuthCache';

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
  const [initialized, setInitialized] = useState(false);
  const { loadFromCache, saveToCache, clearCache, isValidCache } = useAuthCache();

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        // Try to load from cache first
        const cached = loadFromCache();
        if (cached && isValidCache(cached)) {
          setUser(cached.user);
          setUserProfile(cached.userProfile);
          if (cached.user) {
            // Verify session is still valid in background
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (!session?.user) {
                // Session expired, clear cache and state
                clearCache();
                setUser(null);
                setUserProfile(null);
                setSession(null);
              } else {
                setSession(session);
              }
            });
          }
          setLoading(false);
          setInitialized(true);
          return;
        }
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('useAuth: Error getting session:', error);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        // Load profile only if user exists and we don't have it cached
        if (session?.user && !userProfile) {
          await loadUserProfile(session.user.id);
        }
        
        setInitialized(true);
        setLoading(false);
      } catch (error) {
        console.error('useAuth: Error initializing auth:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('useAuth: Auth state changed', { event, hasUser: !!session?.user });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only reload profile if user changed or signed in
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            await loadUserProfile(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          clearCache();
        }
      }
    );

    // Initialize auth state
    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      if (!config.isConfigured()) {
        console.warn('loadUserProfile: Supabase not configured - skipping profile load');
        return;
      }

      // Check if we already have a profile for this user
      if (userProfile && userProfile.user_id === userId) {
        return;
      }

      const profile = await DataService.getUserProfile(userId);
      
      if (profile) {
        const newProfile = {
          ...profile,
          role: profile.role as 'school_admin' | 'teacher' | 'student'
        };
        setUserProfile(newProfile);
        
        // Save to cache
        saveToCache(user, newProfile);
      } else {
        setUserProfile(null);
        saveToCache(user, null);
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
      await supabase.auth.signOut();
      // Clear state immediately
      setUserProfile(null);
      setUser(null);
      setSession(null);
      clearCache();
    } catch (error) {
      console.error('useAuth: Error during sign out:', error);
      // Force clear local state even if Supabase signOut fails
      setUserProfile(null);
      setUser(null);
      setSession(null);
      clearCache();
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