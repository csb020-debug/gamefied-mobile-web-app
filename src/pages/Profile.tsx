import React from "react";
import Footer from "../components/learning-companion/Footer";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { useProfile } from "@/hooks/useProfile";
import { useStudent } from "@/hooks/useStudent";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
 

const Profile: React.FC = () => {
  const { userStats, badges, achievements, recentActivities, environmentalImpact, loading } = useProfile();
  const { currentStudent, currentClass } = useStudent();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
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
          <p className="text-muted-foreground mb-6">You need to sign in to view your profile.</p>
          <Button onClick={() => navigate('/teachers/signup')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // For students, check if they've joined a class
  if (userProfile?.role === 'student' && (!currentStudent || !currentClass || !userStats)) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Join a Class First</h1>
          <p className="text-muted-foreground mb-6">You need to join a class to view your profile.</p>
          <Button onClick={() => navigate('/join')}>
            Join Class
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      <main className="flex-1 py-8 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <Card className="p-4 sm:p-6 lg:p-8 mb-8 sm:mb-10 shadow-lg border border-black/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-[#B8EE7C] rounded-full flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0A0E09]">
                {userStats.name.charAt(0)}
              </div>
              
              <div className="flex-1 w-full">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0A0E09] mb-2">{userStats.name}</h1>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{userStats.school} • {userStats.grade}</p>
                
                <div className="flex flex-wrap gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🏆</span>
                    <div>
                      <div className="font-semibold text-[#0A0E09] text-sm sm:text-base">Level {userStats.level}</div>
                      <div className="text-xs sm:text-sm text-gray-600">{userStats.currentXP}/{userStats.nextLevelXP} XP</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🌿</span>
                    <div>
                      <div className="font-semibold text-[#0A0E09] text-sm sm:text-base">{userStats.totalPoints}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Total Points</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🔥</span>
                    <div>
                      <div className="font-semibold text-orange-500 text-sm sm:text-base">{userStats.streak} days</div>
                      <div className="text-xs sm:text-sm text-gray-600">Learning Streak</div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span>Progress to Level {userStats.level + 1}</span>
                    <span>{Math.round((userStats.currentXP / userStats.nextLevelXP) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(userStats.currentXP / userStats.nextLevelXP) * 100} 
                    className="h-2 sm:h-3" 
                    showGlow={true}
                  />
                </div>
              </div>
            </div>
          </Card>

          <BentoGrid>
            <BentoGridItem
              title={"🏅 Eco Badges"}
              header={(
                <div className="pt-2">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                     {badges.map((badge, index) => (
                       <div
                         key={index}
                         className={`p-3 sm:p-4 rounded-xl text-center transition-all ring-1 ${
                           badge.earned
                             ? 'bg-[#B8EE7C]/15 ring-black/5'
                             : 'bg-gray-50 ring-black/5'
                         }`}
                       >
                         <div className="text-2xl sm:text-3xl mb-2">{badge.icon}</div>
                         <div className="font-semibold text-xs sm:text-sm text-[#0A0E09]">{badge.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{badge.description}</div>
                        {badge.earned && (
                          <div className="text-[10px] text-[#0A0E09] font-bold mt-1">✓ EARNED</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />

            <BentoGridItem
              title={"📊 Recent Activity"}
              header={(
                <div className="pt-2">
                   <div className="space-y-2 sm:space-y-3">
                     {recentActivities.map((activity, index) => (
                       <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                         <div className="min-w-0 flex-1">
                           <div className="font-medium text-[#0A0E09] text-xs sm:text-sm truncate">{activity.activity}</div>
                           <div className="text-xs text-gray-600">{activity.date}</div>
                         </div>
                         <div className="font-bold text-[#0A0E09] text-sm sm:text-base ml-2">+{activity.points}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />

            <BentoGridItem
              title={"🎯 Achievements"}
              header={(
                <div className="pt-2">
                   <div className="space-y-2 sm:space-y-3">
                     {achievements.map((achievement, index) => (
                       <div key={index} className="flex items-center gap-2 sm:gap-3">
                         <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                           achievement.completed ? 'bg-[#B8EE7C]' : 'bg-gray-200'
                         }`}>
                           {achievement.completed && <span className="text-white text-xs sm:text-sm">✓</span>}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className={`font-medium text-xs sm:text-sm ${achievement.completed ? 'text-[#0A0E09]' : 'text-gray-500'}`}>
                            {achievement.title}
                          </div>
                          <div className="text-xs text-gray-600">{achievement.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />

              <BentoGridItem
               className="sm:col-span-2"
               title={"📈 Your Impact"}
               header={(
                 <div className="pt-2">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-xs sm:text-sm">Trees Planted</span>
                        <span className="font-bold text-green-600 text-sm sm:text-base">{environmentalImpact?.treesPlanted || 0} 🌳</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-xs sm:text-sm">CO2 Offset</span>
                        <span className="font-bold text-blue-600 text-sm sm:text-base">{environmentalImpact?.co2Offset || 0} kg 🌍</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-xs sm:text-sm">Waste Recycled</span>
                        <span className="font-bold text-purple-600 text-sm sm:text-base">{environmentalImpact?.wasteRecycled || 0} kg ♻️</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-xs sm:text-sm">Energy Saved</span>
                        <span className="font-bold text-yellow-600 text-sm sm:text-base">{environmentalImpact?.energySaved || 0} kWh ⚡</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-xs sm:text-sm">Friends Inspired</span>
                        <span className="font-bold text-pink-600 text-sm sm:text-base">{environmentalImpact?.friendsInspired || 0} people 👥</span>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#B8EE7C]/15 rounded-xl text-center ring-1 ring-black/5">
                      <div className="font-bold text-[#0A0E09] text-sm sm:text-base">Environmental Impact Score</div>
                      <div className="text-xl sm:text-2xl font-black text-[#0A0E09]">{environmentalImpact?.score || 'B'}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Keep up the amazing work! 🌟</div>
                    </div>
                </div>
              )}
            />
          </BentoGrid>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;