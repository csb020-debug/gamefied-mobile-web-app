import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '@/hooks/useStudent';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Trophy, GamepadIcon, LogOut, Clock } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: string;
  due_at: string | null;
  created_at: string;
}

interface Submission {
  id: string;
  assignment_id: string;
  score: number;
  completed: boolean;
  submitted_at: string | null;
}

interface ClassStudent {
  id: string;
  nickname: string;
  total_score?: number;
}

const StudentDashboard = () => {
  const { currentStudent, currentClass, leaveClass } = useStudent();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [classmates, setClassmates] = useState<ClassStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentStudent || !currentClass) {
      navigate('/');
      return;
    }

    fetchAssignments();
    fetchSubmissions();
    fetchClassmates();
  }, [currentStudent, currentClass, navigate]);

  const fetchAssignments = async () => {
    if (!currentClass) return;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', currentClass.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchSubmissions = async () => {
    if (!currentStudent) return;

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', currentStudent.id);

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassmates = async () => {
    if (!currentClass) return;

    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          nickname,
          submissions!inner(score)
        `)
        .eq('class_id', currentClass.id);

      if (error) throw error;

      // Calculate total scores for leaderboard
      const studentsWithScores = (data || []).map(student => {
        const totalScore = student.submissions?.reduce((sum: number, sub: any) => sum + (sub.score || 0), 0) || 0;
        return {
          id: student.id,
          nickname: student.nickname,
          total_score: totalScore
        };
      }).sort((a, b) => (b.total_score || 0) - (a.total_score || 0));

      setClassmates(studentsWithScores);
    } catch (error) {
      console.error('Error fetching classmates:', error);
    }
  };

  const getSubmissionForAssignment = (assignmentId: string) => {
    return submissions.find(sub => sub.assignment_id === assignmentId);
  };

  const getTotalScore = () => {
    return submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
  };

  const getCompletedAssignments = () => {
    return submissions.filter(sub => sub.completed).length;
  };

  const handleLeaveClass = () => {
    leaveClass();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentStudent || !currentClass) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {currentStudent.nickname}!</h1>
            <p className="text-muted-foreground">
              {currentClass.name} • {currentClass.grade}
            </p>
          </div>
          <Button variant="outline" onClick={handleLeaveClass}>
            <LogOut className="h-4 w-4 mr-2" />
            Leave Class
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-3 grid md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Score</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getTotalScore()}</div>
                <p className="text-xs text-muted-foreground">
                  Points earned from all activities
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <GamepadIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getCompletedAssignments()}/{assignments.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Assignments completed
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  #{classmates.findIndex(student => student.id === currentStudent.id) + 1}
                </div>
                <p className="text-xs text-muted-foreground">
                  Out of {classmates.length} students
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Assignments */}
          <div className="lg:col-span-2">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Available Activities</CardTitle>
                <CardDescription>
                  Complete activities to earn points and learn about the environment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <div className="text-center py-8">
                    <GamepadIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No activities available yet. Check back later!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => {
                      const submission = getSubmissionForAssignment(assignment.id);
                      const isCompleted = submission?.completed || false;
                      const score = submission?.score || 0;

                      return (
                        <div
                          key={assignment.id}
                          className={`p-4 rounded-lg border transition-colors ${
                            isCompleted
                              ? 'bg-primary/5 border-primary/20'
                              : 'bg-muted/30 border-border hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold">{assignment.title}</h3>
                                <Badge variant={assignment.type === 'game' ? 'default' : 'secondary'}>
                                  {assignment.type}
                                </Badge>
                                {isCompleted && (
                                  <Badge variant="outline" className="bg-primary/10">
                                    ✓ Complete
                                  </Badge>
                                )}
                              </div>
                              {assignment.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {assignment.description}
                                </p>
                              )}
                              {assignment.due_at && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Due: {new Date(assignment.due_at).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              {isCompleted ? (
                                <div className="text-sm">
                                  <div className="font-semibold text-primary">
                                    {score} points
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Completed
                                  </div>
                                </div>
                              ) : (
                                <Button size="sm" onClick={() => navigate(`/${assignment.type}s`)}>
                                  Start
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Class Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {classmates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No classmates yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {classmates.slice(0, 10).map((student, index) => (
                      <div
                        key={student.id}
                        className={`flex items-center justify-between p-2 rounded ${
                          student.id === currentStudent.id
                            ? 'bg-primary/10 border border-primary/20'
                            : 'bg-muted/20'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`text-sm font-bold ${
                            index === 0 ? 'text-yellow-500' :
                            index === 1 ? 'text-gray-400' :
                            index === 2 ? 'text-orange-500' :
                            'text-muted-foreground'
                          }`}>
                            #{index + 1}
                          </div>
                          <div className="font-medium">
                            {student.nickname}
                            {student.id === currentStudent.id && (
                              <span className="text-xs text-primary ml-1">(You)</span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm font-semibold">
                          {student.total_score || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;