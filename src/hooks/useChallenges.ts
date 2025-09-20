import { useState, useEffect } from 'react';
import type { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useStudent } from './useStudent';
import { useAuth } from './useAuth';

type AssignmentRow = Tables<'assignments'>;
type Challenge = AssignmentRow & { type: 'game' | 'challenge' | 'quiz' };

interface Submission {
  id: string;
  assignment_id: string;
  score: number;
  completed: boolean;
  submitted_at: string | null;
}

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentStudent, currentClass } = useStudent();
  const { user, userProfile } = useAuth();

  useEffect(() => {
    if (user && userProfile) {
      fetchChallenges();
      if (currentStudent) {
        fetchSubmissions();
      }
    }
  }, [user, userProfile, currentStudent]);

  const fetchChallenges = async () => {
    if (!user || !userProfile) return;

    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables are not configured');
      setChallenges([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });

      // For students, fetch challenges from their class
      if (userProfile.role === 'student' && currentClass) {
        query = query.eq('class_id', currentClass.id);
      }
      // For teachers, fetch challenges from their classes
      else if (userProfile.role === 'teacher') {
        const { data: teacherClasses, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('teacher_id', user.id);
        
        if (classError) throw classError;
        
        if (teacherClasses && teacherClasses.length > 0) {
          const classIds = teacherClasses.map(cls => cls.id);
          query = query.in('class_id', classIds);
        } else {
          setChallenges([]);
          setLoading(false);
          return;
        }
      }
      // For school admins, fetch challenges from all classes in their school
      else if (userProfile.role === 'school_admin' && userProfile.school_id) {
        const { data: schoolClasses, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('school_id', userProfile.school_id);
        
        if (classError) throw classError;
        
        if (schoolClasses && schoolClasses.length > 0) {
          const classIds = schoolClasses.map(cls => cls.id);
          query = query.in('class_id', classIds);
        } else {
          setChallenges([]);
          setLoading(false);
          return;
        }
      }
      // If no specific role or conditions, return empty
      else {
        setChallenges([]);
        setLoading(false);
        return;
      }

      const { data, error } = await query;

      if (error) throw error;
      setChallenges((data as any) || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!currentStudent) return;

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', currentStudent.id);

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const getSubmissionForChallenge = (challengeId: string) => {
    return submissions.find(sub => sub.assignment_id === challengeId);
  };

  const completeChallenge = async (challengeId: string, score: number) => {
    if (!currentStudent) return;

    try {
      const { data, error } = await supabase
        .from('submissions')
        .upsert([{
          assignment_id: challengeId,
          student_id: currentStudent.id,
          score: score,
          completed: true,
          submitted_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Refresh submissions
      await fetchSubmissions();
      return data;
    } catch (error) {
      console.error('Error completing challenge:', error);
      throw error;
    }
  };

  const getChallengeStats = () => {
    const completedChallenges = submissions.filter(sub => sub.completed);
    const totalPoints = completedChallenges.reduce((sum, sub) => sum + (sub.score || 0), 0);
    const completionRate = challenges.length > 0 ? Math.round((completedChallenges.length / challenges.length) * 100) : 0;

    return {
      completed: completedChallenges.length,
      total: challenges.length,
      points: totalPoints,
      completionRate
    };
  };

  return {
    challenges,
    submissions,
    loading,
    getSubmissionForChallenge,
    completeChallenge,
    getChallengeStats,
    refreshChallenges: fetchChallenges
  };
};
