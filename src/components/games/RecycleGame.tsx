import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import GameLayout from "@/components/games/GameLayout";
import GameHUD from "@/components/games/GameHUD";
import { useGameEngine } from "@/hooks/useGameEngine";
import { AnimatedProgress } from "@/components/ui/AnimatedProgress";

interface RecycleGameProps {
  onComplete: () => void;
}

const RecycleGame: React.FC<RecycleGameProps> = ({ onComplete }) => {
  const engine = useGameEngine({ initialLives: 3, initialScore: 0, autoStart: true });
  const [currentItem, setCurrentItem] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const items = [
    { 
      name: "Plastic Water Bottle", 
      category: "plastic", 
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop&crop=center&auto=format&q=80", 
      description: "Clear plastic container" 
    },
    { 
      name: "Newspaper", 
      category: "paper", 
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=300&fit=crop&crop=center&auto=format&q=80", 
      description: "Daily news print" 
    },
    { 
      name: "Banana Peel", 
      category: "organic", 
      image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop&crop=center&auto=format&q=80", 
      description: "Fruit waste" 
    },
    { 
      name: "Aluminum Can", 
      category: "metal", 
      image: "https://images.unsplash.com/photo-1594736797933-d0ee2a448315?w=300&h=300&fit=crop&crop=center&auto=format&q=80", 
      description: "Metal beverage container" 
    },
    { 
      name: "Glass Jar", 
      category: "glass", 
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop&crop=center&auto=format&q=80", 
      description: "Glass food container" 
    },
    { 
      name: "Pizza Box", 
      category: "paper", 
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=300&fit=crop&crop=center&auto=format&q=80", 
      description: "Cardboard food packaging" 
    },
    { 
      name: "Apple Core", 
      category: "organic", 
      image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop&crop=center&auto=format&q=80", 
      description: "Fruit remains" 
    },
    { 
      name: "Steel Can", 
      category: "metal", 
      image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300&h=300&fit=crop&crop=center&auto=format&q=80", 
      description: "Metal food container" 
    }
  ];

  const categories = [
    { 
      name: "Plastic", 
      id: "plastic", 
      gradient: "from-blue-400 to-blue-600", 
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      icon: "♻️",
      description: "Recyclable plastics"
    },
    { 
      name: "Paper", 
      id: "paper", 
      gradient: "from-green-400 to-green-600", 
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      icon: "📄",
      description: "Paper & cardboard"
    },
    { 
      name: "Organic", 
      id: "organic", 
      gradient: "from-yellow-400 to-orange-500", 
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      icon: "🍃",
      description: "Food waste & compost"
    },
    { 
      name: "Metal", 
      id: "metal", 
      gradient: "from-gray-400 to-gray-600", 
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      icon: "🔧",
      description: "Metal containers"
    },
    { 
      name: "Glass", 
      id: "glass", 
      gradient: "from-purple-400 to-purple-600", 
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      icon: "🥃",
      description: "Glass containers"
    }
  ];

  const handleSort = (categoryId: string) => {
    if (showFeedback) return; // Prevent multiple clicks during feedback
    
    const item = items[currentItem];
    const correct = item.category === categoryId;
    
    setSelectedCategory(categoryId);
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      engine.addPoints(10);
      toast.success(`Correct! +10 points`, {
        style: {
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontWeight: '600'
        }
      });
    } else {
      engine.miss();
      toast.error(`Wrong! ${item.name} goes in ${item.category}`, {
        style: {
          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontWeight: '600'
        }
      });
    }

    // Auto-advance after feedback
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedCategory(null);
      
      if (currentItem < items.length - 1) {
        setCurrentItem(currentItem + 1);
      } else {
        setGameComplete(true);
        toast.success(`🎉 Game Complete! Final Score: ${engine.score}`, {
          style: {
            background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600'
          }
        });
      }
    }, 1500);
  };

  const resetGame = () => {
    setCurrentItem(0);
    setGameComplete(false);
    setSelectedCategory(null);
    setShowFeedback(false);
    setIsCorrect(false);
    engine.reset();
  };

  if (gameComplete) {
    const correctAnswers = engine.score / 10;
    const accuracy = Math.round((correctAnswers / items.length) * 100);
    
    return (
      <GameLayout
        hud={<GameHUD score={engine.score} streak={engine.streak} lives={engine.lives} maxLives={engine.maxLives} onReset={resetGame} />}
      >
        <Card className="relative overflow-hidden p-8 text-center w-full bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-blue-200/30 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-200/30 to-orange-200/30 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="text-8xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-4xl font-black text-gray-800 mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Game Complete!
            </h2>
            <p className="text-lg text-gray-600 mb-8">Great job sorting waste items!</p>
            
            {/* Score display */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/50">
              <div className="text-5xl font-black text-green-600 mb-2">{engine.score}</div>
              <div className="text-lg font-semibold text-gray-700 mb-4">Total Points</div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-green-100 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-700">{correctAnswers}</div>
                  <div className="text-sm text-green-600">Correct</div>
                </div>
                <div className="bg-blue-100 rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-700">{accuracy}%</div>
                  <div className="text-sm text-blue-600">Accuracy</div>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetGame}
                className="group relative bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-8 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>🔄</span>
                  Play Again
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={onComplete}
                className="group relative bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold py-4 px-8 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>←</span>
                  Back to Games
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
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
      <Card className="relative overflow-hidden p-6 sm:p-8 w-full bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 shadow-xl">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-yellow-200/20 to-orange-200/20 rounded-full translate-y-10 -translate-x-10"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-800 mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Waste Sorting Challenge
            </h2>
            <p className="text-gray-600 text-lg">Sort the items into the correct recycling categories!</p>
            
            {/* Game stats */}
            <div className="flex justify-between items-center mt-6 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
              <div className="text-center">
                <div className="text-2xl font-black text-green-600">{engine.score}</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-blue-600">{currentItem + 1}/{items.length}</div>
                <div className="text-sm text-gray-600">Item</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-purple-600">{Math.round(((currentItem + 1) / items.length) * 100)}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
          </div>

          {/* Item to sort */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className={`relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 transition-all duration-500 transform ${
                showFeedback ? (isCorrect ? 'scale-110 animate-bounce' : 'scale-95 animate-pulse') : 'scale-100'
              }`}>
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover rounded-2xl shadow-lg border-4 border-white"
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                {/* Fallback emoji display */}
                <div className="hidden text-8xl sm:text-9xl flex items-center justify-center w-full h-full bg-gray-100 rounded-2xl">
                  {item.name === "Plastic Water Bottle" && "🍼"}
                  {item.name === "Newspaper" && "📰"}
                  {item.name === "Banana Peel" && "🍌"}
                  {item.name === "Aluminum Can" && "🥤"}
                  {item.name === "Glass Jar" && "🫙"}
                  {item.name === "Pizza Box" && "📦"}
                  {item.name === "Apple Core" && "🍎"}
                  {item.name === "Steel Can" && "🥫"}
                </div>
              </div>
              {showFeedback && (
                <div className={`absolute -top-2 -right-2 text-4xl animate-bounce ${
                  isCorrect ? 'text-green-500' : 'text-red-500'
                }`}>
                  {isCorrect ? '✅' : '❌'}
                </div>
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{item.name}</h3>
            <p className="text-gray-600 text-lg mb-2">{item.description}</p>
            <p className="text-gray-500 font-medium">Where does this item belong?</p>
          </div>

          {/* Category buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              const isCorrectCategory = item.category === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleSort(category.id)}
                  disabled={showFeedback}
                  className={`group relative ${category.bgColor} ${category.borderColor} p-4 sm:p-6 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 border-2 ${
                    showFeedback && isSelected
                      ? isCorrect
                        ? 'ring-4 ring-green-400 ring-opacity-50 bg-green-100 border-green-400'
                        : 'ring-4 ring-red-400 ring-opacity-50 bg-red-100 border-red-400'
                      : showFeedback && isCorrectCategory
                      ? 'ring-4 ring-green-400 ring-opacity-50 bg-green-100 border-green-400'
                      : 'hover:shadow-lg hover:border-opacity-60'
                  } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className={`text-3xl sm:text-4xl mb-2 transition-transform duration-300 ${
                    showFeedback && isSelected ? 'scale-110' : 'group-hover:scale-110'
                  }`}>
                    {category.icon}
                  </div>
                  <div className="font-bold text-gray-800 text-sm sm:text-base mb-1">{category.name}</div>
                  <div className="text-xs text-gray-600 hidden sm:block">{category.description}</div>
                  
                  {/* Hover effect overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                </button>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-8">
            <AnimatedProgress
              value={currentItem}
              max={items.length}
              label="Sorting Progress"
              showGlow={true}
              color="bg-gradient-to-r from-green-500 to-blue-500"
              height="h-3"
              showPercentage={true}
            />
          </div>
        </div>
      </Card>
    </GameLayout>
  );
};

export default RecycleGame;