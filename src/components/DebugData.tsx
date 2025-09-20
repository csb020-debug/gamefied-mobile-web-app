import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStudent } from '@/hooks/useStudent';
import { useChallenges } from '@/hooks/useChallenges';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useProfile } from '@/hooks/useProfile';
import config from '@/lib/config';

const DebugData: React.FC = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { currentStudent, currentClass, loading: studentLoading } = useStudent();
  const { challenges, loading: challengesLoading } = useChallenges();
  const { studentLeaderboard, loading: leaderboardLoading } = useLeaderboard();
  const { userStats, loading: profileLoading } = useProfile();

  const supabaseUrl = config.supabase.url;
  const supabaseKey = config.supabase.anonKey;

  return (
    <div className="p-4 bg-gray-100 m-4 rounded">
      <h2 className="text-xl font-bold mb-4">Debug Data</h2>
      
      <div className="space-y-2">
        <div>
          <strong>Supabase URL:</strong> {supabaseUrl ? 'Configured' : '❌ Missing'}
        </div>
        <div>
          <strong>Supabase Key:</strong> {supabaseKey ? 'Configured' : '❌ Missing'}
        </div>
        <div>
          <strong>Auth Loading:</strong> {authLoading ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}
        </div>
        <div>
          <strong>User Profile:</strong> {userProfile ? `${userProfile.role} - ${userProfile.email}` : 'None'}
        </div>
        <div>
          <strong>Student Loading:</strong> {studentLoading ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Current Student:</strong> {currentStudent ? currentStudent.nickname : 'None'}
        </div>
        <div>
          <strong>Current Class:</strong> {currentClass ? currentClass.name : 'None'}
        </div>
        <div>
          <strong>Challenges Loading:</strong> {challengesLoading ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Challenges Count:</strong> {challenges.length}
        </div>
        <div>
          <strong>Leaderboard Loading:</strong> {leaderboardLoading ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Student Leaderboard Count:</strong> {studentLeaderboard.length}
        </div>
        <div>
          <strong>Profile Loading:</strong> {profileLoading ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>User Stats:</strong> {userStats ? `${userStats.name} - Level ${userStats.level}` : 'None'}
        </div>
      </div>
    </div>
  );
};

export default DebugData;
