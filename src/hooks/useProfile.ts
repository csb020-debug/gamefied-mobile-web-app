import { useState, useEffect } from 'react';
import DataService from '@/lib/dataService';
import config from '@/lib/config';
import { useStudent } from './useStudent';
import { useAuth } from './useAuth';

interface Badge {
  name: string;
  icon: string;
  description: string;
  earned: boolean;
}

interface Achievement {
  title: string;
  description: string;
  completed: boolean;
}

interface Activity {
  date: string;
  activity: string;
  points: number;
}

interface UserStats {
  name: string;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalPoints: number;
  streak: number;
  joinDate: string;
  school: string;
  grade: string;
}

interface EnvironmentalImpact {
  treesPlanted: number;
  co2Offset: number;
  wasteRecycled: number;
  energySaved: number;
  friendsInspired: number;
  score: string;
}

export const useProfile = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [environmentalImpact, setEnvironmentalImpact] = useState<EnvironmentalImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentStudent, currentClass } = useStudent();
  const { user, userProfile } = useAuth();

  useEffect(() => {
    if (user && userProfile) {
      fetchProfileData(userProfile);
    } else if (user && !userProfile) {
      // User is logged in but profile is still loading
      setLoading(true);
    } else {
      // No user, clear data
      setUserStats(null);
      setBadges([]);
      setAchievements([]);
      setRecentActivities([]);
      setEnvironmentalImpact(null);
      setLoading(false);
    }
  }, [user, userProfile]);

  const fetchProfileData = async (profile?: any) => {
    try {
      await Promise.all([
        fetchUserStats(profile),
        fetchBadges(profile),
        fetchAchievements(profile),
        fetchRecentActivities(profile),
        fetchEnvironmentalImpact(profile)
      ]);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (profile?: any) => {
    const currentProfile = profile || userProfile;
    if (!user || !currentProfile) return;

    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables are not configured');
      setUserStats({
        name: currentProfile?.full_name || currentProfile?.email || 'User',
        level: 1,
        currentXP: 0,
        nextLevelXP: 200,
        totalPoints: 0,
        streak: 0,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        school: 'Demo School',
        grade: 'N/A'
      });
      return;
    }

    try {
      let totalPoints = 0;
      let name = '';
      let school = '';
      let grade = '';
      let joinDate = '';

      // For students, get their stats from submissions
      if (currentProfile.role === 'student' && currentStudent && currentClass) {
        const { data: submissions, error } = await supabase
          .from('submissions')
          .select('score')
          .eq('student_id', currentStudent.id);

        if (error) throw error;

        totalPoints = submissions?.reduce((sum, sub) => sum + (sub.score || 0), 0) || 0;
        name = currentStudent.nickname;
        school = currentClass.name;
        grade = currentClass.grade;
        joinDate = new Date(currentStudent.created_at).toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        });
      }
      // For teachers and school admins, show basic profile info
      else if (currentProfile.role === 'teacher' || currentProfile.role === 'school_admin') {
        name = currentProfile.full_name || currentProfile.email;
        school = 'Teacher/School Admin'; // TODO: Get actual school name
        grade = 'N/A';
        joinDate = new Date(currentProfile.created_at).toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        });
      }

      const level = Math.floor(totalPoints / 200) + 1; // 200 points per level
      const currentXP = totalPoints % 200;
      const nextLevelXP = 200;

      setUserStats({
        name,
        level,
        currentXP,
        nextLevelXP,
        totalPoints,
        streak: Math.floor(Math.random() * 20) + 1, // TODO: Calculate real streak
        joinDate,
        school,
        grade
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchBadges = async (profile?: any) => {
    const currentProfile = profile || userProfile;
    if (!user || !currentProfile) return;

    try {
      let earnedAchievementIds: string[] = [];

      // For students, get earned badges from achievement_unlocks
      if (currentProfile.role === 'student' && currentStudent) {
        const { data: unlockedAchievements, error } = await supabase
          .from('achievement_unlocks')
          .select('achievement_id')
          .eq('student_id', currentStudent.id);

        if (error) throw error;
        earnedAchievementIds = unlockedAchievements?.map(a => a.achievement_id) || [];
      }
      // For teachers and school admins, show some basic badges
      else if (currentProfile.role === 'teacher' || currentProfile.role === 'school_admin') {
        // Teachers and admins get some basic badges by default
        earnedAchievementIds = ['eco_educator', 'carbon_fighter'];
      }

      // Define available badges
      const allBadges: Badge[] = [
        { name: "Tree Planter", icon: "🌳", description: "Planted 5+ trees", earned: earnedAchievementIds.includes("tree_planter") },
        { name: "Quiz Master", icon: "🎯", description: "100% score on 10 quizzes", earned: earnedAchievementIds.includes("quiz_master") },
        { name: "Waste Warrior", icon: "♻️", description: "Completed waste challenges", earned: earnedAchievementIds.includes("waste_warrior") },
        { name: "Energy Saver", icon: "⚡", description: "Reduced energy by 30%", earned: earnedAchievementIds.includes("energy_saver") },
        { name: "Eco Educator", icon: "📚", description: "Taught others about environment", earned: earnedAchievementIds.includes("eco_educator") },
        { name: "Carbon Fighter", icon: "🌍", description: "Offset 100kg of CO2", earned: earnedAchievementIds.includes("carbon_fighter") }
      ];

      setBadges(allBadges);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchAchievements = async (profile?: any) => {
    const currentProfile = profile || userProfile;
    if (!user || !currentProfile) return;

    try {
      let completedCount = 0;
      let totalPoints = 0;

      // For students, get their actual progress
      if (currentProfile.role === 'student' && currentStudent) {
        const { data: submissions, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('student_id', currentStudent.id);

        if (error) throw error;

        completedCount = submissions?.filter(s => s.completed).length || 0;
        totalPoints = submissions?.reduce((sum, sub) => sum + (sub.score || 0), 0) || 0;
      }
      // For teachers and school admins, show some basic achievements
      else if (currentProfile.role === 'teacher' || currentProfile.role === 'school_admin') {
        completedCount = 5; // Teachers/admins get some completed achievements
        totalPoints = 2000; // Higher points for teachers/admins
      }

      const achievementList: Achievement[] = [
        { title: "First Challenge", description: "Complete your first eco-challenge", completed: completedCount > 0 },
        { title: "Game Explorer", description: "Play all 3 environmental games", completed: completedCount >= 3 },
        { title: "Learning Streak", description: "Maintain a 7-day learning streak", completed: currentProfile.role === 'teacher' || currentProfile.role === 'school_admin' },
        { title: "Points Collector", description: "Earn 1000+ eco-points", completed: totalPoints >= 1000 },
        { title: "School Leader", description: "Reach top 10 in school rankings", completed: currentProfile.role === 'school_admin' },
        { title: "Eco Master", description: "Reach Level 10", completed: Math.floor(totalPoints / 200) + 1 >= 10 }
      ];

      setAchievements(achievementList);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchRecentActivities = async (profile?: any) => {
    const currentProfile = profile || userProfile;
    if (!user || !currentProfile) return;

    try {
      let activities: Activity[] = [];

      // For students, get their actual activities
      if (currentProfile.role === 'student' && currentStudent) {
        const { data: submissions, error } = await supabase
          .from('submissions')
          .select(`
            *,
            assignments (
              title,
              type
            )
          `)
          .eq('student_id', currentStudent.id)
          .order('submitted_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        activities = submissions?.map((sub: any) => ({
          date: sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Today',
          activity: `Completed ${sub.assignments?.title || 'Challenge'}`,
          points: sub.score || 0
        })) || [];
      }
      // For teachers and school admins, show some sample activities
      else if (currentProfile.role === 'teacher' || currentProfile.role === 'school_admin') {
        activities = [
          { date: 'Today', activity: 'Created new eco-challenge', points: 50 },
          { date: 'Yesterday', activity: 'Reviewed student submissions', points: 30 },
          { date: '2 days ago', activity: 'Updated class curriculum', points: 40 },
          { date: '3 days ago', activity: 'Monitored student progress', points: 25 },
          { date: '1 week ago', activity: 'Set up new class', points: 100 }
        ];
      }

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const fetchEnvironmentalImpact = async (profile?: any) => {
    const currentProfile = profile || userProfile;
    if (!user || !currentProfile) return;

    try {
      let totalScore = 0;

      // For students, calculate based on their actual submissions
      if (currentProfile.role === 'student' && currentStudent) {
        const { data: submissions, error } = await supabase
          .from('submissions')
          .select('score')
          .eq('student_id', currentStudent.id)
          .eq('completed', true);

        if (error) throw error;
        totalScore = submissions?.reduce((sum, sub) => sum + (sub.score || 0), 0) || 0;
      }
      // For teachers and school admins, show higher impact
      else if (currentProfile.role === 'teacher' || currentProfile.role === 'school_admin') {
        totalScore = 3000; // Teachers/admins have higher impact
      }

      // Calculate impact metrics based on points earned
      const impact: EnvironmentalImpact = {
        treesPlanted: Math.floor(totalScore / 100), // 1 tree per 100 points
        co2Offset: Math.floor(totalScore / 10), // 1 kg CO2 per 10 points
        wasteRecycled: Math.floor(totalScore / 50), // 1 kg waste per 50 points
        energySaved: Math.floor(totalScore / 5), // 1 kWh per 5 points
        friendsInspired: Math.floor(totalScore / 200), // 1 friend per 200 points
        score: totalScore >= 1000 ? 'A+' : totalScore >= 500 ? 'A' : totalScore >= 250 ? 'B+' : 'B'
      };

      setEnvironmentalImpact(impact);
    } catch (error) {
      console.error('Error fetching environmental impact:', error);
    }
  };

  return {
    userStats,
    badges,
    achievements,
    recentActivities,
    environmentalImpact,
    loading,
    refreshProfile: fetchProfileData
  };
};