import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useStudent } from '@/hooks/useStudent';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Users, GamepadIcon, Trophy } from 'lucide-react';

const StudentJoin = () => {
  const { class_code } = useParams<{ class_code: string }>();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualClassCode, setManualClassCode] = useState('');
  const { joinClass } = useStudent();
  const { user, createUserProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const currentClassCode = class_code || manualClassCode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !currentClassCode.trim()) return;

    setLoading(true);
    
    try {
      // First validate that the class exists
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name, teacher_id, school_id')
        .eq('class_code', currentClassCode.toUpperCase())
        .single();

      if (classError || !classData) {
        toast({
          title: "Invalid Class Code",
          description: "The class code you entered doesn't exist. Please check and try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // If user is authenticated, create a user profile first
      if (user) {
        const { error: profileError } = await createUserProfile(
          user.email || '',
          nickname.trim(),
          'student',
          classData.school_id
        );

        if (profileError) {
          toast({
            title: "Error",
            description: "Failed to create user profile. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Then join the class
      const result = await joinClass(currentClassCode.toUpperCase(), nickname.trim());

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome to the class!",
          description: `You've successfully joined ${result.class?.name}`,
        });
        navigate('/student/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate class code. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Join Your Class</CardTitle>
          <CardDescription>
            Enter your class code and nickname to get started with EcoQuest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!class_code && (
              <div className="space-y-2">
                <label htmlFor="classCode" className="text-sm font-medium text-foreground/80">
                  Class Code
                </label>
                <Input
                  id="classCode"
                  type="text"
                  placeholder="Enter 6-letter class code"
                  value={manualClassCode}
                  onChange={(e) => setManualClassCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  required
                  className="bg-background/50 text-center font-mono text-lg tracking-wider"
                />
              </div>
            )}
            
            {class_code && (
              <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm text-muted-foreground">Joining class:</p>
                <p className="text-lg font-mono font-bold text-primary tracking-wider">
                  {class_code}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="nickname" className="text-sm font-medium text-foreground/80">
                Your Nickname
              </label>
              <Input
                id="nickname"
                type="text"
                placeholder="Enter a fun nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                required
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Choose a nickname that your classmates will see
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !nickname.trim() || !currentClassCode.trim()}
            >
              {loading ? 'Joining class...' : 'Join Class'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <GamepadIcon className="h-4 w-4" />
                <span>Play Games</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span>Earn Points</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentJoin;