import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStudent } from './useStudent';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'game' | 'challenge' | 'quiz';
  due_at: string | null;
  created_at: string;
  config: {
    points: number;
    instructions: string;
    difficulty: string;
    category: string;
  };
}

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

  useEffect(() => {
    if (currentClass) {
      fetchChallenges();
      if (currentStudent) {
        fetchSubmissions();
      }
    }
  }, [currentClass, currentStudent]);

  const fetchChallenges = async () => {
    if (!currentClass) return;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', currentClass.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
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
