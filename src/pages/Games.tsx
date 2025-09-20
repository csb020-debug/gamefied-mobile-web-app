import React, { useState, useEffect } from "react";
import Footer from "../components/learning-companion/Footer";
import { FocusCardsWithClick } from "@/components/ui/focus-cards";
import RecycleGame from "../components/games/RecycleGame";
import EnergyQuiz from "../components/games/EnergyQuiz";
import CarbonCalculator from "../components/games/CarbonCalculator";
import { useChallenges } from "@/hooks/useChallenges";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GamepadIcon, Trophy, Clock, Target } from "lucide-react";
 

const Games: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [localGames, setLocalGames] = useState<any[]>([]);
  const { challenges, loading, getSubmissionForChallenge, completeChallenge } = useChallenges();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  // Static fallback games for when backend isn't available
  const staticGames = [
    {
      id: "recycle",
      title: "Waste Sorting Challenge",
      description: "Sort waste items into correct recycling categories",
      points: 50,
      difficulty: "Easy",
      duration: "5 min",
      icon: "♻️",
      src: "/waste_segregation.png",
      component: RecycleGame,
      type: "game"
    },
    {
      id: "energy",
      title: "Renewable Energy Quiz",
      description: "Test your knowledge about clean energy sources",
      points: 75,
      difficulty: "Medium",
      duration: "8 min", 
      icon: "⚡",
      src: "/quiz.png",
      component: EnergyQuiz,
      type: "game"
    },
    {
      id: "carbon",
      title: "Carbon Footprint Calculator",
      description: "Calculate and reduce your daily carbon footprint",
      points: 100,
      difficulty: "Hard",
      duration: "10 min",
      icon: "🌍",
      src: "/carbon_footpront.png",
      component: CarbonCalculator,
      type: "game"
    }
  ];

  useEffect(() => {
    // Combine backend challenges with static games
    const gameChallenges = challenges.filter(challenge => challenge.type === 'game');
    
    // Map backend game challenges to local format
    const backendGames = gameChallenges.map(challenge => {
      // Try to match with static games for components
      const staticMatch = staticGames.find(game => 
        game.title.toLowerCase().includes(challenge.title.toLowerCase()) ||
        challenge.title.toLowerCase().includes(game.title.toLowerCase())
      );
      
      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description || "Complete this interactive game challenge",
        points: challenge.config?.points || 50,
        difficulty: challenge.config?.difficulty || "Medium",
        duration: challenge.config?.duration || "5 min",
        icon: challenge.config?.icon || "🎮",
        src: challenge.config?.image || "/quiz.png",
        component: staticMatch?.component || RecycleGame,
        type: "game",
        isBackend: true
      };
    });

    // Use backend games if available, otherwise fall back to static games
    setLocalGames(backendGames.length > 0 ? backendGames : staticGames);
  }, [challenges]);

  const handleGameComplete = async (gameId: string, score: number) => {
    try {
      const game = localGames.find(g => g.id === gameId);
      if (game?.isBackend) {
        // Complete backend challenge
        await completeChallenge(gameId, score);
      }
      setActiveGame(null);
    } catch (error) {
      console.error('Error completing game:', error);
      setActiveGame(null);
    }
  };

  // FocusCards data - only the available games
  const focusCardsData = localGames.map(game => ({ title: game.title, src: game.src }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading games...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated for backend features
  if (!user) {
    return (
      <div className="min-h-screen bg-background relative">
        <main className="flex-1 py-8 sm:py-10 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight uppercase text-foreground mb-3 sm:mb-4">
                Environmental Games
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light leading-relaxed text-foreground max-w-4xl mx-auto mb-6">
                Learn through fun, interactive games and challenges
              </p>
              <div className="flex justify-center">
                <Button onClick={() => navigate('/teachers/signup')} className="bg-[#B8EE7C] text-[#0A0E09] hover:bg-[#96EE60]">
                  Sign In to Track Progress
                </Button>
              </div>
            </div>

            {/* Show static games for non-authenticated users */}
            <div className="mb-8 sm:mb-10 lg:mb-12">
              <FocusCardsWithClick 
                cards={focusCardsData} 
                onGameClick={setActiveGame} 
                games={localGames} 
              />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (activeGame) {
    const game = localGames.find(g => g.id === activeGame);
    const GameComponent = game?.component;
    
    return (
      <div className="min-h-screen bg-background relative">
        <main className="flex-1 py-8 sm:py-10 lg:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-4 sm:mb-6">
              <button
                onClick={() => setActiveGame(null)}
                className="text-[#B8EE7C] hover:text-[#96EE60] font-semibold text-sm sm:text-base"
              >
                ← Back to Games
              </button>
            </div>
            {GameComponent && (
              <GameComponent 
                onComplete={(score = 0) => handleGameComplete(activeGame, score)} 
              />
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <main className="flex-1 py-8 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight uppercase text-foreground mb-3 sm:mb-4">
              Environmental Games
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light leading-relaxed text-foreground max-w-4xl mx-auto">
              Learn through fun, interactive games and challenges
            </p>
          </div>

          {/* FocusCards Display - Clickable Games */}
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <FocusCardsWithClick 
              cards={focusCardsData} 
              onGameClick={setActiveGame} 
              games={localGames} 
            />
          </div>

          {/* Game Stats for Authenticated Users */}
          {userProfile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Games</CardTitle>
                  <GamepadIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{localGames.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Interactive challenges
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Points Available</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {localGames.reduce((sum, game) => sum + (game.points || 0), 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Eco-points to earn
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Games Completed</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {localGames.filter(game => 
                      game.isBackend && getSubmissionForChallenge(game.id)?.completed
                    ).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {localGames.filter(game => game.isBackend).length} total available
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Games;