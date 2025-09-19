import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStudent } from './useStudent';

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

  useEffect(() => {
    if (currentClass) {
      fetchLeaderboards();
    }
  }, [currentClass]);

  const fetchLeaderboards = async () => {
    try {
      await Promise.all([
        fetchStudentLeaderboard(),
        fetchSchoolLeaderboard()
      ]);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentLeaderboard = async () => {
    if (!currentClass) return;

    try {
      // Get students from the same class with their total points
      const { data: students, error } = await supabase
        .from('students')
        .select(`
          id,
          nickname,
          class_id,
          classes (
            name,
            school_id,
            schools (
              name
            )
          ),
          submissions (
            score
          )
        `)
        .eq('class_id', currentClass.id);

      if (error) throw error;

      // Calculate rankings
      const rankings = students
        ?.map((student: any) => {
          const totalPoints = student.submissions?.reduce((sum: number, sub: any) => sum + (sub.score || 0), 0) || 0;
          return {
            rank: 0, // Will be set after sorting
            name: student.nickname,
            school: student.classes?.schools?.name || currentClass.name,
            points: totalPoints,
            streak: Math.floor(Math.random() * 20) + 1, // TODO: Calculate real streak
            badge: '',
            isCurrentUser: currentStudent?.id === student.id
          };
        })
        .sort((a: any, b: any) => b.points - a.points)
        .map((student: any, index: number) => ({
          ...student,
          rank: index + 1,
          badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''
        })) || [];

      setStudentLeaderboard(rankings);
    } catch (error) {
      console.error('Error fetching student leaderboard:', error);
    }
  };

  const fetchSchoolLeaderboard = async () => {
    try {
      // Get aggregated school data
      const { data: schools, error } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          classes (
            id,
            students (
              id,
              submissions (
                score
              )
            )
          )
        `);

      if (error) throw error;

      // Calculate school rankings
      const rankings = schools
        ?.map((school: any) => {
          let totalPoints = 0;
          let studentCount = 0;

          school.classes?.forEach((cls: any) => {
            cls.students?.forEach((student: any) => {
              studentCount++;
              const studentPoints = student.submissions?.reduce((sum: number, sub: any) => sum + (sub.score || 0), 0) || 0;
              totalPoints += studentPoints;
            });
          });

          return {
            rank: 0, // Will be set after sorting
            name: school.name,
            totalPoints,
            students: studentCount,
            avgPoints: studentCount > 0 ? Math.round(totalPoints / studentCount) : 0,
            badge: ''
          };
        })
        .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
        .map((school: any, index: number) => ({
          ...school,
          rank: index + 1,
          badge: index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''
        })) || [];

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