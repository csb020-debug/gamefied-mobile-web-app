import React, { useState } from "react";
import Footer from "../components/learning-companion/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
 

const Challenges: React.FC = () => {
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([1, 3]);

  const challenges = [
    {
      id: 1,
      title: "Plant a Tree",
      description: "Plant a tree in your community or school garden",
      points: 100,
      difficulty: "Easy",
      category: "Action",
      duration: "1 hour",
      icon: "🌳",
      status: "completed",
      verification: "Photo of planted tree"
    },
    {
      id: 2,
      title: "Waste Audit Week",
      description: "Track and reduce your household waste for one week",
      points: 150,
      difficulty: "Medium",
      category: "Tracking",
      duration: "1 week",
      icon: "🗑️",
      status: "available",
      verification: "Waste log and reduction plan"
    },
    {
      id: 3,
      title: "Plastic-Free Day",
      description: "Go one full day without using single-use plastics",
      points: 75,
      difficulty: "Easy",
      category: "Lifestyle",
      duration: "1 day",
      icon: "🚫",
      status: "completed",
      verification: "Daily log with alternatives used"
    },
    {
      id: 4,
      title: "Energy Saving Challenge",
      description: "Reduce your home energy consumption by 20%",
      points: 200,
      difficulty: "Hard",
      category: "Action",
      duration: "1 month",
      icon: "⚡",
      status: "locked",
      verification: "Energy bill comparison"
    },
    {
      id: 5,
      title: "Bike to School Week",
      description: "Use sustainable transport for a full school week",
      points: 120,
      difficulty: "Medium",
      category: "Transport",
      duration: "1 week",
      icon: "🚲",
      status: "available",
      verification: "Transport log with photos"
    },
    {
      id: 6,
      title: "Organic Garden Starter",
      description: "Create a small organic vegetable garden",
      points: 180,
      difficulty: "Hard",
      category: "Action",
      duration: "2 weeks",
      icon: "🥬",
      status: "locked",
      verification: "Garden progress photos"
    }
  ];

  const handleStartChallenge = (challengeId: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge?.status === "available") {
      toast.success(`Started challenge: ${challenge.title}! Good luck! 🌟`);
    }
  };

  const handleCompleteChallenge = (challengeId: number) => {
    setCompletedChallenges([...completedChallenges, challengeId]);
    const challenge = challenges.find(c => c.id === challengeId);
    toast.success(`Challenge completed! +${challenge?.points} eco-points! 🎉`);
  };

  const totalPoints = completedChallenges.reduce((sum, id) => {
    const challenge = challenges.find(c => c.id === id);
    return sum + (challenge?.points || 0);
  }, 0);

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
                <div className="text-2xl sm:text-3xl font-black text-[#B8EE7C]">{completedChallenges.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#B8EE7C]">{totalPoints}</div>
                <div className="text-xs sm:text-sm text-gray-600">Points Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#B8EE7C]">
                  {Math.round((completedChallenges.length / challenges.length) * 100)}%
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#B8EE7C]">#5</div>
                <div className="text-xs sm:text-sm text-gray-600">School Ranking</div>
              </div>
            </div>
          </div>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {challenges.map((challenge) => {
              const isCompleted = completedChallenges.includes(challenge.id);
              const isLocked = challenge.status === "locked";
              
              return (
                <Card key={challenge.id} className={`p-4 sm:p-6 ${isLocked ? 'opacity-60' : 'hover:shadow-lg'} transition-shadow`}>
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="text-2xl sm:text-3xl">{challenge.icon}</div>
                    {isCompleted && <div className="text-xl sm:text-2xl">✅</div>}
                    {isLocked && <div className="text-xl sm:text-2xl">🔒</div>}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-black mb-2">{challenge.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{challenge.description}</p>

                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                    <Badge variant="outline" className="text-xs">
                      {challenge.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {challenge.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      ⏱️ {challenge.duration}
                    </Badge>
                  </div>

                  <div className="text-center mb-3 sm:mb-4">
                    <span className="text-base sm:text-lg font-bold text-[#B8EE7C]">
                      🌿 {challenge.points} points
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mb-3 sm:mb-4">
                    <strong>Verification:</strong> {challenge.verification}
                  </div>

                  {isCompleted ? (
                    <button className="w-full bg-green-100 text-green-800 font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg cursor-default text-sm sm:text-base">
                      ✓ Completed
                    </button>
                  ) : isLocked ? (
                    <button className="w-full bg-gray-200 text-gray-500 font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg cursor-not-allowed text-sm sm:text-base">
                      🔒 Locked
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStartChallenge(challenge.id)}
                      className="w-full bg-[#B8EE7C] text-[#0A0E09] font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-[#96EE60] transition-colors text-sm sm:text-base"
                    >
                      Start Challenge
                    </button>
                  )}
                </Card>
              );
            })}
          </div>

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