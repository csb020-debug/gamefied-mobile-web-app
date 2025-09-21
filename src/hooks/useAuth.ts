import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
      // Try to get user profile from existing tables
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('*, schools(name)')
        .eq('user_id', userId)
        .single();

      if (teacherData) {
        setUserProfile({
          id: teacherData.id,
          user_id: teacherData.user_id,
          email: teacherData.email,
          full_name: teacherData.full_name,
          role: 'teacher' as const,
          school_id: teacherData.school_id,
          is_active: teacherData.is_active
        });
        return;
      }

      // Check if user is a school admin
      const { data: schoolAdminData } = await supabase
        .from('school_admins')
        .select('*, schools(name)')
        .eq('user_id', userId)
        .single();

      if (schoolAdminData) {
        // Get user email from auth
        const { data: { user } } = await supabase.auth.getUser();
        setUserProfile({
          id: schoolAdminData.id,
          user_id: schoolAdminData.user_id,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || '',
          role: 'school_admin' as const,
          school_id: schoolAdminData.school_id,
          is_active: true
        });
        return;
      }

      // No profile found
      setUserProfile(null);
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
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
  };

  const createUserProfile = async (email: string, fullName?: string, role: string = 'teacher', schoolId?: string) => {
    if (!user) {
      return { error: { message: 'No user logged in' } };
    }

    try {
      if (role === 'school_admin') {
        // Create school admin record
        const { error } = await supabase
          .from('school_admins')
          .insert({
            user_id: user.id,
            school_id: schoolId
          });

        if (error) throw error;
      } else if (role === 'teacher') {
        // Create teacher record
        const { error } = await supabase
          .from('teachers')
          .insert({
            user_id: user.id,
            email: email,
            full_name: fullName,
            school_id: schoolId
          });

        if (error) throw error;
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

      // Create school admin profile
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