import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import GameLayout from "@/components/games/GameLayout";
import GameHUD from "@/components/games/GameHUD";
import { useGameEngine } from "@/hooks/useGameEngine";
import { AnimatedProgress } from "@/components/ui/AnimatedProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import TipsMiniGame from "./TipsMiniGame";
import InteractiveSliders from "./InteractiveSliders";

interface CarbonCalculatorProps {
  onComplete: () => void;
}

const CarbonCalculator: React.FC<CarbonCalculatorProps> = ({ onComplete }) => {
  const engine = useGameEngine({ 
    initialLives: 3, 
    initialScore: 0, 
    autoStart: true,
    gameType: 'carbon'
  });
  const [step, setStep] = useState(1);
  const [data, setData] = useState<{
    transport: number;
    energy: number;
    food: number;
    waste: number;
    shopping: number;
    travel: number;
    home: number;
    lifestyle: number;
  }>({
    transport: 0,
    energy: 0,
    food: 0,
    waste: 0,
    shopping: 0,
    travel: 0,
    home: 0,
    lifestyle: 0
  });
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("calculator");
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [showTipsGame, setShowTipsGame] = useState(false);
  const [showSliders, setShowSliders] = useState(false);
  const [calculationMethod, setCalculationMethod] = useState<'categories' | 'sliders'>('categories');
  const [lifestyleAnswers, setLifestyleAnswers] = useState<any>({});

  const transportOptions = [
    { 
      label: "Walking/Cycling", 
      value: 0, 
      icon: "🚲",
      details: "Zero emissions for short distances",
      multiplier: 0
    },
    { 
      label: "Public Transport", 
      value: 2.5, 
      icon: "🚌",
      details: "Bus, train, tram, or metro",
      multiplier: 1
    },
    { 
      label: "Electric Car", 
      value: 1.5, 
      icon: "🔋",
      details: "EV or hybrid vehicle",
      multiplier: 1
    },
    { 
      label: "Gasoline Car", 
      value: 4.6, 
      icon: "🚗",
      details: "Traditional fuel vehicle",
      multiplier: 1
    },
    { 
      label: "Motorcycle/Scooter", 
      value: 3.2, 
      icon: "🏍️",
      details: "Two-wheeled motor vehicle",
      multiplier: 1
    },
    { 
      label: "Rideshare/Taxi", 
      value: 5.2, 
      icon: "🚕",
      details: "Uber, Lyft, or traditional taxi",
      multiplier: 1
    },
    { 
      label: "Flying (Short)", 
      value: 12.5, 
      icon: "✈️",
      details: "Domestic flights under 3 hours",
      multiplier: 0.1
    },
    { 
      label: "Flying (Long)", 
      value: 25.0, 
      icon: "🌍",
      details: "International or long-haul flights",
      multiplier: 0.05
    }
  ];

  const energyOptions = [
    { 
      label: "100% Renewable", 
      value: 0.5, 
      icon: "🌱",
      details: "Solar, wind, hydro, or geothermal",
      multiplier: 1
    },
    { 
      label: "Mixed Grid (50% Clean)", 
      value: 2.3, 
      icon: "⚡",
      details: "Combination of renewable and fossil fuels",
      multiplier: 1
    },
    { 
      label: "Coal Heavy Grid", 
      value: 4.1, 
      icon: "🏭",
      details: "Primarily coal-based electricity",
      multiplier: 1
    },
    { 
      label: "Natural Gas Grid", 
      value: 3.2, 
      icon: "🔥",
      details: "Primarily natural gas-based",
      multiplier: 1
    },
    { 
      label: "Nuclear + Renewables", 
      value: 1.8, 
      icon: "⚛️",
      details: "Nuclear and renewable energy mix",
      multiplier: 1
    }
  ];

  const foodOptions = [
    { 
      label: "Vegan", 
      value: 1.5, 
      icon: "🥗",
      details: "Plant-based diet, no animal products",
      multiplier: 1
    },
    { 
      label: "Vegetarian", 
      value: 2.0, 
      icon: "🥛",
      details: "Plant-based + dairy and eggs",
      multiplier: 1
    },
    { 
      label: "Pescatarian", 
      value: 2.5, 
      icon: "🐟",
      details: "Vegetarian + fish and seafood",
      multiplier: 1
    },
    { 
      label: "Flexitarian", 
      value: 3.2, 
      icon: "🍖",
      details: "Mostly plant-based, meat 1-2 times/week",
      multiplier: 1
    },
    { 
      label: "Omnivore (Low Meat)", 
      value: 4.0, 
      icon: "🍗",
      details: "Balanced diet with moderate meat consumption",
      multiplier: 1
    },
    { 
      label: "Omnivore (High Meat)", 
      value: 4.8, 
      icon: "🥩",
      details: "Regular meat consumption daily",
      multiplier: 1
    },
    { 
      label: "Keto/Carnivore", 
      value: 6.2, 
      icon: "🥓",
      details: "High protein, high fat diet",
      multiplier: 1
    }
  ];

  const wasteOptions = [
    { 
      label: "Zero Waste", 
      value: 0.2, 
      icon: "♻️",
      details: "Comprehensive recycling and composting",
      multiplier: 1
    },
    { 
      label: "Minimal Waste", 
      value: 0.8, 
      icon: "🗂️",
      details: "Good recycling habits, some composting",
      multiplier: 1
    },
    { 
      label: "Average Waste", 
      value: 1.5, 
      icon: "🗑️",
      details: "Basic recycling, some single-use items",
      multiplier: 1
    },
    { 
      label: "High Waste", 
      value: 2.5, 
      icon: "🚮",
      details: "Limited recycling, frequent single-use items",
      multiplier: 1
    },
    { 
      label: "Excessive Waste", 
      value: 4.0, 
      icon: "🗑️",
      details: "Minimal recycling, lots of packaging",
      multiplier: 1
    }
  ];

  // New categories
  const shoppingOptions = [
    { 
      label: "Minimal Consumer", 
      value: 0.5, 
      icon: "🛍️",
      details: "Buy only essentials, second-hand when possible",
      multiplier: 1
    },
    { 
      label: "Conscious Shopper", 
      value: 1.2, 
      icon: "🌿",
      details: "Sustainable brands, minimal packaging",
      multiplier: 1
    },
    { 
      label: "Average Shopper", 
      value: 2.0, 
      icon: "🛒",
      details: "Regular shopping, some sustainable choices",
      multiplier: 1
    },
    { 
      label: "Frequent Shopper", 
      value: 3.5, 
      icon: "💳",
      details: "Regular purchases, online shopping",
      multiplier: 1
    },
    { 
      label: "Heavy Consumer", 
      value: 5.2, 
      icon: "🛍️",
      details: "Frequent purchases, fast fashion, electronics",
      multiplier: 1
    }
  ];

  const travelOptions = [
    { 
      label: "Local Traveler", 
      value: 0.8, 
      icon: "🏠",
      details: "Stay within 100km radius, no flights",
      multiplier: 1
    },
    { 
      label: "Regional Traveler", 
      value: 2.5, 
      icon: "🚗",
      details: "Domestic travel by car/train, 1-2 flights/year",
      multiplier: 1
    },
    { 
      label: "National Traveler", 
      value: 4.2, 
      icon: "✈️",
      details: "Regular domestic flights, some international",
      multiplier: 1
    },
    { 
      label: "International Traveler", 
      value: 8.5, 
      icon: "🌍",
      details: "Multiple international trips per year",
      multiplier: 1
    },
    { 
      label: "Frequent Flyer", 
      value: 15.0, 
      icon: "✈️",
      details: "Business travel, multiple long-haul flights",
      multiplier: 1
    }
  ];

  const homeOptions = [
    { 
      label: "Eco Home", 
      value: 1.0, 
      icon: "🏡",
      details: "Energy efficient, solar panels, good insulation",
      multiplier: 1
    },
    { 
      label: "Green Home", 
      value: 2.2, 
      icon: "🌱",
      details: "Some efficiency measures, LED lights",
      multiplier: 1
    },
    { 
      label: "Average Home", 
      value: 3.5, 
      icon: "🏠",
      details: "Standard efficiency, mixed energy sources",
      multiplier: 1
    },
    { 
      label: "Inefficient Home", 
      value: 5.8, 
      icon: "🏚️",
      details: "Poor insulation, old appliances, high energy use",
      multiplier: 1
    }
  ];

  const lifestyleOptions = [
    { 
      label: "Minimalist", 
      value: 0.5, 
      icon: "🧘",
      details: "Simple living, minimal possessions",
      multiplier: 1
    },
    { 
      label: "Eco-Conscious", 
      value: 1.8, 
      icon: "🌿",
      details: "Sustainable choices, mindful consumption",
      multiplier: 1
    },
    { 
      label: "Balanced", 
      value: 3.2, 
      icon: "⚖️",
      details: "Mix of sustainable and conventional choices",
      multiplier: 1
    },
    { 
      label: "Modern Lifestyle", 
      value: 5.5, 
      icon: "📱",
      details: "Technology-heavy, convenience-focused",
      multiplier: 1
    },
    { 
      label: "Luxury Lifestyle", 
      value: 8.2, 
      icon: "💎",
      details: "High consumption, premium products",
      multiplier: 1
    }
  ];

  // Daily challenges
  const challenges = [
    {
      id: 1,
      title: "Green Commuter",
      description: "Use public transport or cycling for 3 days",
      target: 3,
      current: 0,
      reward: 50,
      icon: "🚌",
      category: "transport"
    },
    {
      id: 2,
      title: "Energy Saver",
      description: "Reduce energy consumption by 20%",
      target: 20,
      current: 0,
      reward: 75,
      icon: "⚡",
      category: "energy"
    },
    {
      id: 3,
      title: "Plant Power",
      description: "Have 5 plant-based meals this week",
      target: 5,
      current: 0,
      reward: 60,
      icon: "🥗",
      category: "food"
    }
  ];

  // Achievement system
  const achievementTemplates = [
    { id: 1, name: "First Steps", description: "Complete your first calculation", icon: "🌱", points: 25 },
    { id: 2, name: "Green Warrior", description: "Achieve a carbon footprint below 5 kg CO₂/day", icon: "🛡️", points: 100 },
    { id: 3, name: "Consistency King", description: "Calculate your footprint for 7 consecutive days", icon: "👑", points: 150 },
    { id: 4, name: "Challenge Master", description: "Complete 5 daily challenges", icon: "🏆", points: 200 },
    { id: 5, name: "Eco Expert", description: "Achieve all transport categories with low emissions", icon: "🎓", points: 125 }
  ];

  // Initialize daily challenge
  useEffect(() => {
    const today = new Date().toDateString();
    const savedChallenge = localStorage.getItem(`challenge_${today}`);
    if (savedChallenge) {
      setDailyChallenge(JSON.parse(savedChallenge));
    } else {
      const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
      setDailyChallenge({ ...randomChallenge, date: today });
      localStorage.setItem(`challenge_${today}`, JSON.stringify({ ...randomChallenge, date: today }));
    }

    // Load achievements
    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }

    // Load history
    const savedHistory = localStorage.getItem('carbonHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    // Load streak
    const savedStreak = localStorage.getItem('calculationStreak');
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }
  }, []);

  const handleSelection = (category: string, value: number) => {
    if (step <= 8) {
    setData(prev => ({ ...prev, [category]: value }));
    } else {
      setLifestyleAnswers(prev => ({ ...prev, [category]: value }));
    }
  };

  const calculateFootprint = () => {
    // Calculate lifestyle impact
    let lifestyleImpact = 0;
    Object.values(lifestyleAnswers).forEach((value: any) => {
      if (typeof value === 'number') {
        lifestyleImpact += value;
      }
    });
    
    const baseTotal = data.transport + data.energy + data.food + data.waste + 
                     data.shopping + data.travel + data.home + data.lifestyle;
    const total = baseTotal + lifestyleImpact;
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

    // Check for achievements
    checkAchievements(total, points);

    // Update streak
    updateStreak();

    // Save to history
    const newEntry = {
      date: new Date().toISOString(),
      daily: dailyTotal,
      annual: annualTotal,
      breakdown: { ...data },
      points: points
    };
    const updatedHistory = [...history, newEntry].slice(-30); // Keep last 30 entries
    setHistory(updatedHistory);
    localStorage.setItem('carbonHistory', JSON.stringify(updatedHistory));

    setResults({
      daily: dailyTotal.toFixed(1),
      annual: annualTotal.toFixed(0),
      rating,
      tips,
      points,
      breakdown: data
    });

    toast.success(`Calculation complete! You earned ${points} eco-points!`);
  };

  const checkAchievements = (total: number, points: number) => {
    const newAchievements = [...achievements];
    let hasNewAchievement = false;

    // First calculation achievement
    if (history.length === 0 && !achievements.find(a => a.id === 1)) {
      newAchievements.push({ ...achievementTemplates[0], unlockedAt: new Date().toISOString() });
      hasNewAchievement = true;
      engine.addPoints(achievementTemplates[0].points);
    }

    // Green Warrior achievement
    if (total <= 5 && !achievements.find(a => a.id === 2)) {
      newAchievements.push({ ...achievementTemplates[1], unlockedAt: new Date().toISOString() });
      hasNewAchievement = true;
      engine.addPoints(achievementTemplates[1].points);
    }

    // Eco Expert achievement
    if (data.transport <= 1.5 && data.energy <= 1.5 && data.food <= 2.0 && data.waste <= 0.8 && !achievements.find(a => a.id === 5)) {
      newAchievements.push({ ...achievementTemplates[4], unlockedAt: new Date().toISOString() });
      hasNewAchievement = true;
      engine.addPoints(achievementTemplates[4].points);
    }

    if (hasNewAchievement) {
      setAchievements(newAchievements);
      localStorage.setItem('achievements', JSON.stringify(newAchievements));
      toast.success("🎉 New achievement unlocked!");
    }
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastCalculation = localStorage.getItem('lastCalculation');
    
    if (lastCalculation === today) {
      return; // Already calculated today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastCalculation === yesterdayStr) {
      // Continue streak
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('calculationStreak', newStreak.toString());
    } else if (lastCalculation !== today) {
      // Reset streak
      setStreak(1);
      localStorage.setItem('calculationStreak', '1');
    }

    localStorage.setItem('lastCalculation', today);
  };

  const resetCalculator = () => {
    setStep(1);
    setData({ 
      transport: 0, 
      energy: 0, 
      food: 0, 
      waste: 0, 
      shopping: 0, 
      travel: 0, 
      home: 0, 
      lifestyle: 0 
    });
    setLifestyleAnswers({});
    setResults(null);
  };

  const shareResults = () => {
    if (!results) return;
    
    const shareText = `🌍 My Carbon Footprint: ${results.daily} kg CO₂/day (${results.annual} kg/year)
    
${results.rating}

🏆 Earned ${results.points} eco-points!
🔥 ${streak} day streak
🏅 ${achievements.length} achievements unlocked

Play the Carbon Footprint Calculator game to track your environmental impact! 🌱`;

    if (navigator.share) {
      navigator.share({
        title: 'My Carbon Footprint Results',
        text: shareText,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success("Results copied to clipboard! 📋");
      }).catch(() => {
        toast.error("Unable to share results");
      });
    }
  };

  if (showTipsGame) {
    return (
      <GameLayout
        hud={<GameHUD score={engine.score} streak={engine.streak} lives={engine.lives} maxLives={engine.maxLives} onReset={() => setShowTipsGame(false)} />}
      >
        <TipsMiniGame 
          onComplete={(points) => {
            engine.addPoints(points);
            toast.success(`Tips game complete! You earned ${points} eco-points!`);
            setShowTipsGame(false);
          }}
          onClose={() => setShowTipsGame(false)}
        />
      </GameLayout>
    );
  }

  if (showSliders) {
    return (
      <GameLayout
        hud={<GameHUD score={engine.score} streak={engine.streak} lives={engine.lives} maxLives={engine.maxLives} onReset={() => setShowSliders(false)} />}
      >
        <InteractiveSliders 
          onComplete={(sliderData) => {
            // Convert slider data to our format
            const convertedData = {
              transport: sliderData.breakdown.carMiles || 0,
              energy: sliderData.breakdown.energyUsage || 0,
              food: sliderData.breakdown.meatMeals || 0,
              waste: sliderData.breakdown.wasteBags || 0,
              shopping: sliderData.breakdown.shoppingTrips || 0,
              travel: sliderData.breakdown.flights || 0,
              home: 0, // Not covered in sliders
              lifestyle: 0 // Not covered in sliders
            };
            
            setData(convertedData);
            setCalculationMethod('sliders');
            setShowSliders(false);
            calculateFootprint();
          }}
          onBack={() => setShowSliders(false)}
        />
      </GameLayout>
    );
  }

  if (results) {
    const pieData = [
      { name: 'Transport', value: results.breakdown.transport, color: '#3B82F6' },
      { name: 'Energy', value: results.breakdown.energy, color: '#F59E0B' },
      { name: 'Food', value: results.breakdown.food, color: '#10B981' },
      { name: 'Waste', value: results.breakdown.waste, color: '#EF4444' },
      { name: 'Shopping', value: results.breakdown.shopping, color: '#8B5CF6' },
      { name: 'Travel', value: results.breakdown.travel, color: '#06B6D4' },
      { name: 'Home', value: results.breakdown.home, color: '#84CC16' },
      { name: 'Lifestyle', value: results.breakdown.lifestyle, color: '#F97316' }
    ];

    const chartData = history.map((entry, index) => ({
      day: index + 1,
      footprint: entry.daily
    }));

    return (
      <GameLayout
        hud={<GameHUD score={engine.score} streak={engine.streak} lives={engine.lives} maxLives={engine.maxLives} onReset={resetCalculator} />}
      >
        <Card className="p-8 w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">🌍 Your Carbon Footprint</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[rgba(242,242,242,1)] p-6 rounded-xl">
                <div className="text-2xl font-bold text-[#B8EE7C]">{results.daily} kg CO₂</div>
                <div className="text-gray-600">Daily Footprint</div>
              </div>
              <div className="bg-[rgba(242,242,242,1)] p-6 rounded-xl">
                <div className="text-2xl font-bold text-[#B8EE7C]">{results.annual} kg CO₂</div>
                <div className="text-gray-600">Annual Footprint</div>
              </div>
              <div className="bg-[rgba(242,242,242,1)] p-6 rounded-xl">
                <div className="text-2xl font-bold text-[#B8EE7C]">{streak}</div>
                <div className="text-gray-600">Day Streak 🔥</div>
              </div>
            </div>
            
            <div className="text-xl font-semibold mb-4">{results.rating}</div>
            <div className="text-lg text-[#B8EE7C] font-bold mb-6">
              🌿 +{results.points} Eco-Points Earned!
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="comparison">Compare</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div>
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

              {dailyChallenge && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-black mb-4">🎯 Daily Challenge</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl">{dailyChallenge.icon}</span>
                    <div>
                      <h4 className="font-bold text-lg">{dailyChallenge.title}</h4>
                      <p className="text-gray-600">{dailyChallenge.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(dailyChallenge.current / dailyChallenge.target) * 100} className="flex-1" />
                    <span className="text-sm font-bold">{dailyChallenge.current}/{dailyChallenge.target}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Reward: {dailyChallenge.reward} points</div>
                </div>
              )}

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                <h3 className="text-xl font-bold text-black mb-4">🎮 Interactive Tips Game</h3>
                <p className="text-gray-600 mb-4">Play a fun mini-game to discover actionable ways to reduce your carbon footprint!</p>
                <Button
                  onClick={() => setShowTipsGame(true)}
                  className="bg-purple-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  🎯 Play Tips Game
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-black mb-4">📊 Footprint Breakdown</h3>
                  <div className="space-y-3">
                    {pieData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="font-bold">{item.value} kg CO₂</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black mb-4">📈 Visual Breakdown</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} kg CO₂`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-black mb-4">📈 Your Progress</h3>
                {history.length > 1 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Daily Footprint']} />
                      <Line type="monotone" dataKey="footprint" stroke="#B8EE7C" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Complete more calculations to see your progress chart!
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-black mb-4">📊 How You Compare</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                      <h4 className="font-bold text-lg mb-3">🌍 Global Average</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Your footprint:</span>
                          <span className="font-bold text-[#B8EE7C]">{results.daily} kg CO₂</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Global average:</span>
                          <span className="font-bold text-gray-700">16.5 kg CO₂</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Difference:</span>
                          <span className={`font-bold ${parseFloat(results.daily) < 16.5 ? 'text-green-600' : 'text-red-600'}`}>
                            {parseFloat(results.daily) < 16.5 ? '-' : '+'}{(16.5 - parseFloat(results.daily)).toFixed(1)} kg CO₂
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Progress 
                          value={(parseFloat(results.daily) / 16.5) * 100} 
                          className="h-3"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {((parseFloat(results.daily) / 16.5) * 100).toFixed(0)}% of global average
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                      <h4 className="font-bold text-lg mb-3">🎯 Climate Goal</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Your footprint:</span>
                          <span className="font-bold text-[#B8EE7C]">{results.daily} kg CO₂</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Climate goal:</span>
                          <span className="font-bold text-gray-700">2.0 kg CO₂</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Gap to goal:</span>
                          <span className={`font-bold ${parseFloat(results.daily) <= 2.0 ? 'text-green-600' : 'text-orange-600'}`}>
                            {parseFloat(results.daily) <= 2.0 ? '✅ Goal achieved!' : `+${(parseFloat(results.daily) - 2.0).toFixed(1)} kg CO₂`}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Progress 
                          value={Math.min((2.0 / parseFloat(results.daily)) * 100, 100)} 
                          className="h-3"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {parseFloat(results.daily) <= 2.0 ? 'Climate goal achieved!' : `${((2.0 / parseFloat(results.daily)) * 100).toFixed(0)}% of climate goal`}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                      <h4 className="font-bold text-lg mb-3">📈 Your Progress</h4>
                      {history.length > 1 ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">First calculation:</span>
                            <span className="font-bold text-gray-700">{history[0].daily.toFixed(1)} kg CO₂</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Latest calculation:</span>
                            <span className="font-bold text-[#B8EE7C]">{results.daily} kg CO₂</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Change:</span>
                            <span className={`font-bold ${(parseFloat(results.daily) - history[0].daily) < 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(parseFloat(results.daily) - history[0].daily) < 0 ? '' : '+'}{(parseFloat(results.daily) - history[0].daily).toFixed(1)} kg CO₂
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            {history.length} calculations completed
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          Complete more calculations to see your progress!
                        </div>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-200">
                      <h4 className="font-bold text-lg mb-3">🏆 Your Ranking</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Eco-score:</span>
                          <span className="font-bold text-[#B8EE7C]">{engine.score} points</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Streak:</span>
                          <span className="font-bold text-orange-600">{streak} days 🔥</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Achievements:</span>
                          <span className="font-bold text-yellow-600">{achievements.length} unlocked</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Keep going to improve your ranking!
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
                      <h4 className="font-bold text-lg mb-3">👥 Community Leaderboard</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-white/50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🥇</span>
                            <span className="text-sm font-medium">EcoMaster</span>
                          </div>
                          <span className="text-sm font-bold text-[#B8EE7C]">2,450 pts</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white/50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🥈</span>
                            <span className="text-sm font-medium">GreenWarrior</span>
                          </div>
                          <span className="text-sm font-bold text-[#B8EE7C]">2,180 pts</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white/50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🥉</span>
                            <span className="text-sm font-medium">ClimateHero</span>
                          </div>
                          <span className="text-sm font-bold text-[#B8EE7C]">1,920 pts</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gradient-to-r from-[#B8EE7C]/20 to-[#96EE60]/20 rounded border border-[#B8EE7C]/30">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🎯</span>
                            <span className="text-sm font-medium">You</span>
                          </div>
                          <span className="text-sm font-bold text-[#B8EE7C]">{engine.score} pts</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Challenge your friends to beat your score!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-black mb-4">🏆 Your Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-200">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <h4 className="font-bold text-lg">{achievement.name}</h4>
                          <p className="text-gray-600 text-sm">{achievement.description}</p>
                          <div className="text-[#B8EE7C] font-bold text-sm">+{achievement.points} points</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {achievements.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      Complete calculations to unlock achievements!
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-8">
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                onClick={resetCalculator}
                className="bg-[#B8EE7C] text-[#0A0E09] font-bold py-3 px-6 rounded-lg hover:bg-[#96EE60] transition-colors"
              >
                Calculate Again
              </Button>
              <Button
                onClick={() => shareResults()}
                className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
              >
                📱 Share Results
              </Button>
              <Button
                onClick={onComplete}
                variant="outline"
                className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Games
              </Button>
            </div>
          </div>
        </Card>
      </GameLayout>
    );
  }

  const lifestyleQuestions = [
    {
      id: "workFromHome",
      question: "How often do you work from home?",
      options: [
        { label: "Always (100%)", value: 0.2, icon: "🏠" },
        { label: "Mostly (80%)", value: 0.5, icon: "💻" },
        { label: "Sometimes (50%)", value: 1.0, icon: "🚗" },
        { label: "Rarely (20%)", value: 1.8, icon: "🚌" },
        { label: "Never (0%)", value: 2.5, icon: "🏢" }
      ]
    },
    {
      id: "exerciseHabits",
      question: "What's your primary exercise routine?",
      options: [
        { label: "Outdoor activities (hiking, cycling)", value: 0.1, icon: "🥾" },
        { label: "Home workouts", value: 0.3, icon: "🏠" },
        { label: "Gym membership", value: 0.8, icon: "💪" },
        { label: "Sports leagues", value: 1.2, icon: "⚽" },
        { label: "No regular exercise", value: 0.0, icon: "😴" }
      ]
    },
    {
      id: "entertainment",
      question: "How do you spend your leisure time?",
      options: [
        { label: "Reading, board games, home activities", value: 0.2, icon: "📚" },
        { label: "Streaming, gaming, digital entertainment", value: 0.5, icon: "📺" },
        { label: "Local events, parks, community activities", value: 0.8, icon: "🎪" },
        { label: "Restaurants, bars, entertainment venues", value: 1.5, icon: "🍽️" },
        { label: "Shopping, malls, commercial activities", value: 2.0, icon: "🛍️" }
      ]
    },
    {
      id: "techUsage",
      question: "How much technology do you use daily?",
      options: [
        { label: "Minimal (basic phone, no streaming)", value: 0.3, icon: "📱" },
        { label: "Moderate (phone, laptop, some streaming)", value: 0.8, icon: "💻" },
        { label: "High (multiple devices, heavy streaming)", value: 1.5, icon: "📺" },
        { label: "Very High (gaming, crypto, data-heavy)", value: 2.5, icon: "🎮" }
      ]
    }
  ];

  const currentOptions = {
    1: { title: "Daily Transportation", options: transportOptions, key: "transport" },
    2: { title: "Home Energy", options: energyOptions, key: "energy" },
    3: { title: "Diet Choices", options: foodOptions, key: "food" },
    4: { title: "Waste Management", options: wasteOptions, key: "waste" },
    5: { title: "Shopping Habits", options: shoppingOptions, key: "shopping" },
    6: { title: "Travel Patterns", options: travelOptions, key: "travel" },
    7: { title: "Home Efficiency", options: homeOptions, key: "home" },
    8: { title: "Lifestyle Choices", options: lifestyleOptions, key: "lifestyle" },
    9: { title: "Work & Commute", options: lifestyleQuestions[0].options, key: "workFromHome", question: lifestyleQuestions[0].question },
    10: { title: "Exercise & Fitness", options: lifestyleQuestions[1].options, key: "exerciseHabits", question: lifestyleQuestions[1].question },
    11: { title: "Entertainment", options: lifestyleQuestions[2].options, key: "entertainment", question: lifestyleQuestions[2].question },
    12: { title: "Technology Usage", options: lifestyleQuestions[3].options, key: "techUsage", question: lifestyleQuestions[3].question }
  }[step];

  return (
    <GameLayout
      hud={<GameHUD score={engine.score} streak={engine.streak} lives={engine.lives} maxLives={engine.maxLives} onReset={resetCalculator} />}
    >
      <Card className="p-8 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-2">🌍 Carbon Footprint Calculator</h2>
          <p className="text-gray-600">Calculate your daily environmental impact</p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="text-lg font-semibold">Step {step} of 12: {currentOptions?.title}</span>
            {streak > 0 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                🔥 {streak} day streak
              </Badge>
            )}
          </div>
          
          {/* Calculation Method Toggle */}
          <div className="mt-4 flex gap-2 justify-center">
            <Button
              onClick={() => setShowSliders(true)}
              variant="outline"
              size="sm"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              🎛️ Interactive Sliders
            </Button>
            <Button
              onClick={() => setCalculationMethod('categories')}
              variant="outline"
              size="sm"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              📋 Category Selection
            </Button>
          </div>
        </div>

        {/* Daily Challenge Preview */}
        {dailyChallenge && step === 1 && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border-2 border-blue-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{dailyChallenge.icon}</span>
              <div className="flex-1">
                <h4 className="font-bold text-sm">Today's Challenge: {dailyChallenge.title}</h4>
                <p className="text-xs text-gray-600">{dailyChallenge.description}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                +{dailyChallenge.reward} pts
              </Badge>
            </div>
          </div>
        )}

        <div className="mb-8">
          {/* Show question for lifestyle steps */}
          {step > 8 && currentOptions?.question && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <h3 className="text-lg font-bold text-black mb-2">❓ {currentOptions.question}</h3>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            {currentOptions?.options.map((option, index) => {
              const isSelected = step <= 8 
                ? data[currentOptions.key as keyof typeof data] === option.value
                : lifestyleAnswers[currentOptions.key] === option.value;
              
              return (
              <button
                key={index}
                onClick={() => handleSelection(currentOptions.key, option.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all hover:border-[#B8EE7C] hover:shadow-md ${
                    isSelected
                      ? 'border-[#B8EE7C] bg-[#B8EE7C]/10 shadow-md'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{option.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-black text-lg mb-1">{option.label}</div>
                      {option.details && (
                        <div className="text-sm text-gray-600 mb-2">{option.details}</div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-[#B8EE7C]">
                          {option.value} kg CO₂/day
                        </div>
                        {isSelected && (
                          <div className="text-sm font-bold text-green-600">
                            ✓ Selected
                          </div>
                        )}
                      </div>
                  </div>
                </div>
              </button>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <div className="flex gap-4 justify-center mb-4">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 rounded-lg font-bold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
              >
                ← Previous
              </button>
            )}
            {step < 12 ? (
            <button
              onClick={() => setStep(step + 1)}
                disabled={step <= 8 ? data[currentOptions!.key as keyof typeof data] === 0 : lifestyleAnswers[currentOptions!.key] === undefined}
              className={`px-8 py-3 rounded-lg font-bold transition-colors ${
                  step <= 8 ? 
                    (data[currentOptions!.key as keyof typeof data] !== 0
                      ? 'bg-[#B8EE7C] text-[#0A0E09] hover:bg-[#96EE60]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                    : (lifestyleAnswers[currentOptions!.key] !== undefined
                  ? 'bg-[#B8EE7C] text-[#0A0E09] hover:bg-[#96EE60]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed')
              }`}
            >
                Next Step →
            </button>
          ) : (
            <button
              onClick={calculateFootprint}
                disabled={lifestyleAnswers.techUsage === undefined}
              className={`px-8 py-3 rounded-lg font-bold transition-colors ${
                  lifestyleAnswers.techUsage !== undefined
                  ? 'bg-[#B8EE7C] text-[#0A0E09] hover:bg-[#96EE60]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
                🎯 Calculate Results
            </button>
          )}
          </div>
        </div>

        <div className="mt-8">
          <AnimatedProgress
            value={step}
            max={12}
            label="Step Progress"
            showGlow={true}
            color="bg-[#B8EE7C]"
            height="h-4"
            showPercentage={true}
          />
          
          {/* Step Indicators */}
          <div className="flex justify-center mt-4">
            <div className="flex gap-1 flex-wrap max-w-md">
              {Array.from({ length: 12 }, (_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index + 1 <= step
                      ? 'bg-[#B8EE7C]'
                      : index + 1 === step + 1
                      ? 'bg-[#B8EE7C]/50'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </GameLayout>
  );
};

export default CarbonCalculator;