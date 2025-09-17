
import React from "react";
import CTAButton from "./CTAButton";
import ThreeDCardDemo from "@/components/3d-card-demo";
import { FlipWords } from "@/components/ui/flip-words";

export const Hero: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-background">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-5xl text-foreground font-black uppercase leading-none max-md:text-[40px] mb-6">
          <div className="max-md:text-[40px]" style={{ fontFamily: 'Luckiest Guy, cursive' }}>THE ECO</div>
          <div className="text-9xl max-md:text-8xl" style={{ fontFamily: 'Luckiest Guy, cursive' }}>
            <FlipWords 
              words={["COMPANION", "LEARNING", "SUSTAINABLE", "GREEN"]} 
              duration={2000}
              className="text-foreground"
            />
          </div>
        </div>
        <div className="text-center max-w-[600px] text-lg text-foreground/80 font-light leading-[28px] mb-8">
          Gamified environmental education platform. Learn sustainability through
          interactive lessons, real-world challenges, and earn eco-points for green actions.
        </div>
        <div className="mb-12">
          <CTAButton text="Start your eco journey" />
        </div>
        <div className="mb-16">
          <ThreeDCardDemo />
        </div>
      </div>
    </div>
  );
};

export default Hero;
