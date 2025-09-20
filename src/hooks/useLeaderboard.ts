import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      fetchLeaderboards();
    }
  }, [user, userProfile]);

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
    if (!user || !userProfile) return;

    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables are not configured');
      setStudentLeaderboard([]);
      return;
    }

    try {
      let classFilter = {};
      
      // For students, only show their class
      if (userProfile.role === 'student' && currentClass) {
        classFilter = { class_id: currentClass.id };
      }
      // For teachers, show students from their classes
      else if (userProfile.role === 'teacher') {
        const { data: teacherClasses, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('teacher_id', user.id);
        
        if (classError) throw classError;
        
        if (teacherClasses && teacherClasses.length > 0) {
          classFilter = { class_id: { in: teacherClasses.map(cls => cls.id) } };
        } else {
          setStudentLeaderboard([]);
          return;
        }
      }
      // For school admins, show students from all classes in their school
      else if (userProfile.role === 'school_admin' && userProfile.school_id) {
        const { data: schoolClasses, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('school_id', userProfile.school_id);
        
        if (classError) throw classError;
        
        if (schoolClasses && schoolClasses.length > 0) {
          classFilter = { class_id: { in: schoolClasses.map(cls => cls.id) } };
        } else {
          setStudentLeaderboard([]);
          return;
        }
      }
      // If no specific role or conditions, return empty
      else {
        setStudentLeaderboard([]);
        return;
      }

      // Get students with their total points
      let query = supabase
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
        `);

      // Apply the appropriate filter
      if (classFilter.class_id) {
        if (Array.isArray(classFilter.class_id.in)) {
          query = query.in('class_id', classFilter.class_id.in);
        } else {
          query = query.eq('class_id', classFilter.class_id);
        }
      }

      const { data: students, error } = await query;

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