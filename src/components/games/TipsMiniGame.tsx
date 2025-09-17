import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface TipsMiniGameProps {
  onComplete: (points: number) => void;
  onClose: () => void;
}

interface Tip {
  id: number;
  category: string;
  title: string;
  description: string;
  impact: number; // CO2 reduction in kg
  difficulty: "Easy" | "Medium" | "Hard";
  icon: string;
  actionable: boolean;
}

const TipsMiniGame: React.FC<TipsMiniGameProps> = ({ onComplete, onClose }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [selectedTips, setSelectedTips] = useState<Tip[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gamePhase, setGamePhase] = useState<"select" | "plan" | "complete">("select");

  const tips: Tip[] = [
    {
      id: 1,
      category: "Transport",
      title: "Walk or Cycle Short Trips",
      description: "Replace car trips under 2km with walking or cycling",
      impact: 1.2,
      difficulty: "Easy",
      icon: "🚶‍♂️",
      actionable: true
    },
    {
      id: 2,
      category: "Transport",
      title: "Use Public Transport",
      description: "Take buses, trains, or trams instead of driving",
      impact: 2.1,
      difficulty: "Easy",
      icon: "🚌",
      actionable: true
    },
    {
      id: 3,
      category: "Energy",
      title: "Switch to LED Bulbs",
      description: "Replace incandescent bulbs with energy-efficient LEDs",
      impact: 0.8,
      difficulty: "Easy",
      icon: "💡",
      actionable: true
    },
    {
      id: 4,
      category: "Energy",
      title: "Unplug Electronics",
      description: "Unplug devices when not in use to prevent phantom energy",
      impact: 0.5,
      difficulty: "Easy",
      icon: "🔌",
      actionable: true
    },
    {
      id: 5,
      category: "Food",
      title: "Meat-Free Mondays",
      description: "Have one plant-based day per week",
      impact: 1.8,
      difficulty: "Medium",
      icon: "🥗",
      actionable: true
    },
    {
      id: 6,
      category: "Food",
      title: "Buy Local Produce",
      description: "Choose locally grown fruits and vegetables",
      impact: 0.9,
      difficulty: "Medium",
      icon: "🥕",
      actionable: true
    },
    {
      id: 7,
      category: "Waste",
      title: "Use Reusable Bags",
      description: "Bring your own bags when shopping",
      impact: 0.3,
      difficulty: "Easy",
      icon: "🛍️",
      actionable: true
    },
    {
      id: 8,
      category: "Waste",
      title: "Compost Food Scraps",
      description: "Start composting organic waste at home",
      impact: 1.1,
      difficulty: "Hard",
      icon: "🌱",
      actionable: true
    },
    {
      id: 9,
      category: "Energy",
      title: "Install Solar Panels",
      description: "Generate your own renewable energy",
      impact: 3.5,
      difficulty: "Hard",
      icon: "☀️",
      actionable: false
    },
    {
      id: 10,
      category: "Transport",
      title: "Work from Home",
      description: "Reduce commuting by working remotely",
      impact: 2.8,
      difficulty: "Medium",
      icon: "🏠",
      actionable: true
    }
  ];

  useEffect(() => {
    if (gamePhase === "select" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gamePhase === "select") {
      setGamePhase("plan");
    }
  }, [timeLeft, gamePhase]);

  const handleTipSelect = (tip: Tip) => {
    if (selectedTips.find(t => t.id === tip.id)) {
      setSelectedTips(selectedTips.filter(t => t.id !== tip.id));
    } else if (selectedTips.length < 5) {
      setSelectedTips([...selectedTips, tip]);
    } else {
      toast.error("You can only select 5 tips maximum!");
    }
  };

  const calculateScore = () => {
    const totalImpact = selectedTips.reduce((sum, tip) => sum + tip.impact, 0);
    const difficultyBonus = selectedTips.reduce((sum, tip) => {
      const multiplier = tip.difficulty === "Easy" ? 1 : tip.difficulty === "Medium" ? 1.5 : 2;
      return sum + (tip.impact * multiplier);
    }, 0);
    
    const actionableBonus = selectedTips.filter(tip => tip.actionable).length * 10;
    const finalScore = Math.round((totalImpact * 20) + (difficultyBonus * 5) + actionableBonus);
    
    setScore(finalScore);
    setGamePhase("complete");
    onComplete(finalScore);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-700";
      case "Medium": return "bg-yellow-100 text-yellow-700";
      case "Hard": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (gamePhase === "select") {
    return (
      <Card className="p-6 w-full max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-black mb-2">🎯 Eco-Tips Challenge</h2>
          <p className="text-gray-600">Select up to 5 actionable tips to reduce your carbon footprint</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="outline">Time: {timeLeft}s</Badge>
            <Badge variant="outline">Selected: {selectedTips.length}/5</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {tips.map((tip) => (
            <button
              key={tip.id}
              onClick={() => handleTipSelect(tip)}
              className={`p-4 rounded-lg border-2 text-left transition-all hover:border-[#B8EE7C] ${
                selectedTips.find(t => t.id === tip.id)
                  ? 'border-[#B8EE7C] bg-[#B8EE7C]/10'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{tip.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-black">{tip.title}</h3>
                    <Badge className={getDifficultyColor(tip.difficulty)}>
                      {tip.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tip.description}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-[#B8EE7C] font-bold">
                      -{tip.impact} kg CO₂/day
                    </span>
                    <span className="text-gray-500">
                      {tip.category}
                    </span>
                    {tip.actionable && (
                      <Badge variant="secondary" className="text-xs">
                        ✅ Actionable
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={calculateScore}
            disabled={selectedTips.length === 0}
            className="bg-[#B8EE7C] text-[#0A0E09] font-bold py-3 px-8 rounded-lg hover:bg-[#96EE60] transition-colors disabled:bg-gray-300 disabled:text-gray-500"
          >
            Create My Action Plan ({selectedTips.length} tips selected)
          </Button>
        </div>
      </Card>
    );
  }

  if (gamePhase === "plan") {
    const totalImpact = selectedTips.reduce((sum, tip) => sum + tip.impact, 0);
    
    return (
      <Card className="p-6 w-full max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-black mb-2">📋 Your Action Plan</h2>
          <p className="text-gray-600">Here's how you can reduce your carbon footprint</p>
          <div className="mt-4">
            <Badge variant="outline" className="text-lg">
              Total Reduction: -{totalImpact.toFixed(1)} kg CO₂/day
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {selectedTips.map((tip, index) => (
            <div key={tip.id} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{tip.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-black">{tip.title}</h3>
                    <Badge className={getDifficultyColor(tip.difficulty)}>
                      {tip.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tip.description}</p>
                  <div className="text-[#B8EE7C] font-bold text-sm">
                    -{tip.impact} kg CO₂/day reduction
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={() => setGamePhase("complete")}
            className="bg-[#B8EE7C] text-[#0A0E09] font-bold py-3 px-8 rounded-lg hover:bg-[#96EE60] transition-colors"
          >
            Complete Challenge
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">🎉 Challenge Complete!</h2>
        <p className="text-gray-600">Great job creating your eco-action plan!</p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-[#B8EE7C] mb-2">+{score}</div>
          <div className="text-lg font-semibold text-black mb-2">Eco-Points Earned!</div>
          <div className="text-sm text-gray-600">
            You selected {selectedTips.length} actionable tips that could reduce your carbon footprint by{' '}
            {selectedTips.reduce((sum, tip) => sum + tip.impact, 0).toFixed(1)} kg CO₂ per day!
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="flex gap-4 justify-center">
          <Button
            onClick={onClose}
            className="bg-[#B8EE7C] text-[#0A0E09] font-bold py-3 px-6 rounded-lg hover:bg-[#96EE60] transition-colors"
          >
            Back to Calculator
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TipsMiniGame;
