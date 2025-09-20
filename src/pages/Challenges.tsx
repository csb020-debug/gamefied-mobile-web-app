import React, { useState } from "react";
import Footer from "../components/learning-companion/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useChallenges } from "@/hooks/useChallenges";
import { useStudent } from "@/hooks/useStudent";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Calendar, Target, BookOpen, GamepadIcon } from "lucide-react";
 

const Challenges: React.FC = () => {
  const { challenges, loading, getSubmissionForChallenge, completeChallenge, getChallengeStats } = useChallenges();
  const { currentStudent, currentClass } = useStudent();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const stats = getChallengeStats();

  const handleStartChallenge = (challenge: any) => {
    if (challenge.type === 'game') {
      navigate('/games');
    } else if (challenge.type === 'quiz') {
      navigate('/learn');
    } else {
      toast.success(`Started challenge: ${challenge.title}! Good luck! 🌟`);
    }
  };

  const handleCompleteChallenge = async (challenge: any) => {
    try {
      await completeChallenge(challenge.id, challenge.config?.points || 100);
      toast.success(`Challenge completed! +${challenge.config?.points || 100} eco-points! 🎉`);
    } catch (error) {
      toast.error('Failed to complete challenge. Please try again.');
    }
  };

  const getChallengeIcon = (type: string, category: string) => {
    if (type === 'game') return '🎮';
    if (type === 'quiz') return '📚';
    if (category === 'action') return '🌳';
    if (category === 'learning') return '📖';
    if (category === 'tracking') return '📊';
    if (category === 'lifestyle') return '♻️';
    return '🎯';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">You need to sign in to access challenges.</p>
          <Button onClick={() => navigate('/teachers/signup')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // For students, check if they've joined a class
  if (userProfile?.role === 'student' && (!currentStudent || !currentClass)) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Join a Class First</h1>
          <p className="text-muted-foreground mb-6">You need to join a class to access challenges.</p>
          <Button onClick={() => navigate('/join')}>
            Join Class
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <main className="flex-1 py-8 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight uppercase text-foreground mb-3 sm:mb-4">
              Eco Challenges
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light leading-relaxed text-foreground max-w-4xl mx-auto">
              Take action for the environment and earn eco-points through real-world challenges
            </p>
          </div>

          {/* Challenge Stats */}
          <div className="mb-8 sm:mb-10 lg:mb-12 bg-[rgba(242,242,242,1)] p-4 sm:p-6 lg:p-8 rounded-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">Your Challenge Progress</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#B8EE7C]">{stats.completed}</div>
                <div className="text-xs sm:text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#B8EE7C]">{stats.points}</div>
                <div className="text-xs sm:text-sm text-gray-600">Points Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#B8EE7C]">
                  {stats.completionRate}%
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#B8EE7C]">{stats.total}</div>
                <div className="text-xs sm:text-sm text-gray-600">Total Challenges</div>
              </div>
            </div>
          </div>

          {/* Challenges Grid */}
          {challenges.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Challenges Yet</h3>
              <p className="text-muted-foreground mb-6">
                Your teacher hasn't created any challenges yet. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {challenges.map((challenge) => {
                const submission = getSubmissionForChallenge(challenge.id);
                const isCompleted = submission?.completed || false;
                const score = submission?.score || 0;
                
                return (
                  <Card key={challenge.id} className={`p-4 sm:p-6 hover:shadow-lg transition-shadow`}>
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className="text-2xl sm:text-3xl">
                        {getChallengeIcon(challenge.type, challenge.config?.category)}
                      </div>
                      {isCompleted && <div className="text-xl sm:text-2xl">✅</div>}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-black mb-2">{challenge.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{challenge.description}</p>

                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                      <Badge variant="outline" className={`text-xs ${getDifficultyColor(challenge.config?.difficulty)}`}>
                        {challenge.config?.difficulty || 'Easy'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {challenge.config?.category || 'Challenge'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {challenge.type}
                      </Badge>
                    </div>

                    <div className="text-center mb-3 sm:mb-4">
                      <span className="text-base sm:text-lg font-bold text-[#B8EE7C]">
                        🌿 {challenge.config?.points || 100} points
                      </span>
                    </div>

                    {challenge.due_at && (
                      <div className="text-xs text-gray-500 mb-3 sm:mb-4 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due: {new Date(challenge.due_at).toLocaleDateString()}
                      </div>
                    )}

                    {challenge.config?.instructions && (
                      <div className="text-xs text-gray-500 mb-3 sm:mb-4">
                        <strong>Instructions:</strong> {challenge.config.instructions}
                      </div>
                    )}

                    {isCompleted ? (
                      <div className="w-full bg-green-100 text-green-800 font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-center text-sm sm:text-base">
                        ✓ Completed ({score} points)
                      </div>
                    ) : (
                      <Button 
                        onClick={() => handleStartChallenge(challenge)}
                        className="w-full bg-[#B8EE7C] text-[#0A0E09] font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-[#96EE60] transition-colors text-sm sm:text-base"
                      >
                        Start Challenge
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Weekly Challenge */}
          <div className="mt-8 sm:mt-10 lg:mt-12">
            <Card className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-[#B8EE7C]/20 to-[#96EE60]/20">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">🏆 Weekly Challenge</h2>
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🌊</div>
                <h3 className="text-lg sm:text-xl font-bold text-black mb-2">Water Conservation Week</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  Reduce your household water usage by 30% this week through conservation techniques
                </p>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <Badge className="bg-[#B8EE7C] text-[#0A0E09] text-xs">Special Event</Badge>
                  <Badge variant="outline" className="text-xs">300 Points</Badge>
                  <Badge variant="outline" className="text-xs">Ends in 4 days</Badge>
                </div>
                <Progress value={65} className="max-w-xs sm:max-w-md mx-auto mb-3 sm:mb-4" />
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">234 students participating • 65% completion rate</p>
                <button className="bg-[#B8EE7C] text-[#0A0E09] font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-lg hover:bg-[#96EE60] transition-colors text-sm sm:text-base">
                  Join Weekly Challenge
                </button>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Challenges;