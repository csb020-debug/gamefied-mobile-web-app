
import React from "react";
import CTAButton from "./CTAButton";
import ThreeDCardDemo from "@/components/3d-card-demo";
import { FlipWords } from "@/components/ui/flip-words";

export const Hero: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-background">
      <div className="flex flex-col items-center text-center w-full max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-foreground font-black uppercase leading-none mb-4 sm:mb-6">
          <div className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl" style={{ fontFamily: 'Luckiest Guy, cursive' }}>THE ECO</div>
          <div className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem]" style={{ fontFamily: 'Luckiest Guy, cursive' }}>
            <FlipWords 
              words={["COMPANION", "LEARNING", "SUSTAINABLE", "GREEN"]} 
              duration={2000}
              className="text-foreground"
            />
          </div>
        </div>
        <div className="text-center w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl text-base sm:text-lg lg:text-xl text-foreground/80 font-light leading-6 sm:leading-7 lg:leading-8 mb-6 sm:mb-8">
          Gamified environmental education platform. Learn sustainability through
          interactive lessons, real-world challenges, and earn eco-points for green actions.
        </div>
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <CTAButton text="Start your eco journey" />
        </div>
        <div className="mb-6 sm:mb-8 w-full max-w-4xl">
          <ThreeDCardDemo />
        </div>
      </div>
    </div>
  );
};

export default Hero;
