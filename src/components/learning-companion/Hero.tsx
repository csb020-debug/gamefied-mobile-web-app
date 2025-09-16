
import React from "react";
import CTAButton from "./CTAButton";

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
      </div>
      <div className="relative flex items-center justify-center w-full max-w-5xl mx-auto">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/1c15c27aedcd3bfe4c8f891c6ef84b181bd0e44b?placeholderIfAbsent=true"
          className="aspect-[162/91] object-contain w-full max-w-[810px] shadow-[0px_8px_32px_0px_rgba(50,60,69,0.20)] rounded-lg"
          alt="Learning Companion Interface"
        />
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/95683470c2d24d23e37460716549bd413c09de9b?placeholderIfAbsent=true"
          className="aspect-[1] object-contain w-[183px] absolute z-10 shrink-0 h-[183px] rounded-[11px] right-0 top-1/2 transform -translate-y-1/2 translate-x-16 max-md:hidden"
          alt="Feature highlight"
        />
      </div>
    </div>
  );
};

export default Hero;
