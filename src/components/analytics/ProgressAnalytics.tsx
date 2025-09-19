import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Award, 
  Clock, 
  Download,
  Eye,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface StudentProgress {
  id: string;
  nickname: string;
  total_score: number;
  completed_assignments: number;
  total_assignments: number;
  average_score: number;
  last_activity: string;
  submissions: {
    assignment_id: string;
    score: number;
    completed: boolean;
    submitted_at: string;
  }[];
}

interface ClassAnalytics {
  totalStudents: number;
  totalAssignments: number;
  averageScore: number;
  completionRate: number;
  topPerformers: StudentProgress[];
  recentActivity: any[];
  assignmentStats: {
    assignment_id: string;
    title: string;
    type: string;
    average_score: number;
    completion_rate: number;
    total_attempts: number;
  }[];
}

interface ProgressAnalyticsProps {
  classId: string;
  className: string;
}

const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ classId, className }) => {
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');

  useEffect(() => {
    fetchAnalytics();
  }, [classId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch students with their submissions
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          nickname,
          created_at,
          submissions!inner(
            assignment_id,
            score,
            completed,
            submitted_at
          )
        `)
        .eq('class_id', classId);

      if (studentsError) throw studentsError;

      // Fetch assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', classId);

      if (assignmentsError) throw assignmentsError;

      // Process student data
      const studentProgress: StudentProgress[] = students?.map(student => {
        const submissions = student.submissions || [];
        const totalScore = submissions.reduce((sum: number, sub: any) => sum + (sub.score || 0), 0);
        const completedAssignments = submissions.filter((sub: any) => sub.completed).length;
        const averageScore = completedAssignments > 0 ? totalScore / completedAssignments : 0;
        const lastActivity = submissions.length > 0 
          ? Math.max(...submissions.map((sub: any) => new Date(sub.submitted_at).getTime()))
          : new Date(student.created_at).getTime();

        return {
          id: student.id,
          nickname: student.nickname,
          total_score: totalScore,
          completed_assignments: completedAssignments,
          total_assignments: assignments?.length || 0,
          average_score: averageScore,
          last_activity: new Date(lastActivity).toISOString(),
          submissions: submissions
        };
      }) || [];

      // Calculate class analytics
      const totalStudents = studentProgress.length;
      const totalAssignments = assignments?.length || 0;
      const totalScores = studentProgress.reduce((sum, student) => sum + student.total_score, 0);
      const totalCompleted = studentProgress.reduce((sum, student) => sum + student.completed_assignments, 0);
      const averageScore = totalStudents > 0 ? totalScores / totalStudents : 0;
      const completionRate = totalAssignments > 0 ? (totalCompleted / (totalStudents * totalAssignments)) * 100 : 0;

      // Top performers
      const topPerformers = studentProgress
        .sort((a, b) => b.total_score - a.total_score)
        .slice(0, 5);

      // Assignment statistics
      const assignmentStats = assignments?.map(assignment => {
        const assignmentSubmissions = studentProgress.flatMap(student => 
          student.submissions.filter(sub => sub.assignment_id === assignment.id)
        );
        const avgScore = assignmentSubmissions.length > 0 
          ? assignmentSubmissions.reduce((sum, sub) => sum + sub.score, 0) / assignmentSubmissions.length 
          : 0;
        const completionRate = assignmentSubmissions.length > 0 
          ? (assignmentSubmissions.filter(sub => sub.completed).length / assignmentSubmissions.length) * 100 
          : 0;

        return {
          assignment_id: assignment.id,
          title: assignment.title,
          type: assignment.type,
          average_score: avgScore,
          completion_rate: completionRate,
          total_attempts: assignmentSubmissions.length
        };
      }) || [];

      // Recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentActivity = studentProgress
        .flatMap(student => 
          student.submissions
            .filter(sub => new Date(sub.submitted_at) >= sevenDaysAgo)
            .map(sub => ({
              student: student.nickname,
              assignment: assignments?.find(a => a.id === sub.assignment_id)?.title || 'Unknown',
              score: sub.score,
              date: sub.submitted_at
            }))
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      setAnalytics({
        totalStudents,
        totalAssignments,
        averageScore,
        completionRate,
        topPerformers,
        recentActivity,
        assignmentStats
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const csvData = analytics.topPerformers.map(student => ({
      'Student Name': student.nickname,
      'Total Score': student.total_score,
      'Completed Assignments': student.completed_assignments,
      'Total Assignments': student.total_assignments,
      'Average Score': Math.round(student.average_score * 100) / 100,
      'Completion Rate': `${Math.round((student.completed_assignments / student.total_assignments) * 100)}%`
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${className}_progress_report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No data available for analytics.</p>
      </div>
    );
  }

  const chartData = analytics.assignmentStats.map(stat => ({
    name: stat.title.length > 15 ? stat.title.substring(0, 15) + '...' : stat.title,
    averageScore: Math.round(stat.average_score),
    completionRate: Math.round(stat.completion_rate)
  }));

  const pieData = [
    { name: 'Completed', value: analytics.completionRate, color: '#10B981' },
    { name: 'Remaining', value: 100 - analytics.completionRate, color: '#E5E7EB' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Class Analytics</h2>
          <p className="text-muted-foreground">{className} - Progress Overview</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active learners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.averageScore)}</div>
            <p className="text-xs text-muted-foreground">Points per student</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.completionRate)}%</div>
            <p className="text-xs text-muted-foreground">Assignments completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">Available challenges</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Student Progress</TabsTrigger>
          <TabsTrigger value="assignments">Assignment Analysis</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completion Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Completion Rate</CardTitle>
                <CardDescription>Percentage of assignments completed by students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-4">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(analytics.completionRate)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                </div>
              </CardContent>
            </Card>

            {/* Assignment Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment Performance</CardTitle>
                <CardDescription>Average scores by assignment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="averageScore" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Progress</CardTitle>
              <CardDescription>Individual student performance and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPerformers.map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{student.nickname}</div>
                        <div className="text-sm text-muted-foreground">
                          {student.completed_assignments}/{student.total_assignments} assignments
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{student.total_score} points</div>
                      <div className="text-sm text-muted-foreground">
                        Avg: {Math.round(student.average_score)}
                      </div>
                    </div>
                    <div className="w-32">
                      <Progress 
                        value={(student.completed_assignments / student.total_assignments) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Analysis</CardTitle>
              <CardDescription>Performance metrics for each assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.assignmentStats.map((assignment) => (
                  <div key={assignment.assignment_id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{assignment.title}</h3>
                        <Badge variant="outline">{assignment.type}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{Math.round(assignment.average_score)} avg</div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.total_attempts} attempts
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion Rate</span>
                        <span>{Math.round(assignment.completion_rate)}%</span>
                      </div>
                      <Progress value={assignment.completion_rate} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest submissions and completions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentActivity.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No recent activity</p>
                ) : (
                  analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium">{activity.student}</div>
                        <div className="text-sm text-muted-foreground">
                          Completed {activity.assignment} - {activity.score} points
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressAnalytics;
