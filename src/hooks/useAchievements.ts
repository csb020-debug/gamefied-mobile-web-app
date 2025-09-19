import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStudent } from './useStudent';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  requirements: {
    type: 'points' | 'challenges' | 'games' | 'streak' | 'score';
    value: number;
    gameType?: string;
  };
}

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentStudent } = useStudent();

  // Define achievement templates
  const achievementTemplates: Achievement[] = [
    {
      id: 'first_challenge',
      name: 'First Steps',
      description: 'Complete your first eco-challenge',
      icon: '🌱',
      points: 25,
      category: 'getting_started',
      requirements: { type: 'challenges', value: 1 }
    },
    {
      id: 'points_collector_100',
      name: 'Points Collector',
      description: 'Earn 100 eco-points',
      icon: '🏆',
      points: 50,
      category: 'points',
      requirements: { type: 'points', value: 100 }
    },
    {
      id: 'points_collector_500',
      name: 'Eco Warrior',
      description: 'Earn 500 eco-points',
      icon: '🛡️',
      points: 100,
      category: 'points',
      requirements: { type: 'points', value: 500 }
    },
    {
      id: 'points_collector_1000',
      name: 'Green Champion',
      description: 'Earn 1000 eco-points',
      icon: '👑',
      points: 200,
      category: 'points',
      requirements: { type: 'points', value: 1000 }
    },
    {
      id: 'game_master_recycle',
      name: 'Waste Sorting Expert',
      description: 'Complete the Recycling Game with 80%+ accuracy',
      icon: '♻️',
      points: 75,
      category: 'games',
      requirements: { type: 'score', value: 80, gameType: 'recycle' }
    },
    {
      id: 'game_master_energy',
      name: 'Energy Expert',
      description: 'Complete the Energy Quiz with perfect score',
      icon: '⚡',
      points: 100,
      category: 'games',
      requirements: { type: 'score', value: 100, gameType: 'energy' }
    },
    {
      id: 'game_master_carbon',
      name: 'Carbon Calculator Pro',
      description: 'Complete the Carbon Calculator with low footprint',
      icon: '🌍',
      points: 125,
      category: 'games',
      requirements: { type: 'score', value: 75, gameType: 'carbon' }
    },
    {
      id: 'challenge_master',
      name: 'Challenge Master',
      description: 'Complete 10 different challenges',
      icon: '🎯',
      points: 150,
      category: 'challenges',
      requirements: { type: 'challenges', value: 10 }
    },
    {
      id: 'game_explorer',
      name: 'Game Explorer',
      description: 'Play all 3 environmental games',
      icon: '🎮',
      points: 100,
      category: 'games',
      requirements: { type: 'games', value: 3 }
    },
    {
      id: 'consistency_king',
      name: 'Consistency King',
      description: 'Maintain a 7-day learning streak',
      icon: '🔥',
      points: 150,
      category: 'streak',
      requirements: { type: 'streak', value: 7 }
    }
  ];

  useEffect(() => {
    setAchievements(achievementTemplates);
    if (currentStudent) {
      fetchUnlockedAchievements();
    }
  }, [currentStudent]);

  const fetchUnlockedAchievements = async () => {
    if (!currentStudent) return;

    try {
      const { data, error } = await supabase
        .from('achievement_unlocks')
        .select('achievement_id')
        .eq('student_id', currentStudent.id);

      if (error) throw error;

      const unlocked = data?.map(item => item.achievement_id) || [];
      setUnlockedAchievements(unlocked);
    } catch (error) {
      console.error('Error fetching unlocked achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndUnlockAchievements = async (
    totalPoints: number,
    completedChallenges: number,
    gameData?: { type: string; score: number; accuracy?: number }
  ) => {
    if (!currentStudent) return;

    const newUnlocks: string[] = [];

    for (const achievement of achievements) {
      // Skip if already unlocked
      if (unlockedAchievements.includes(achievement.id)) continue;

      let shouldUnlock = false;

      switch (achievement.requirements.type) {
        case 'points':
          shouldUnlock = totalPoints >= achievement.requirements.value;
          break;
        case 'challenges':
          shouldUnlock = completedChallenges >= achievement.requirements.value;
          break;
        case 'games':
          // This would need to track unique games played
          shouldUnlock = completedChallenges >= achievement.requirements.value;
          break;
        case 'score':
          if (gameData && gameData.type === achievement.requirements.gameType) {
            shouldUnlock = (gameData.accuracy || gameData.score) >= achievement.requirements.value;
          }
          break;
        case 'streak':
          // TODO: Implement streak tracking
          break;
      }

      if (shouldUnlock) {
        try {
          const { error } = await supabase
            .from('achievement_unlocks')
            .insert({
              student_id: currentStudent.id,
              achievement_id: achievement.id
            });

          if (!error) {
            newUnlocks.push(achievement.id);
            toast.success(`🎉 Achievement Unlocked: ${achievement.name}!`, {
              description: `+${achievement.points} bonus points!`,
              duration: 5000,
            });
          }
        } catch (error) {
          console.error('Error unlocking achievement:', error);
        }
      }
    }

    if (newUnlocks.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newUnlocks]);
    }

    return newUnlocks;
  };

  const getAchievementProgress = (achievementId: string, currentData: any) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;

    switch (achievement.requirements.type) {
      case 'points':
        return Math.min(100, (currentData.totalPoints / achievement.requirements.value) * 100);
      case 'challenges':
        return Math.min(100, (currentData.completedChallenges / achievement.requirements.value) * 100);
      case 'games':
        return Math.min(100, (currentData.uniqueGames / achievement.requirements.value) * 100);
      default:
        return 0;
    }
  };

  return {
    achievements,
    unlockedAchievements,
    loading,
    checkAndUnlockAchievements,
    getAchievementProgress,
    refreshAchievements: fetchUnlockedAchievements
  };
};