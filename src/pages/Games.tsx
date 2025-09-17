import React, { useState } from "react";
import Footer from "../components/learning-companion/Footer";
import { FocusCardsWithClick } from "@/components/ui/focus-cards";
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
      src: "/waste_segregation.png",
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
      src: "/quiz.png",
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
      src: "/carbon_footpront.png",
      component: CarbonCalculator
    }
  ];

  // FocusCards data - only the 3 available games
  const focusCardsData = games.map(game => ({ title: game.title, src: game.src }));

  if (activeGame) {
    const game = games.find(g => g.id === activeGame);
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
            {GameComponent && <GameComponent onComplete={() => setActiveGame(null)} />}
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
            <FocusCardsWithClick cards={focusCardsData} onGameClick={setActiveGame} games={games} />
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Games;