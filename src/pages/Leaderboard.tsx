import React, { useState } from "react";
import Navbar from "../components/learning-companion/Navbar";
import Footer from "../components/learning-companion/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Leaderboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("students");

  const studentLeaderboard = [
    { rank: 1, name: "Emma Green", school: "Eco High School", points: 2850, streak: 15, badge: "🥇" },
    { rank: 2, name: "Alex River", school: "Nature Academy", points: 2720, streak: 12, badge: "🥈" },
    { rank: 3, name: "Sam Forest", school: "Green Valley School", points: 2650, streak: 18, badge: "🥉" },
    { rank: 4, name: "Maya Ocean", school: "Eco High School", points: 2500, streak: 9, badge: "" },
    { rank: 5, name: "You", school: "Eco High School", points: 1250, streak: 5, badge: "", isCurrentUser: true },
    { rank: 6, name: "Jake Stone", school: "Earth School", points: 1180, streak: 7, badge: "" },
    { rank: 7, name: "Luna Sky", school: "Nature Academy", points: 1050, streak: 4, badge: "" },
    { rank: 8, name: "Rio Wind", school: "Green Valley School", points: 980, streak: 6, badge: "" },
  ];

  const schoolLeaderboard = [
    { rank: 1, name: "Eco High School", totalPoints: 15420, students: 186, avgPoints: 83, badge: "🏆" },
    { rank: 2, name: "Nature Academy", totalPoints: 14890, students: 201, avgPoints: 74, badge: "🥈" },
    { rank: 3, name: "Green Valley School", totalPoints: 13650, students: 165, avgPoints: 83, badge: "🥉" },
    { rank: 4, name: "Earth School", totalPoints: 12300, students: 143, avgPoints: 86, badge: "" },
    { rank: 5, name: "Sustainability College", totalPoints: 11800, students: 198, avgPoints: 60, badge: "" },
  ];

  const weeklyToppers = [
    { name: "Emma Green", points: 450, achievement: "Challenge Master" },
    { name: "Alex River", points: 380, achievement: "Quiz Champion" },
    { name: "Sam Forest", points: 350, achievement: "Eco Warrior" },
  ];

  return (
    <div className="flex flex-col max-w-[1920px] mx-auto px-[70px] max-md:px-4 min-h-screen">
      <Navbar />
      
      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-[45px] font-black leading-[0.9] tracking-[-0.9px] uppercase text-black mb-4">
              Eco Leaderboard
            </h1>
            <p className="text-[24px] font-light leading-[34px] text-black max-w-2xl mx-auto">
              See how you rank among eco-champions in your school and beyond
            </p>
          </div>

          {/* Weekly Top Performers */}
          <div className="mb-12">
            <Card className="p-8 bg-gradient-to-r from-[#B8EE7C]/20 to-[#96EE60]/20">
              <h2 className="text-2xl font-bold text-black mb-6 text-center">🌟 This Week's Top Performers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {weeklyToppers.map((user, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl mb-2">
                      {index === 0 ? "👑" : index === 1 ? "⭐" : "🏅"}
                    </div>
                    <div className="font-bold text-black">{user.name}</div>
                    <div className="text-[#B8EE7C] font-semibold">{user.points} points</div>
                    <div className="text-sm text-gray-600">{user.achievement}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Tabs defaultValue="students" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="students">Student Rankings</TabsTrigger>
              <TabsTrigger value="schools">School Rankings</TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="space-y-6">
              <div className="grid gap-4">
                {studentLeaderboard.map((student) => (
                  <Card key={student.rank} className={`p-6 ${student.isCurrentUser ? 'ring-2 ring-[#B8EE7C] bg-[#B8EE7C]/5' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-gray-500 min-w-[2rem]">
                          {student.badge || `#${student.rank}`}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-lg ${student.isCurrentUser ? 'text-[#B8EE7C]' : 'text-black'}`}>
                              {student.name}
                            </span>
                            {student.isCurrentUser && <Badge className="bg-[#B8EE7C] text-[#0A0E09]">You</Badge>}
                          </div>
                          <div className="text-gray-600 text-sm">{student.school}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#B8EE7C]">{student.points.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">🔥 {student.streak} day streak</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-6 bg-[rgba(242,242,242,1)]">
                <h3 className="text-lg font-bold text-black mb-4">Your Stats This Month</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#B8EE7C]">350</div>
                    <div className="text-sm text-gray-600">Points Gained</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#B8EE7C]">+12</div>
                    <div className="text-sm text-gray-600">Rank Change</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#B8EE7C]">8</div>
                    <div className="text-sm text-gray-600">Challenges Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#B8EE7C]">15</div>
                    <div className="text-sm text-gray-600">Games Played</div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="schools" className="space-y-6">
              <div className="grid gap-4">
                {schoolLeaderboard.map((school) => (
                  <Card key={school.rank} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-gray-500 min-w-[2rem]">
                          {school.badge || `#${school.rank}`}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-black">{school.name}</div>
                          <div className="text-gray-600 text-sm">{school.students} active students</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#B8EE7C]">{school.totalPoints.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Avg: {school.avgPoints} pts/student</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-6 bg-[rgba(242,242,242,1)]">
                <h3 className="text-lg font-bold text-black mb-4">School Competition Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Monthly Goal Progress</span>
                      <span className="text-sm text-gray-600">8,420 / 12,000 points</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-[#B8EE7C] h-3 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <div className="text-center pt-4">
                    <p className="text-gray-600">Your school is <span className="font-bold text-[#B8EE7C]">3,580 points</span> away from winning this month's eco-trophy! 🏆</p>
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