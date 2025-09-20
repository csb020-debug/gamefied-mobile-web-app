import React, { useState, useEffect } from "react";
import Footer from "../components/learning-companion/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedProgress } from "@/components/ui/AnimatedProgress";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useStudent } from "@/hooks/useStudent";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
 

const Leaderboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("students");
  const { studentLeaderboard, schoolLeaderboard, loading, getStudentStats } = useLeaderboard();
  const { currentStudent, currentClass } = useStudent();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const studentStats = getStudentStats();

  // Fallback data for weekly toppers (this could be enhanced with real data)
  const weeklyToppers = studentLeaderboard.slice(0, 3).map(student => ({
    name: student.name,
    points: Math.floor(student.points / 10), // Show weekly subset
    achievement: student.rank === 1 ? "Top Performer" : student.rank === 2 ? "Quiz Master" : "Eco Warrior"
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
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
          <p className="text-muted-foreground mb-6">You need to sign in to view the leaderboard.</p>
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
          <p className="text-muted-foreground mb-6">You need to join a class to view the leaderboard.</p>
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
              Eco Leaderboard
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light leading-relaxed text-foreground max-w-4xl mx-auto">
              See how you rank among eco-champions in your school and beyond
            </p>
          </div>

          {/* Weekly Top Performers */}
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <Card className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-[#B8EE7C]/20 to-[#96EE60]/20">
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6 text-center">🌟 This Week's Top Performers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {weeklyToppers.map((user, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl sm:text-4xl mb-2">
                      {index === 0 ? "👑" : index === 1 ? "⭐" : "🏅"}
                    </div>
                    <div className="font-bold text-black text-sm sm:text-base">{user.name}</div>
                    <div className="text-[#B8EE7C] font-semibold text-sm sm:text-base">{user.points} points</div>
                    <div className="text-xs sm:text-sm text-gray-600">{user.achievement}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Tabs defaultValue="students" className="space-y-6 sm:space-y-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="students" className="text-xs sm:text-sm">Student Rankings</TabsTrigger>
              <TabsTrigger value="schools" className="text-xs sm:text-sm">School Rankings</TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="space-y-4 sm:space-y-6">
              <div className="grid gap-3 sm:gap-4">
                {studentLeaderboard.map((student) => (
                  <Card key={student.rank} className={`p-4 sm:p-6 ${student.isCurrentUser ? 'ring-2 ring-[#B8EE7C] bg-[#B8EE7C]/5' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="text-lg sm:text-2xl font-bold text-gray-500 min-w-[1.5rem] sm:min-w-[2rem]">
                          {student.badge || `#${student.rank}`}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm sm:text-lg ${student.isCurrentUser ? 'text-[#B8EE7C]' : 'text-black'} truncate`}>
                              {student.name}
                            </span>
                            {student.isCurrentUser && <Badge className="bg-[#B8EE7C] text-[#0A0E09] text-xs">You</Badge>}
                          </div>
                          <div className="text-gray-600 text-xs sm:text-sm truncate">{student.school}</div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-2">
                        <div className="text-lg sm:text-2xl font-bold text-[#B8EE7C]">{student.points.toLocaleString()}</div>
                        <div className="text-xs sm:text-sm text-gray-600">🔥 {student.streak} day streak</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-4 sm:p-6 bg-[rgba(242,242,242,1)]">
                <h3 className="text-base sm:text-lg font-bold text-black mb-3 sm:mb-4">Your Stats This Month</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-[#B8EE7C]">{studentStats?.pointsGained || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Points Gained</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-[#B8EE7C]">+{studentStats?.rankChange || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Rank Change</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-[#B8EE7C]">{studentStats?.challengesDone || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Challenges Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-[#B8EE7C]">{studentStats?.gamesPlayed || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Games Played</div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="schools" className="space-y-4 sm:space-y-6">
              <div className="grid gap-3 sm:gap-4">
                {schoolLeaderboard.map((school) => (
                  <Card key={school.rank} className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="text-lg sm:text-2xl font-bold text-gray-500 min-w-[1.5rem] sm:min-w-[2rem]">
                          {school.badge || `#${school.rank}`}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm sm:text-lg text-black truncate">{school.name}</div>
                          <div className="text-gray-600 text-xs sm:text-sm">{school.students} active students</div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-2">
                        <div className="text-lg sm:text-2xl font-bold text-[#B8EE7C]">{school.totalPoints.toLocaleString()}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Avg: {school.avgPoints} pts/student</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-4 sm:p-6 bg-[rgba(242,242,242,1)]">
                <h3 className="text-base sm:text-lg font-bold text-black mb-3 sm:mb-4">School Competition Progress</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <AnimatedProgress
                      value={8420}
                      max={12000}
                      label="Monthly Goal Progress"
                      showGlow={true}
                      color="bg-[#B8EE7C]"
                      height="h-3"
                      showPercentage={true}
                    />
                      <div className="text-center mt-2">
                        <span className="text-xs sm:text-sm text-gray-600">8,420 / 12,000 points</span>
                      </div>
                  </div>
                  <div className="text-center pt-3 sm:pt-4">
                    <p className="text-xs sm:text-sm text-gray-600">Your school is <span className="font-bold text-[#B8EE7C]">3,580 points</span> away from winning this month's eco-trophy! 🏆</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;