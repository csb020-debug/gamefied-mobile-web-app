
import React from "react";
import CTAButton from "./CTAButton";

export const Hero: React.FC = () => {
  return (
    <div className="self-center flex w-[1222px] max-w-full flex-col items-center pt-10 pb-20 px-4">
      <div className="flex w-full flex-col items-center text-center max-md:max-w-full">
        <div className="flex w-[800px] max-w-full flex-col items-center text-5xl text-[#0A0E09] font-black uppercase leading-none max-md:text-[40px]">
          <div className="max-md:text-[40px]">THE Learning</div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/b48f585da1cc5d2cdb62417f245c0dd090434ab7?placeholderIfAbsent=true"
            className="aspect-[5.41] object-contain w-full"
            alt="Companion"
          />
        </div>
        <div className="mx-auto text-center w-full max-w-[532px] text-lg text-black font-light leading-[25px] mt-4">
          Built for YOU. Instantly turn your notes and homework into Expert
          answers, personalized worksheets, and stress-free Test Prep.
        </div>
        <div className="mt-8 mb-12">
          <CTAButton text="Get help studying" />
        </div>
      </div>
      <div className="relative flex min-h-[459px] w-full items-start gap-4 justify-center max-md:max-w-full">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/1c15c27aedcd3bfe4c8f891c6ef84b181bd0e44b?placeholderIfAbsent=true"
          className="aspect-[162/91] object-contain w-[810px] shadow-[0px_8px_32px_0px_rgba(50,60,69,0.20)] z-0 min-w-60 my-auto max-md:max-w-full"
          alt="Learning Companion Interface"
        />
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/95683470c2d24d23e37460716549bd413c09de9b?placeholderIfAbsent=true"
          className="aspect-[1] object-contain w-[183px] absolute z-0 shrink-0 h-[183px] rounded-[11px] left-[519px] top-[119px] max-md:hidden"
          alt="Feature highlight"
        />
      </div>
    </div>
  );
};

export default Hero;
