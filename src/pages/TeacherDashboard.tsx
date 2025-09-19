import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, Copy, QrCode, BarChart3, Target, Calendar, BookOpen, TrendingUp, FileText, MessageSquare, Users2, Star } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChallengeCreator from '@/components/assignments/AssignmentCreator';
import QuizBuilder from '@/components/quiz/QuizBuilder';
import ProgressAnalytics from '@/components/analytics/ProgressAnalytics';
import ContentManager from '@/components/cms/ContentManager';
import ClassDiscussions from '@/components/social/ClassDiscussions';
import CollaborationGroups from '@/components/social/CollaborationGroups';
import PeerReviewSystem from '@/components/social/PeerReviewSystem';

interface Class {
  id: string;
  name: string;
  grade: string;
  class_code: string;
  created_at: string;
}

interface Student {
  id: string;
  nickname: string;
  created_at: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: string;
  due_at: string | null;
  created_at: string;
  config: {
    points: number;
    instructions: string;
    difficulty: string;
    category: string;
  };
}

const TeacherDashboard = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState('');
  const [schoolId, setSchoolId] = useState<string | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchClasses();
      fetchSchools();
      loadTeacherSchool();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass.id);
      fetchAssignments(selectedClass.id);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClasses(data || []);
      if ((data || []).length > 0 && !selectedClass) {
        setSelectedClass(data[0]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name', { ascending: true });
      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      // non-blocking
    }
  };

  const loadTeacherSchool = async () => {
    if (!user?.email) return;
    
    try {
      const { data, error } = await supabase
        .from('teacher_invitations')
        .select('school_id, schools(name)')
        .eq('teacher_email', user.email)
        .eq('status', 'accepted')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      
      if (data) {
        setSchoolId(data.school_id);
        toast({
          title: "School Association",
          description: `You're associated with ${data.schools.name}`,
        });
      }
    } catch (error: any) {
      console.error('Error loading teacher school:', error);
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAssignments = async (classId: string) => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
    }
  };

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim() || !grade.trim()) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert([{
          teacher_id: user?.id,
          name: className.trim(),
          grade: grade.trim(),
          class_code: '', // auto-generated by trigger
          school_id: schoolId || null
        }])
        .select()
        .single();

      if (error) throw error;

      setClasses([data, ...classes]);
      if (!selectedClass) {
        setSelectedClass(data);
      }

      toast({
        title: "Class created!",
        description: `Class code: ${data.class_code}`,
      });

      setClassName('');
      setGrade('');
      setShowCreateDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const copyClassCode = (classCode: string) => {
    navigator.clipboard.writeText(classCode);
    toast({
      title: "Copied!",
      description: "Class code copied to clipboard",
    });
  };

  const copyJoinLink = (classCode: string) => {
    const joinLink = `${window.location.origin}/join/${classCode}`;
    navigator.clipboard.writeText(joinLink);
    toast({
      title: "Copied!",
      description: "Join link copied to clipboard",
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.email}</p>
          </div>
          <div className="flex space-x-2">
            {selectedClass && (
              <Button 
                variant="outline" 
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {showAnalytics ? 'Hide Analytics' : 'View Analytics'}
              </Button>
            )}
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {showAnalytics && selectedClass ? (
          <ProgressAnalytics classId={selectedClass.id} className={selectedClass.name} />
        ) : selectedClass ? (
          <div className="space-y-6">
            {/* Navigation Tabs */}
            <div className="border-b">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-2 inline" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'content'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FileText className="h-4 w-4 mr-2 inline" />
                  Content
                </button>
                <button
                  onClick={() => setActiveTab('discussions')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'discussions'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 mr-2 inline" />
                  Discussions
                </button>
                <button
                  onClick={() => setActiveTab('collaboration')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'collaboration'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Users2 className="h-4 w-4 mr-2 inline" />
                  Collaboration
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'reviews'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Star className="h-4 w-4 mr-2 inline" />
                  Peer Reviews
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Classes Sidebar */}
                <div className="lg:col-span-1">
                  <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>My Classes</CardTitle>
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              New Class
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create New Class</DialogTitle>
                              <DialogDescription>
                                Set up a new class to start inviting students
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={createClass} className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Class Name</label>
                                <Input
                                  value={className}
                                  onChange={(e) => setClassName(e.target.value)}
                                  placeholder="e.g., Environmental Science"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Grade</label>
                                <Input
                                  value={grade}
                                  onChange={(e) => setGrade(e.target.value)}
                                  placeholder="e.g., 5th Grade"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">School (optional)</label>
                                <Select value={schoolId} onValueChange={(v) => setSchoolId(v)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a school" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {schools.map((s) => (
                                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button type="submit" disabled={creating} className="w-full">
                                {creating ? 'Creating...' : 'Create Class'}
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {classes.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          No classes yet. Create your first class to get started!
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {classes.map((cls) => (
                            <div
                              key={cls.id}
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                selectedClass?.id === cls.id
                                  ? 'bg-primary/10 border border-primary/20'
                                  : 'bg-muted/30 hover:bg-muted/50'
                              }`}
                              onClick={() => setSelectedClass(cls)}
                            >
                              <div className="font-medium">{cls.name}</div>
                              <div className="text-sm text-muted-foreground">{cls.grade}</div>
                              <div className="text-xs font-mono mt-1 text-primary">
                                {cls.class_code}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {selectedClass ? (
                    <>
                      {/* Class Info */}
                      <Card className="bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle>{selectedClass.name}</CardTitle>
                          <CardDescription>{selectedClass.grade}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Class Code</p>
                              <div className="flex items-center space-x-2">
                                <code className="text-lg font-mono bg-muted px-3 py-1 rounded">
                                  {selectedClass.class_code}
                                </code>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyClassCode(selectedClass.class_code)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Join Link</p>
                              <Button
                                variant="outline"
                                onClick={() => copyJoinLink(selectedClass.class_code)}
                                className="w-full justify-start"
                              >
                                <QrCode className="h-4 w-4 mr-2" />
                                Copy Join Link
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Assignments */}
                      <Card className="bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center">
                              <Target className="h-5 w-5 mr-2" />
                              Class Challenges ({assignments.length})
                            </CardTitle>
                            <div className="flex space-x-2">
                              <ChallengeCreator 
                                classId={selectedClass.id} 
                                onChallengeCreated={() => fetchAssignments(selectedClass.id)} 
                              />
                              <QuizBuilder 
                                classId={selectedClass.id} 
                                onQuizCreated={() => fetchAssignments(selectedClass.id)} 
                              />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {assignments.length === 0 ? (
                            <div className="text-center py-8">
                              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground mb-4">
                                No challenges created yet. Create your first challenge to engage students!
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {assignments.map((assignment) => (
                                <div
                                  key={assignment.id}
                                  className="p-4 bg-muted/30 rounded-lg border"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <h3 className="font-semibold">{assignment.title}</h3>
                                        <Badge variant={assignment.type === 'game' ? 'default' : 'secondary'}>
                                          {assignment.type}
                                        </Badge>
                                        <Badge variant="outline">
                                          {assignment.config?.difficulty || 'Easy'}
                                        </Badge>
                                      </div>
                                      {assignment.description && (
                                        <p className="text-sm text-muted-foreground mb-2">
                                          {assignment.description}
                                        </p>
                                      )}
                                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                        <span>🌿 {assignment.config?.points || 100} points</span>
                                        {assignment.due_at && (
                                          <span className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            Due: {new Date(assignment.due_at).toLocaleDateString()}
                                          </span>
                                        )}
                                        <span>Created: {new Date(assignment.created_at).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Students */}
                      <Card className="bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Users className="h-5 w-5 mr-2" />
                            Students ({students.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {students.length === 0 ? (
                            <div className="text-center py-8">
                              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">
                                No students have joined yet. Share the class code to invite students!
                              </p>
                            </div>
                          ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                              {students.map((student) => (
                                <div
                                  key={student.id}
                                  className="p-3 bg-muted/30 rounded-lg"
                                >
                                  <div className="font-medium">{student.nickname}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Joined {new Date(student.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Card className="bg-card/80 backdrop-blur-sm">
                      <CardContent className="text-center py-12">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Create a class to start managing your students and assignments
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'content' && selectedClass && (
              <ContentManager classId={selectedClass.id} className={selectedClass.name} />
            )}

            {activeTab === 'discussions' && selectedClass && (
              <ClassDiscussions classId={selectedClass.id} className={selectedClass.name} />
            )}

            {activeTab === 'collaboration' && selectedClass && (
              <CollaborationGroups classId={selectedClass.id} className={selectedClass.name} />
            )}

            {activeTab === 'reviews' && selectedClass && (
              <PeerReviewSystem classId={selectedClass.id} className={selectedClass.name} />
            )}
          </div>
        ) : (
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Create a class to start managing your students and assignments
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;