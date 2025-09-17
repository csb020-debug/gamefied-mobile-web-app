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
      src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
      src: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=3072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
      src: "https://images.unsplash.com/photo-1569163139394-de446e504e4e?q=80&w=3070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
    <div className="min-h-screen bg-background relative">
      <main className="flex-1 py-10">
      <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-[45px] font-black leading-[0.9] tracking-[-0.9px] uppercase text-foreground mb-4">
              Environmental Games
            </h1>
            <p className="text-[24px] font-light leading-[34px] text-foreground max-w-2xl mx-auto">
              Learn through fun, interactive games and challenges
            </p>
          </div>

          {/* FocusCards Display - Clickable Games */}
          <div className="mb-12">
            <FocusCardsWithClick cards={focusCardsData} onGameClick={setActiveGame} games={games} />
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Games;