import { useState, useEffect } from 'react';
import DataService from '@/lib/dataService';
import config from '@/lib/config';
import { useStudent } from './useStudent';
import { useAuth } from './useAuth';

interface StudentRanking {
  rank: number;
  name: string;
  school: string;
  points: number;
  streak: number;
  badge: string;
  isCurrentUser?: boolean;
}

interface SchoolRanking {
  rank: number;
  name: string;
  totalPoints: number;
  students: number;
  avgPoints: number;
  badge: string;
}

export const useLeaderboard = () => {
  const [studentLeaderboard, setStudentLeaderboard] = useState<StudentRanking[]>([]);
  const [schoolLeaderboard, setSchoolLeaderboard] = useState<SchoolRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentStudent, currentClass } = useStudent();
  const { user, userProfile } = useAuth();

  useEffect(() => {
    if (user && userProfile) {
      fetchLeaderboards(userProfile);
    } else if (user && !userProfile) {
      // User is logged in but profile is still loading
      setLoading(true);
    } else {
      // No user, clear data
      setStudentLeaderboard([]);
      setSchoolLeaderboard([]);
      setLoading(false);
    }
  }, [user, userProfile]);

  const fetchLeaderboards = async (profile?: any) => {
    try {
      if (!config.isConfigured()) {
        console.error('Supabase not configured');
        setStudentLeaderboard([]);
        setSchoolLeaderboard([]);
        setLoading(false);
        return;
      }

      await Promise.all([
        fetchStudentLeaderboard(profile),
        fetchSchoolLeaderboard()
      ]);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentLeaderboard = async (profile?: any) => {
    const currentProfile = profile || userProfile;
    if (!user || !currentProfile) return;

    try {
      const filters: any = {};
      
      // For students, only show their class
      if (currentProfile.role === 'student' && currentClass) {
        filters.classId = currentClass.id;
      }
      // For teachers, show students from their classes
      else if (currentProfile.role === 'teacher') {
        filters.teacherId = user.id;
      }
      // For school admins, show students from all classes in their school
      else if (currentProfile.role === 'school_admin' && currentProfile.school_id) {
        filters.schoolId = currentProfile.school_id;
      }
      // If no specific role or conditions, return empty
      else {
        setStudentLeaderboard([]);
        return;
      }

      const rankings = await DataService.getStudentLeaderboard(filters);
      
      // Mark current user if they're a student
      const rankingsWithCurrentUser = rankings.map(ranking => ({
        ...ranking,
        isCurrentUser: currentStudent?.id === ranking.studentId
      }));

      setStudentLeaderboard(rankingsWithCurrentUser);
    } catch (error) {
      console.error('Error fetching student leaderboard:', error);
    }
  };

  const fetchSchoolLeaderboard = async () => {
    try {
      const rankings = await DataService.getSchoolLeaderboard();
      setSchoolLeaderboard(rankings);
    } catch (error) {
      console.error('Error fetching school leaderboard:', error);
    }
  };

  const getStudentStats = () => {
    if (!currentStudent) return null;

    const studentRank = studentLeaderboard.find(s => s.isCurrentUser);
    return {
      pointsGained: studentRank?.points || 0,
      rankChange: 0, // TODO: Calculate based on historical data
      challengesDone: 0, // TODO: Get from submissions
      gamesPlayed: 0 // TODO: Get from submissions
    };
  };

  return {
    studentLeaderboard,
    schoolLeaderboard,
    loading,
    getStudentStats,
    refreshLeaderboards: fetchLeaderboards
  };
};