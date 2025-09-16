import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import GameLayout from "@/components/games/GameLayout";
import GameHUD from "@/components/games/GameHUD";
import { useGameEngine } from "@/hooks/useGameEngine";

interface RecycleGameProps {
  onComplete: () => void;
}

const RecycleGame: React.FC<RecycleGameProps> = ({ onComplete }) => {
  const engine = useGameEngine({ initialLives: 3, initialScore: 0, autoStart: true });
  const [currentItem, setCurrentItem] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const items = [
    { name: "Plastic Water Bottle", category: "plastic", emoji: "🍼" },
    { name: "Newspaper", category: "paper", emoji: "📰" },
    { name: "Banana Peel", category: "organic", emoji: "🍌" },
    { name: "Aluminum Can", category: "metal", emoji: "🥤" },
    { name: "Glass Jar", category: "glass", emoji: "🫙" },
    { name: "Pizza Box", category: "paper", emoji: "📦" },
    { name: "Apple Core", category: "organic", emoji: "🍎" },
    { name: "Steel Can", category: "metal", emoji: "🥫" }
  ];

  const categories = [
    { name: "Plastic", id: "plastic", color: "bg-blue-100", icon: "♻️" },
    { name: "Paper", id: "paper", color: "bg-green-100", icon: "📄" },
    { name: "Organic", id: "organic", color: "bg-yellow-100", icon: "🍃" },
    { name: "Metal", id: "metal", color: "bg-gray-100", icon: "🔧" },
    { name: "Glass", id: "glass", color: "bg-purple-100", icon: "🥃" }
  ];

  const handleSort = (categoryId: string) => {
    const item = items[currentItem];
    if (item.category === categoryId) {
      engine.addPoints(10);
      toast.success(`Correct! +10 points`);
    } else {
      engine.miss();
      toast.error(`Wrong! ${item.name} goes in ${item.category}`);
    }

    if (currentItem < items.length - 1) {
      setCurrentItem(currentItem + 1);
    } else {
      setGameComplete(true);
      toast.success(`Game complete!`);
    }
  };

  const resetGame = () => {
    setCurrentItem(0);
    setGameComplete(false);
    engine.reset();
  };

  if (gameComplete) {
    return (
      <GameLayout
        hud={<GameHUD score={engine.score} streak={engine.streak} lives={engine.lives} maxLives={engine.maxLives} onReset={resetGame} />}
      >
        <Card className="p-8 text-center w-full">
          <h2 className="text-3xl font-bold text-black mb-4">🎉 Game Complete!</h2>
          <div className="text-6xl mb-4">♻️</div>
          <p className="text-xl mb-4">Final Score: <span className="font-bold text-[#B8EE7C]">{engine.score}</span> points</p>
          <p className="text-gray-600 mb-6">
            You correctly sorted {engine.score / 10} out of {items.length} items!
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={resetGame}
              className="bg-[#B8EE7C] text-[#0A0E09] font-bold py-3 px-6 rounded-lg hover:bg-[#96EE60] transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={onComplete}
              className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Games
            </button>
          </div>
        </Card>
      </GameLayout>
    );
  }

  const item = items[currentItem];

  return (
    <GameLayout
      hud={<GameHUD score={engine.score} streak={engine.streak} lives={engine.lives} maxLives={engine.maxLives} onReset={resetGame} />}
    >
      <Card className="p-8 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-2">Waste Sorting Challenge</h2>
          <p className="text-gray-600">Sort the items into the correct recycling categories!</p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-lg font-semibold">Score: {engine.score}</span>
            <span className="text-lg font-semibold">Item {currentItem + 1}/{items.length}</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="text-8xl mb-4">{item.emoji}</div>
          <h3 className="text-2xl font-bold text-black">{item.name}</h3>
          <p className="text-gray-600 mt-2">Where does this item belong?</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleSort(category.id)}
              className={`${category.color} p-6 rounded-lg text-center hover:opacity-80 transition-opacity border-2 border-transparent hover:border-gray-300`}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className="font-semibold text-black">{category.name}</div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="bg-gray-200 rounded-full h-4">
            <div 
              className="bg-[#B8EE7C] h-4 rounded-full transition-all duration-300"
              style={{ width: `${((currentItem) / items.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">Progress: {Math.round(((currentItem) / items.length) * 100)}%</p>
        </div>
      </Card>
    </GameLayout>
  );
};

export default RecycleGame;