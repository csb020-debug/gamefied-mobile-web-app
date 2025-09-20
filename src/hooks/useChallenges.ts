import { useState, useEffect } from 'react';
import type { Tables } from '@/integrations/supabase/types';
import DataService from '@/lib/dataService';
import config from '@/lib/config';
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
      fetchChallenges(userProfile);
      if (currentStudent) {
        fetchSubmissions();
      }
    } else if (user && !userProfile) {
      // User is logged in but profile is still loading
      setLoading(true);
    } else {
      // No user, clear data
      setChallenges([]);
      setSubmissions([]);
      setLoading(false);
    }
  }, [user, userProfile, currentStudent]);

  const fetchChallenges = async (profile?: any) => {
    const currentProfile = profile || userProfile;
    console.log('fetchChallenges called', { user: !!user, userProfile: !!currentProfile });
    
    if (!user || !currentProfile) {
      console.log('No user or userProfile, returning early');
      setChallenges([]);
      setLoading(false);
      return;
    }

    if (!config.isConfigured()) {
      console.error('Supabase environment variables are not configured');
      setChallenges([]);
      setLoading(false);
      return;
    }

    try {
      const filters: any = {};

      // For students, fetch challenges from their class
      if (currentProfile.role === 'student' && currentClass) {
        filters.classId = currentClass.id;
      }
      // For teachers, fetch challenges from their classes
      else if (currentProfile.role === 'teacher') {
        filters.teacherId = user.id;
      }
      // For school admins, fetch challenges from all classes in their school
      else if (currentProfile.role === 'school_admin' && currentProfile.school_id) {
        filters.schoolId = currentProfile.school_id;
      }
      // If no specific role or conditions, return empty
      else {
        setChallenges([]);
        setLoading(false);
        return;
      }

      const assignments = await DataService.getAssignments(filters);
      setChallenges(assignments as any);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!currentStudent) return;

    try {
      if (!config.isConfigured()) {
        console.error('Supabase not configured');
        return;
      }

      const submissions = await DataService.getSubmissions(currentStudent.id);
      setSubmissions(submissions);
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
      if (!config.isConfigured()) {
        throw new Error('Supabase not configured');
      }

      const submission = await DataService.createSubmission({
        assignment_id: challengeId,
        student_id: currentStudent.id,
        score: score,
        completed: true
      });
      
      // Refresh submissions
      await fetchSubmissions();
      return submission;
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
