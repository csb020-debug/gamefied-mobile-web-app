import React, { useState } from "react";
import Navbar from "../components/learning-companion/Navbar";
import Footer from "../components/learning-companion/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RecycleGame from "../components/games/RecycleGame";
import EnergyQuiz from "../components/games/EnergyQuiz";
import CarbonCalculator from "../components/games/CarbonCalculator";

const Games: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    {
      id: "recycle",
      title: "Waste Sorting Challenge",
      description: "Sort waste items into correct recycling categories",
      points: 50,
      difficulty: "Easy",
      duration: "5 min",
      icon: "♻️",
      component: RecycleGame
    },
    {
      id: "energy",
      title: "Renewable Energy Quiz",
      description: "Test your knowledge about clean energy sources",
      points: 75,
      difficulty: "Medium",
      duration: "8 min", 
      icon: "⚡",
      component: EnergyQuiz
    },
    {
      id: "carbon",
      title: "Carbon Footprint Calculator",
      description: "Calculate and reduce your daily carbon footprint",
      points: 100,
      difficulty: "Hard",
      duration: "10 min",
      icon: "🌍",
      component: CarbonCalculator
    }
  ];

  if (activeGame) {
    const game = games.find(g => g.id === activeGame);
    const GameComponent = game?.component;
    
    return (
      <div className="flex flex-col max-w-[1920px] mx-auto px-[70px] max-md:px-4 min-h-screen">
        <Navbar />
        <main className="flex-1 py-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setActiveGame(null)}
                className="text-[#B8EE7C] hover:text-[#96EE60] font-semibold"
              >
                ← Back to Games
              </button>
            </div>
            {GameComponent && <GameComponent onComplete={() => setActiveGame(null)} />}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-[1920px] mx-auto px-[70px] max-md:px-4 min-h-screen">
      <Navbar />
      
      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-[45px] font-black leading-[0.9] tracking-[-0.9px] uppercase text-black mb-4">
              Environmental Games
            </h1>
            <p className="text-[24px] font-light leading-[34px] text-black max-w-2xl mx-auto">
              Learn through fun, interactive games and challenges
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game) => (
              <Card key={game.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setActiveGame(game.id)}>
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{game.icon}</div>
                  <h3 className="text-xl font-bold text-black mb-2">{game.title}</h3>
                  <p className="text-gray-600 mb-4">{game.description}</p>
                </div>

                <div className="flex justify-center gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">
                    {game.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ⏱️ {game.duration}
                  </Badge>
                </div>

                <div className="text-center mb-4">
                  <span className="text-lg font-bold text-[#B8EE7C]">
                    🌿 {game.points} points
                  </span>
                </div>

                <button className="w-full bg-[#B8EE7C] text-[#0A0E09] font-bold py-3 px-4 rounded-lg hover:bg-[#96EE60] transition-colors">
                  Play Game
                </button>
              </Card>
            ))}
          </div>

          <div className="mt-12 bg-[rgba(242,242,242,1)] p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-black mb-6">Game Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-black text-[#B8EE7C]">12</div>
                <div className="text-sm text-gray-600">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-[#B8EE7C]">85%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-[#B8EE7C]">750</div>
                <div className="text-sm text-gray-600">Points from Games</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-[#B8EE7C]">#3</div>
                <div className="text-sm text-gray-600">School Ranking</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Games;