import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import GameLayout from "@/components/games/GameLayout";
import GameHUD from "@/components/games/GameHUD";
import { useGameEngine } from "@/hooks/useGameEngine";
import { AnimatedProgress } from "@/components/ui/AnimatedProgress";

interface CarbonCalculatorProps {
  onComplete: () => void;
}

const CarbonCalculator: React.FC<CarbonCalculatorProps> = ({ onComplete }) => {
  const engine = useGameEngine({ initialLives: 3, initialScore: 0, autoStart: true });
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    transport: 0,
    energy: 0,
    food: 0,
    waste: 0
  });
  const [results, setResults] = useState<any>(null);

  const transportOptions = [
    { label: "Walking/Cycling", value: 0, icon: "🚲" },
    { label: "Public Transport", value: 2.5, icon: "🚌" },
    { label: "Electric Car", value: 1.5, icon: "🔋" },
    { label: "Gasoline Car", value: 4.6, icon: "🚗" },
    { label: "Motorcycle", value: 3.2, icon: "🏍️" }
  ];

  const energyOptions = [
    { label: "Renewable Energy", value: 0.5, icon: "🌱" },
    { label: "Mixed Grid", value: 2.3, icon: "⚡" },
    { label: "Coal Heavy Grid", value: 4.1, icon: "🏭" }
  ];

  const foodOptions = [
    { label: "Vegan", value: 1.5, icon: "🥗" },
    { label: "Vegetarian", value: 2.0, icon: "🥛" },
    { label: "Pescatarian", value: 2.5, icon: "🐟" },
    { label: "Meat 1-2 times/week", value: 3.2, icon: "🍖" },
    { label: "Meat daily", value: 4.8, icon: "🥩" }
  ];

  const wasteOptions = [
    { label: "Zero Waste", value: 0.2, icon: "♻️" },
    { label: "Minimal Waste", value: 0.8, icon: "🗂️" },
    { label: "Average Waste", value: 1.5, icon: "🗑️" },
    { label: "High Waste", value: 2.5, icon: "🚮" }
  ];

  const handleSelection = (category: string, value: number) => {
    setData(prev => ({ ...prev, [category]: value }));
  };

  const calculateFootprint = () => {
    const total = data.transport + data.energy + data.food + data.waste;
    const dailyTotal = total;
    const annualTotal = dailyTotal * 365;
    
    let rating = "Excellent! 🌟";
    let tips = [
      "You're already doing great!",
      "Share your eco-friendly habits with friends",
      "Consider becoming a sustainability ambassador"
    ];

    if (total > 8) {
      rating = "Needs Improvement 🔄";
      tips = [
        "Try walking or cycling for short trips",
        "Switch to renewable energy if possible",
        "Reduce meat consumption",
        "Implement better recycling practices"
      ];
    } else if (total > 5) {
      rating = "Good! 👍";
      tips = [
        "Consider using public transport more",
        "Try plant-based meals a few days a week",
        "Reduce single-use items",
        "Choose renewable energy options"
      ];
    }

    const points = Math.max(100 - Math.round(total * 10), 20);
    engine.addPoints(points);
    setResults({
      daily: dailyTotal.toFixed(1),
      annual: annualTotal.toFixed(0),
      rating,
      tips,
      points
    });

    toast.success(`Calculation complete! You earned ${points} eco-points!`);
  };

  const resetCalculator = () => {
    setStep(1);
    setData({ transport: 0, energy: 0, food: 0, waste: 0 });
    setResults(null);
  };

  if (results) {
    return (
      <GameLayout
        hud={<GameHUD score={engine.score} streak={engine.streak} lives={engine.lives} maxLives={engine.maxLives} onReset={resetCalculator} />}
      >
        <Card className="p-8 w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">🌍 Your Carbon Footprint</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-[rgba(242,242,242,1)] p-6 rounded-xl">
                <div className="text-2xl font-bold text-[#B8EE7C]">{results.daily} kg CO₂</div>
                <div className="text-gray-600">Daily Footprint</div>
              </div>
              <div className="bg-[rgba(242,242,242,1)] p-6 rounded-xl">
                <div className="text-2xl font-bold text-[#B8EE7C]">{results.annual} kg CO₂</div>
                <div className="text-gray-600">Annual Footprint</div>
              </div>
            </div>
            
            <div className="text-xl font-semibold mb-4">{results.rating}</div>
            <div className="text-lg text-[#B8EE7C] font-bold mb-6">
              🌿 +{results.points} Eco-Points Earned!
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">💡 Reduction Tips</h3>
            <ul className="space-y-2">
              {results.tips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#B8EE7C] mt-1">•</span>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetCalculator}
                className="bg-[#B8EE7C] text-[#0A0E09] font-bold py-3 px-6 rounded-lg hover:bg-[#96EE60] transition-colors"
              >
                Calculate Again
              </button>
              <button
                onClick={onComplete}
                className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Games
              </button>
            </div>
          </div>
        </Card>
      </GameLayout>
    );
  }

  const currentOptions = {
    1: { title: "Daily Transportation", options: transportOptions, key: "transport" },
    2: { title: "Home Energy", options: energyOptions, key: "energy" },
    3: { title: "Diet Choices", options: foodOptions, key: "food" },
    4: { title: "Waste Management", options: wasteOptions, key: "waste" }
  }[step];

  return (
    <GameLayout
      hud={<GameHUD score={engine.score} streak={engine.streak} lives={engine.lives} maxLives={engine.maxLives} onReset={resetCalculator} />}
    >
      <Card className="p-8 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-2">🌍 Carbon Footprint Calculator</h2>
          <p className="text-gray-600">Calculate your daily environmental impact</p>
          <div className="mt-4">
            <span className="text-lg font-semibold">Step {step} of 4: {currentOptions?.title}</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-1 gap-4">
            {currentOptions?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelection(currentOptions.key, option.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:border-[#B8EE7C] ${
                  data[currentOptions.key as keyof typeof data] === option.value
                    ? 'border-[#B8EE7C] bg-[#B8EE7C]/10'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <div className="font-semibold text-black">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.value} kg CO₂/day</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={data[currentOptions!.key as keyof typeof data] === 0}
              className={`px-8 py-3 rounded-lg font-bold transition-colors ${
                data[currentOptions!.key as keyof typeof data] !== 0
                  ? 'bg-[#B8EE7C] text-[#0A0E09] hover:bg-[#96EE60]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={calculateFootprint}
              disabled={data.waste === 0}
              className={`px-8 py-3 rounded-lg font-bold transition-colors ${
                data.waste !== 0
                  ? 'bg-[#B8EE7C] text-[#0A0E09] hover:bg-[#96EE60]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Calculate Results
            </button>
          )}
        </div>

        <div className="mt-8">
          <AnimatedProgress
            value={step}
            max={4}
            label="Step Progress"
            showGlow={true}
            color="bg-[#B8EE7C]"
            height="h-4"
            showPercentage={true}
          />
        </div>
      </Card>
    </GameLayout>
  );
};

export default CarbonCalculator;