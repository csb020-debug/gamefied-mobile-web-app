import React from "react";
import Footer from "../components/learning-companion/Footer";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
 

const Profile: React.FC = () => {
  const userStats = {
    name: "Eco Champion",
    level: 8,
    currentXP: 1250,
    nextLevelXP: 1500,
    totalPoints: 3420,
    streak: 15,
    joinDate: "September 2024",
    school: "Eco High School",
    grade: "10th Grade"
  };

  const badges = [
    { name: "Tree Planter", icon: "🌳", description: "Planted 5+ trees", earned: true },
    { name: "Quiz Master", icon: "🎯", description: "100% score on 10 quizzes", earned: true },
    { name: "Waste Warrior", icon: "♻️", description: "Completed waste challenges", earned: true },
    { name: "Energy Saver", icon: "⚡", description: "Reduced energy by 30%", earned: false },
    { name: "Eco Educator", icon: "📚", description: "Taught others about environment", earned: false },
    { name: "Carbon Fighter", icon: "🌍", description: "Offset 100kg of CO2", earned: true },
  ];

  const recentActivities = [
    { date: "Today", activity: "Completed Carbon Calculator Game", points: 85 },
    { date: "Yesterday", activity: "Finished Renewable Energy Quiz", points: 75 },
    { date: "2 days ago", activity: "Started Bike to School Challenge", points: 50 },
    { date: "3 days ago", activity: "Completed Waste Sorting Game", points: 40 },
    { date: "1 week ago", activity: "Planted a tree (Challenge)", points: 100 },
  ];

  const achievements = [
    { title: "First Challenge", description: "Complete your first eco-challenge", completed: true },
    { title: "Game Explorer", description: "Play all 3 environmental games", completed: true },
    { title: "Learning Streak", description: "Maintain a 7-day learning streak", completed: true },
    { title: "Points Collector", description: "Earn 1000+ eco-points", completed: true },
    { title: "School Leader", description: "Reach top 10 in school rankings", completed: false },
    { title: "Eco Master", description: "Reach Level 10", completed: false },
  ];

  return (
    <div className="min-h-screen bg-white relative">
      <main className="flex-1 py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Profile Header */}
          <Card className="p-8 mb-10 shadow-lg border border-black/5">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-24 h-24 bg-[#B8EE7C] rounded-full flex items-center justify-center text-4xl font-bold text-[#0A0E09]">
                {userStats.name.charAt(0)}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#0A0E09] mb-2">{userStats.name}</h1>
                <p className="text-gray-600 mb-4">{userStats.school} • {userStats.grade}</p>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <div className="font-semibold text-[#0A0E09]">Level {userStats.level}</div>
                      <div className="text-sm text-gray-600">{userStats.currentXP}/{userStats.nextLevelXP} XP</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌿</span>
                    <div>
                      <div className="font-semibold text-[#0A0E09]">{userStats.totalPoints}</div>
                      <div className="text-sm text-gray-600">Total Points</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <div className="font-semibold text-orange-500">{userStats.streak} days</div>
                      <div className="text-sm text-gray-600">Learning Streak</div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress to Level {userStats.level + 1}</span>
                    <span>{Math.round((userStats.currentXP / userStats.nextLevelXP) * 100)}%</span>
                  </div>
                  <Progress value={(userStats.currentXP / userStats.nextLevelXP) * 100} className="h-3" />
                </div>
              </div>
            </div>
          </Card>

          <BentoGrid>
            <BentoGridItem
              title={"🏅 Eco Badges"}
              header={(
                <div className="pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    {badges.map((badge, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl text-center transition-all ring-1 ${
                          badge.earned
                            ? 'bg-[#B8EE7C]/15 ring-black/5'
                            : 'bg-gray-50 ring-black/5'
                        }`}
                      >
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <div className="font-semibold text-sm text-[#0A0E09]">{badge.name}</div>
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
                  <div className="space-y-3">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <div className="font-medium text-[#0A0E09] text-sm">{activity.activity}</div>
                          <div className="text-xs text-gray-600">{activity.date}</div>
                        </div>
                        <div className="font-bold text-[#0A0E09]">+{activity.points}</div>
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
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          achievement.completed ? 'bg-[#B8EE7C]' : 'bg-gray-200'
                        }`}>
                          {achievement.completed && <span className="text-white text-sm">✓</span>}
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${achievement.completed ? 'text-[#0A0E09]' : 'text-gray-500'}`}>
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
              className="md:col-span-2"
              title={"📈 Your Impact"}
              header={(
                <div className="pt-2">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Trees Planted</span>
                      <span className="font-bold text-green-600">7 🌳</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">CO2 Offset</span>
                      <span className="font-bold text-blue-600">156 kg 🌍</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Waste Diverted</span>
                      <span className="font-bold text-purple-600">23 kg ♻️</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Energy Saved</span>
                      <span className="font-bold text-yellow-600">450 kWh ⚡</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Friends Inspired</span>
                      <span className="font-bold text-pink-600">12 people 👥</span>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-[#B8EE7C]/15 rounded-xl text-center ring-1 ring-black/5">
                    <div className="font-bold text-[#0A0E09]">Environmental Impact Score</div>
                    <div className="text-2xl font-black text-[#0A0E09]">A+</div>
                    <div className="text-sm text-gray-600">Keep up the amazing work! 🌟</div>
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