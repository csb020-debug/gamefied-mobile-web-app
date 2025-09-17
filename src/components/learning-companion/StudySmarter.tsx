
import React from "react";

export const StudySmarter: React.FC = () => {
  return (
    <div className="bg-background flex w-full flex-col items-center pt-8 sm:pt-10 lg:pt-12 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-4xl flex-col items-stretch text-[#0a0e09] text-center py-3">
        <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight self-center">
          HOW THEY'RE SAVING THE PLANET
        </h2>
        <div className="w-full text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light leading-relaxed mt-2 sm:mt-3">
          See how students are earning eco-points, competing between schools,
          and making real environmental impact.
        </div>
      </div>
      <div className="flex min-h-[400px] sm:min-h-[500px] lg:min-h-[566px] w-full max-w-6xl items-center gap-4 sm:gap-6 lg:gap-8 xl:gap-10 justify-center flex-wrap mt-6 sm:mt-8">
        {/* Mobile: 2x2 grid, Desktop: horizontal layout */}
        <div className="grid grid-cols-2 gap-4 w-full sm:hidden">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/043071858dfd2a81b3e8ca9d860afe465d77fb50?placeholderIfAbsent=true"
            className="aspect-[283/504] object-contain w-full shadow-[0px_8px_32px_0px_rgba(50,60,69,0.20)] rounded-lg"
            alt="Eco champion leaderboard"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/3b025859e9aaa0b2ca167722d836a26b7cb219a0?placeholderIfAbsent=true"
            className="aspect-[283/504] object-contain w-full shadow-[0px_8px_32px_0px_rgba(50,60,69,0.20)] rounded-lg"
            alt="Digital badges earned"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/376860ac3b1892e0c4b42ca87b482748f2977e14?placeholderIfAbsent=true"
            className="aspect-[283/504] object-contain w-full shadow-[0px_8px_32px_0px_rgba(50,60,69,0.20)] rounded-lg"
            alt="School competition rankings"
          />
          {/* Empty space for 2x2 grid - you can add a 4th image here if needed */}
          <div className="aspect-[283/504] bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-sm">Coming Soon</span>
          </div>
        </div>
        
        {/* Desktop: horizontal layout */}
        <div className="hidden sm:flex items-center gap-4 sm:gap-6 lg:gap-8 xl:gap-10 justify-center flex-wrap w-full">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/043071858dfd2a81b3e8ca9d860afe465d77fb50?placeholderIfAbsent=true"
            className="aspect-[283/504] object-contain w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[226px] shadow-[0px_8px_32px_0px_rgba(50,60,69,0.20)] self-stretch min-w-0 grow shrink my-auto"
            alt="Eco champion leaderboard"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/3b025859e9aaa0b2ca167722d836a26b7cb219a0?placeholderIfAbsent=true"
            className="aspect-[283/504] object-contain w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[226px] shadow-[0px_8px_32px_0px_rgba(50,60,69,0.20)] self-stretch min-w-0 grow shrink my-auto"
            alt="Digital badges earned"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/376860ac3b1892e0c4b42ca87b482748f2977e14?placeholderIfAbsent=true"
            className="aspect-[283/504] object-contain w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[226px] shadow-[0px_8px_32px_0px_rgba(50,60,69,0.20)] self-stretch min-w-0 grow shrink my-auto"
            alt="School competition rankings"
          />
        </div>
      </div>
    </div>
  );
};

export default StudySmarter;
