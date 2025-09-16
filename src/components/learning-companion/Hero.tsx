
import React from "react";
import CTAButton from "./CTAButton";
import ThreeDCardDemo from "@/components/3d-card-demo";

export const Hero: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-white">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-5xl text-[#0A0E09] font-black uppercase leading-none max-md:text-[40px] mb-6">
          <div className="max-md:text-[40px]">THE ECO</div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/b48f585da1cc5d2cdb62417f245c0dd090434ab7?placeholderIfAbsent=true"
            className="aspect-[5.41] object-contain w-full max-w-[600px]"
            alt="Champions"
          />
        </div>
        <div className="text-center max-w-[600px] text-lg text-black font-light leading-[28px] mb-8">
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
