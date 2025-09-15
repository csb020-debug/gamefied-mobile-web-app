import React from "react";
import Navbar from "../components/learning-companion/Navbar";
import Footer from "../components/learning-companion/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Learn: React.FC = () => {
  const lessons = [
    {
      id: 1,
      title: "Climate Change Basics",
      description: "Understanding greenhouse gases and global warming",
      progress: 85,
      points: 100,
      difficulty: "Beginner",
      duration: "15 min",
      completed: false
    },
    {
      id: 2,
      title: "Renewable Energy Sources",
      description: "Solar, wind, and hydroelectric power explained",
      progress: 100,
      points: 150,
      difficulty: "Intermediate",
      duration: "20 min",
      completed: true
    },
    {
      id: 3,
      title: "Plastic Pollution Crisis",
      description: "Impact of plastic waste on oceans and wildlife",
      progress: 45,
      points: 120,
      difficulty: "Beginner",
      duration: "18 min",
      completed: false
    },
    {
      id: 4,
      title: "Sustainable Transportation",
      description: "Eco-friendly ways to travel and commute",
      progress: 0,
      points: 180,
      difficulty: "Advanced",
      duration: "25 min",
      completed: false
    }
  ];

  return (
    <div className="flex flex-col max-w-[1920px] mx-auto px-[70px] max-md:px-4 min-h-screen">
      <Navbar />
      
      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-[45px] font-black leading-[0.9] tracking-[-0.9px] uppercase text-black mb-4">
              Environmental Lessons
            </h1>
            <p className="text-[24px] font-light leading-[34px] text-black max-w-2xl mx-auto">
              Master environmental science through interactive lessons and earn eco-points
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-black mb-2">{lesson.title}</h3>
                    <p className="text-gray-600 mb-3">{lesson.description}</p>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="outline" className="text-xs">
                        {lesson.difficulty}
                      </Badge>
                      <span className="text-sm text-gray-500">⏱️ {lesson.duration}</span>
                      <span className="text-sm font-semibold text-[#B8EE7C]">
                        🌿 {lesson.points} points
                      </span>
                    </div>
                  </div>
                  
                  {lesson.completed && (
                    <div className="text-2xl">✅</div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">{lesson.progress}%</span>
                  </div>
                  <Progress value={lesson.progress} className="h-2" />
                </div>

                <button className="w-full bg-[#B8EE7C] text-[#0A0E09] font-bold py-3 px-4 rounded-lg hover:bg-[#96EE60] transition-colors">
                  {lesson.progress === 0 ? 'Start Lesson' : lesson.completed ? 'Review' : 'Continue'}
                </button>
              </Card>
            ))}
          </div>

          <div className="mt-12 bg-[rgba(242,242,242,1)] p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-black mb-4">Your Learning Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-black text-[#B8EE7C]">2</div>
                <div className="text-sm text-gray-600">Lessons Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-[#B8EE7C]">58%</div>
                <div className="text-sm text-gray-600">Overall Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-[#B8EE7C]">250</div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Learn;