import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  BookOpen, 
  GamepadIcon, 
  Award,
  Lock,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useStudent } from '@/hooks/useStudent';
import { useChallenges } from '@/hooks/useChallenges';
import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'points' | 'streak' | 'completion' | 'special';
  requirement: number;
  points: number;
  unlocked: boolean;
  progress: number;
  unlockedAt?: string;
}

interface AchievementSystemProps {
  studentId: string;
  classId: string;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ studentId, classId }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUnlocks, setNewUnlocks] = useState<string[]>([]);
  const { challenges, getSubmissionForChallenge, getChallengeStats } = useChallenges();

  const baseAchievements: Omit<Achievement, 'unlocked' | 'progress' | 'unlockedAt'>[] = [
    // Points Achievements
    {
      id: 'first_points',
      title: 'First Steps',
      description: 'Earn your first 10 points',
      icon: '🌟',
      category: 'points',
      requirement: 10,
      points: 5
    },
    {
      id: 'point_collector',
      title: 'Point Collector',
      description: 'Earn 100 points',
      icon: '💰',
      category: 'points',
      requirement: 100,
      points: 10
    },
    {
      id: 'point_master',
      title: 'Point Master',
      description: 'Earn 500 points',
      icon: '💎',
      category: 'points',
      requirement: 500,
      points: 25
    },
    {
      id: 'point_legend',
      title: 'Point Legend',
      description: 'Earn 1000 points',
      icon: '👑',
      category: 'points',
      requirement: 1000,
      points: 50
    },

    // Completion Achievements
    {
      id: 'first_completion',
      title: 'Getting Started',
      description: 'Complete your first challenge',
      icon: '🎯',
      category: 'completion',
      requirement: 1,
      points: 10
    },
    {
      id: 'dedicated_learner',
      title: 'Dedicated Learner',
      description: 'Complete 5 challenges',
      icon: '📚',
      category: 'completion',
      requirement: 5,
      points: 20
    },
    {
      id: 'challenge_champion',
      title: 'Challenge Champion',
      description: 'Complete 10 challenges',
      icon: '🏆',
      category: 'completion',
      requirement: 10,
      points: 40
    },
    {
      id: 'completion_master',
      title: 'Completion Master',
      description: 'Complete 20 challenges',
      icon: '🎖️',
      category: 'completion',
      requirement: 20,
      points: 75
    },

    // Streak Achievements
    {
      id: 'daily_learner',
      title: 'Daily Learner',
      description: 'Complete challenges for 3 days in a row',
      icon: '📅',
      category: 'streak',
      requirement: 3,
      points: 15
    },
    {
      id: 'week_warrior',
      title: 'Week Warrior',
      description: 'Complete challenges for 7 days in a row',
      icon: '⚔️',
      category: 'streak',
      requirement: 7,
      points: 30
    },
    {
      id: 'month_master',
      title: 'Month Master',
      description: 'Complete challenges for 30 days in a row',
      icon: '🗓️',
      category: 'streak',
      requirement: 30,
      points: 100
    },

    // Special Achievements
    {
      id: 'perfect_score',
      title: 'Perfect Score',
      description: 'Get a perfect score on any quiz',
      icon: '💯',
      category: 'special',
      requirement: 1,
      points: 25
    },
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      description: 'Complete 5 challenges in one day',
      icon: '⚡',
      category: 'special',
      requirement: 5,
      points: 35
    },
    {
      id: 'eco_expert',
      title: 'Eco Expert',
      description: 'Complete all environmental challenges',
      icon: '🌱',
      category: 'special',
      requirement: 1,
      points: 50
    }
  ];

  useEffect(() => {
    if (studentId && classId) {
      fetchAchievements();
    }
  }, [studentId, classId]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      
      // Get student's submission data
      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', studentId);

      if (submissionsError) throw submissionsError;

      // Get student's achievement unlocks
      const { data: unlocks, error: unlocksError } = await supabase
        .from('achievement_unlocks')
        .select('*')
        .eq('student_id', studentId);

      if (unlocksError) throw unlocksError;

      const stats = getChallengeStats();
      const totalPoints = submissions?.reduce((sum, sub) => sum + (sub.score || 0), 0) || 0;
      const completedChallenges = submissions?.filter(sub => sub.completed).length || 0;
      
      // Calculate current streak (simplified - would need more complex logic in real app)
      const today = new Date();
      const recentSubmissions = submissions?.filter(sub => {
        const submissionDate = new Date(sub.submitted_at || sub.created_at);
        const daysDiff = Math.floor((today.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 30;
      }) || [];
      
      const currentStreak = calculateStreak(recentSubmissions);
      const perfectScores = submissions?.filter(sub => sub.score >= 95).length || 0;
      const dailyCompletions = getDailyCompletions(submissions || []);

      // Process achievements
      const processedAchievements = baseAchievements.map(achievement => {
        const unlocked = unlocks?.find(unlock => unlock.achievement_id === achievement.id);
        let progress = 0;
        let requirement = achievement.requirement;

        switch (achievement.category) {
          case 'points':
            progress = Math.min(totalPoints, requirement);
            break;
          case 'completion':
            progress = Math.min(completedChallenges, requirement);
            break;
          case 'streak':
            progress = Math.min(currentStreak, requirement);
            break;
          case 'special':
            if (achievement.id === 'perfect_score') {
              progress = Math.min(perfectScores, requirement);
            } else if (achievement.id === 'speed_demon') {
              const maxDaily = Math.max(...dailyCompletions, 0);
              progress = Math.min(maxDaily, requirement);
            } else if (achievement.id === 'eco_expert') {
              const ecoChallenges = challenges.filter(c => c.config?.category === 'action').length;
              progress = ecoChallenges > 0 ? 1 : 0;
              requirement = 1;
            }
            break;
        }

        return {
          ...achievement,
          unlocked: !!unlocked,
          progress,
          unlockedAt: unlocked?.unlocked_at
        };
      });

      setAchievements(processedAchievements);

      // Check for new unlocks
      const newUnlockedAchievements = processedAchievements.filter(
        achievement => achievement.unlocked && !unlocks?.find(unlock => unlock.achievement_id === achievement.id)
      );

      if (newUnlockedAchievements.length > 0) {
        // Save new unlocks to database
        const newUnlocks = newUnlockedAchievements.map(achievement => ({
          student_id: studentId,
          achievement_id: achievement.id,
          unlocked_at: new Date().toISOString()
        }));

        await supabase.from('achievement_unlocks').insert(newUnlocks);
        setNewUnlocks(newUnlockedAchievements.map(a => a.id));
      }

    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (submissions: any[]) => {
    // Simplified streak calculation - in real app would be more complex
    const uniqueDays = new Set(
      submissions.map(sub => 
        new Date(sub.submitted_at || sub.created_at).toDateString()
      )
    ).size;
    return uniqueDays;
  };

  const getDailyCompletions = (submissions: any[]) => {
    const dailyCounts: { [key: string]: number } = {};
    submissions.forEach(sub => {
      const date = new Date(sub.submitted_at || sub.created_at).toDateString();
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    return Object.values(dailyCounts);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'points': return <Star className="h-5 w-5" />;
      case 'streak': return <Zap className="h-5 w-5" />;
      case 'completion': return <Target className="h-5 w-5" />;
      case 'special': return <Award className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'points': return 'text-yellow-600 bg-yellow-100';
      case 'streak': return 'text-orange-600 bg-orange-100';
      case 'completion': return 'text-green-600 bg-green-100';
      case 'special': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Achievements</h2>
        <p className="text-muted-foreground">
          {unlockedAchievements.length} of {achievements.length} achievements unlocked
        </p>
        <div className="mt-4">
          <Progress 
            value={(unlockedAchievements.length / achievements.length) * 100} 
            className="h-2 max-w-md mx-auto" 
          />
        </div>
      </div>

      {/* New Unlocks Notification */}
      {newUnlocks.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">
                New Achievement{newUnlocks.length > 1 ? 's' : ''} Unlocked!
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Unlocked Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => (
              <Card key={achievement.id} className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl">{achievement.icon}</div>
                    <Badge className={getCategoryColor(achievement.category)}>
                      {achievement.points} pts
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{achievement.title}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Unlocked</span>
                    <span>
                      {achievement.unlockedAt 
                        ? new Date(achievement.unlockedAt).toLocaleDateString()
                        : 'Recently'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center">
            <Lock className="h-5 w-5 mr-2 text-gray-400" />
            Locked Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => (
              <Card key={achievement.id} className="opacity-60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl grayscale">{achievement.icon}</div>
                    <Badge variant="outline" className="text-gray-500">
                      {achievement.points} pts
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-gray-600">{achievement.title}</CardTitle>
                  <CardDescription className="text-gray-500">{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-muted-foreground">
                        {achievement.progress}/{achievement.requirement}
                      </span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.requirement) * 100} 
                      className="h-2" 
                    />
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      {getCategoryIcon(achievement.category)}
                      <span className="capitalize">{achievement.category}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementSystem;
