import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InteractiveSlidersProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

const InteractiveSliders: React.FC<InteractiveSlidersProps> = ({ onComplete, onBack }) => {
  const [sliderData, setSliderData] = useState({
    carMiles: 0,
    flights: 0,
    meatMeals: 0,
    shoppingTrips: 0,
    energyUsage: 0,
    wasteBags: 0
  });

  const sliderConfigs = [
    {
      key: "carMiles",
      label: "🚗 Daily Car Miles",
      description: "How many miles do you drive per day?",
      min: 0,
      max: 100,
      step: 5,
      unit: "miles",
      multiplier: 0.4, // kg CO2 per mile
      icon: "🚗"
    },
    {
      key: "flights",
      label: "✈️ Flights per Year",
      description: "How many flights do you take annually?",
      min: 0,
      max: 20,
      step: 1,
      unit: "flights",
      multiplier: 0.5, // kg CO2 per flight (daily average)
      icon: "✈️"
    },
    {
      key: "meatMeals",
      label: "🍖 Meat Meals per Week",
      description: "How many meals with meat do you have weekly?",
      min: 0,
      max: 21,
      step: 1,
      unit: "meals",
      multiplier: 0.3, // kg CO2 per meat meal (daily average)
      icon: "🍖"
    },
    {
      key: "shoppingTrips",
      label: "🛍️ Shopping Trips per Week",
      description: "How many shopping trips do you make weekly?",
      min: 0,
      max: 10,
      step: 1,
      unit: "trips",
      multiplier: 0.8, // kg CO2 per shopping trip (daily average)
      icon: "🛍️"
    },
    {
      key: "energyUsage",
      label: "⚡ Energy Usage (kWh/day)",
      description: "Your daily electricity consumption",
      min: 0,
      max: 50,
      step: 2,
      unit: "kWh",
      multiplier: 0.4, // kg CO2 per kWh
      icon: "⚡"
    },
    {
      key: "wasteBags",
      label: "🗑️ Waste Bags per Week",
      description: "How many bags of waste do you produce weekly?",
      min: 0,
      max: 10,
      step: 1,
      unit: "bags",
      multiplier: 0.5, // kg CO2 per waste bag (daily average)
      icon: "🗑️"
    }
  ];

  const handleSliderChange = (key: string, value: number[]) => {
    setSliderData(prev => ({ ...prev, [key]: value[0] }));
  };

  const calculateTotal = () => {
    let total = 0;
    let breakdown: any = {};

    sliderConfigs.forEach(config => {
      const value = sliderData[config.key as keyof typeof sliderData];
      const dailyImpact = (value * config.multiplier) / (config.key === 'flights' ? 365 : config.key === 'meatMeals' || config.key === 'shoppingTrips' || config.key === 'wasteBags' ? 7 : 1);
      total += dailyImpact;
      breakdown[config.key] = dailyImpact;
    });

    return { total, breakdown };
  };

  const { total, breakdown } = calculateTotal();

  return (
    <Card className="p-8 w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black mb-2">🎛️ Interactive Carbon Calculator</h2>
        <p className="text-gray-600">Adjust the sliders to match your lifestyle</p>
      </div>

      <div className="space-y-8">
        {sliderConfigs.map((config) => {
          const value = sliderData[config.key as keyof typeof sliderData];
          const dailyImpact = (value * config.multiplier) / (config.key === 'flights' ? 365 : config.key === 'meatMeals' || config.key === 'shoppingTrips' || config.key === 'wasteBags' ? 7 : 1);
          
          return (
            <div key={config.key} className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <h3 className="font-bold text-lg text-black">{config.label}</h3>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {value} {config.unit}
                  </span>
                  <Badge variant="outline" className="bg-[#B8EE7C]/20 text-[#0A0E09]">
                    {dailyImpact.toFixed(2)} kg CO₂/day
                  </Badge>
                </div>
                
                <Slider
                  value={[value]}
                  onValueChange={(value) => handleSliderChange(config.key, value)}
                  max={config.max}
                  min={config.min}
                  step={config.step}
                  className="w-full"
                />
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{config.min} {config.unit}</span>
                  <span>{config.max} {config.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Impact Display */}
      <div className="mt-8 bg-gradient-to-r from-[#B8EE7C]/20 to-[#96EE60]/20 p-6 rounded-xl border-2 border-[#B8EE7C]/30">
        <div className="text-center">
          <h3 className="text-xl font-bold text-black mb-2">🌍 Your Daily Carbon Footprint</h3>
          <div className="text-4xl font-bold text-[#B8EE7C] mb-2">
            {total.toFixed(1)} kg CO₂
          </div>
          <div className="text-lg text-gray-600 mb-4">
            Annual: {(total * 365).toFixed(0)} kg CO₂
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {Object.entries(breakdown).map(([key, value]) => {
              const config = sliderConfigs.find(c => c.key === key);
              return (
                <div key={key} className="bg-white/50 p-2 rounded">
                  <div className="font-medium">{config?.icon} {config?.label.split(' ')[1]}</div>
                  <div className="text-[#B8EE7C] font-bold">{(value as number).toFixed(1)} kg</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <div className="flex gap-4 justify-center">
          <Button
            onClick={onBack}
            variant="outline"
            className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Back to Categories
          </Button>
          <Button
            onClick={() => onComplete({ total, breakdown, method: 'sliders' })}
            className="bg-[#B8EE7C] text-[#0A0E09] font-bold py-3 px-6 rounded-lg hover:bg-[#96EE60] transition-colors"
          >
            🎯 Use This Result
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InteractiveSliders;
