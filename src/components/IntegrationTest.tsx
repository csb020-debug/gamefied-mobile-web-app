import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useStudent } from '@/hooks/useStudent';
import { useChallenges } from '@/hooks/useChallenges';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useProfile } from '@/hooks/useProfile';
import DataService from '@/lib/dataService';
import config from '@/lib/config';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

const IntegrationTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'running' | 'success' | 'error'>('pending');

  const { user, userProfile, loading: authLoading } = useAuth();
  const { currentStudent, currentClass, loading: studentLoading } = useStudent();
  const { challenges, loading: challengesLoading } = useChallenges();
  const { studentLeaderboard, loading: leaderboardLoading } = useLeaderboard();
  const { userStats, loading: profileLoading } = useProfile();

  const testDefinitions = [
    {
      name: 'Environment Configuration',
      test: async () => {
        const isConfigured = config.isConfigured();
        const isValid = config.validate();
        if (!isConfigured) throw new Error('Environment variables not configured');
        if (!isValid) throw new Error('Environment validation failed');
        return 'Environment properly configured';
      }
    },
    {
      name: 'Supabase Connection',
      test: async () => {
        try {
          const isConnected = await DataService.testConnection();
          if (!isConnected) throw new Error('Failed to connect to Supabase');
          return 'Successfully connected to Supabase';
        } catch (error: any) {
          throw new Error(`Supabase connection failed: ${error.message}`);
        }
      }
    },
    {
      name: 'Authentication System',
      test: async () => {
        if (authLoading) throw new Error('Authentication still loading');
        if (!user) throw new Error('No user authenticated');
        if (!userProfile) throw new Error('User profile not loaded');
        return `User authenticated: ${userProfile.email} (${userProfile.role})`;
      }
    },
    {
      name: 'Student Data Loading',
      test: async () => {
        if (studentLoading) throw new Error('Student data still loading');
        if (userProfile?.role === 'student' && !currentStudent) {
          throw new Error('Student profile not loaded');
        }
        return `Student data loaded: ${currentStudent ? currentStudent.nickname : 'N/A'}`;
      }
    },
    {
      name: 'Challenges Data Loading',
      test: async () => {
        if (challengesLoading) throw new Error('Challenges still loading');
        return `Challenges loaded: ${challenges.length} available`;
      }
    },
    {
      name: 'Leaderboard Data Loading',
      test: async () => {
        if (leaderboardLoading) throw new Error('Leaderboard still loading');
        return `Leaderboard loaded: ${studentLeaderboard.length} students`;
      }
    },
    {
      name: 'Profile Data Loading',
      test: async () => {
        if (profileLoading) throw new Error('Profile still loading');
        if (!userStats) throw new Error('User stats not loaded');
        return `Profile loaded: ${userStats.name} - Level ${userStats.level}`;
      }
    }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setTests(testDefinitions.map(t => ({ name: t.name, status: 'pending' })));

    let allPassed = true;

    for (let i = 0; i < testDefinitions.length; i++) {
      const testDef = testDefinitions[i];
      const startTime = Date.now();

      // Update test status to running
      setTests(prev => prev.map((test, index) => 
        index === i ? { ...test, status: 'running' } : test
      ));

      try {
        const result = await testDef.test();
        const duration = Date.now() - startTime;
        
        setTests(prev => prev.map((test, index) => 
          index === i ? { 
            ...test, 
            status: 'success', 
            message: result, 
            duration 
          } : test
        ));
      } catch (error: any) {
        const duration = Date.now() - startTime;
        allPassed = false;
        
        setTests(prev => prev.map((test, index) => 
          index === i ? { 
            ...test, 
            status: 'error', 
            message: error.message, 
            duration 
          } : test
        ));
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setOverallStatus(allPassed ? 'success' : 'error');
    setIsRunning(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'running': return '⏳';
      default: return '⏸️';
    }
  };

  return (
    <div className="p-4 bg-white m-4 rounded border-2 border-gray-300">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🔧 Integration Test Suite</span>
            <Badge className={getStatusColor(overallStatus)}>
              {getStatusIcon(overallStatus)} {overallStatus.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={runTests} 
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </Button>
              
              <div className="text-sm text-gray-600">
                {tests.filter(t => t.status === 'success').length} / {tests.length} tests passed
              </div>
            </div>

            {tests.length > 0 && (
              <div className="space-y-2">
                {tests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getStatusIcon(test.status)}</span>
                      <div>
                        <div className="font-medium">{test.name}</div>
                        {test.message && (
                          <div className="text-sm text-gray-600">{test.message}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {test.duration && `${test.duration}ms`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded">
              <h3 className="font-semibold mb-2">Current System Status:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Auth Loading:</strong> {authLoading ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}
                </div>
                <div>
                  <strong>User Profile:</strong> {userProfile ? `${userProfile.role}` : 'None'}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationTest;
