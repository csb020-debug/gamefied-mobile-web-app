import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStudent } from './useStudent';

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

  useEffect(() => {
    if (currentStudent && currentClass) {
      fetchProfileData();
    }
  }, [currentStudent, currentClass]);

  const fetchProfileData = async () => {
    try {
      await Promise.all([
        fetchUserStats(),
        fetchBadges(),
        fetchAchievements(),
        fetchRecentActivities(),
        fetchEnvironmentalImpact()
      ]);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!currentStudent || !currentClass) return;

    try {
      // Get total points from submissions
      const { data: submissions, error } = await supabase
        .from('submissions')
        .select('score')
        .eq('student_id', currentStudent.id);

      if (error) throw error;

      const totalPoints = submissions?.reduce((sum, sub) => sum + (sub.score || 0), 0) || 0;
      const level = Math.floor(totalPoints / 200) + 1; // 200 points per level
      const currentXP = totalPoints % 200;
      const nextLevelXP = 200;

      setUserStats({
        name: currentStudent.nickname,
        level,
        currentXP,
        nextLevelXP,
        totalPoints,
        streak: Math.floor(Math.random() * 20) + 1, // TODO: Calculate real streak
        joinDate: new Date(currentStudent.created_at).toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        }),
        school: currentClass.name,
        grade: currentClass.grade
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchBadges = async () => {
    if (!currentStudent) return;

    try {
      // Get earned badges from achievement_unlocks
      const { data: unlockedAchievements, error } = await supabase
        .from('achievement_unlocks')
        .select('achievement_id')
        .eq('student_id', currentStudent.id);

      if (error) throw error;

      const earnedAchievementIds = unlockedAchievements?.map(a => a.achievement_id) || [];

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

  const fetchAchievements = async () => {
    if (!currentStudent) return;

    try {
      // Get submissions to check achievement progress
      const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', currentStudent.id);

      if (error) throw error;

      const completedCount = submissions?.filter(s => s.completed).length || 0;
      const totalPoints = submissions?.reduce((sum, sub) => sum + (sub.score || 0), 0) || 0;

      const achievementList: Achievement[] = [
        { title: "First Challenge", description: "Complete your first eco-challenge", completed: completedCount > 0 },
        { title: "Game Explorer", description: "Play all 3 environmental games", completed: completedCount >= 3 },
        { title: "Learning Streak", description: "Maintain a 7-day learning streak", completed: false }, // TODO: Calculate real streak
        { title: "Points Collector", description: "Earn 1000+ eco-points", completed: totalPoints >= 1000 },
        { title: "School Leader", description: "Reach top 10 in school rankings", completed: false }, // TODO: Calculate rank
        { title: "Eco Master", description: "Reach Level 10", completed: Math.floor(totalPoints / 200) + 1 >= 10 }
      ];

      setAchievements(achievementList);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchRecentActivities = async () => {
    if (!currentStudent) return;

    try {
      // Get recent submissions with assignment details
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

      const activities: Activity[] = submissions?.map((sub: any) => ({
        date: sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Today',
        activity: `Completed ${sub.assignments?.title || 'Challenge'}`,
        points: sub.score || 0
      })) || [];

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const fetchEnvironmentalImpact = async () => {
    if (!currentStudent) return;

    try {
      // Calculate environmental impact based on completed challenges
      const { data: submissions, error } = await supabase
        .from('submissions')
        .select('score')
        .eq('student_id', currentStudent.id)
        .eq('completed', true);

      if (error) throw error;

      const totalScore = submissions?.reduce((sum, sub) => sum + (sub.score || 0), 0) || 0;

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