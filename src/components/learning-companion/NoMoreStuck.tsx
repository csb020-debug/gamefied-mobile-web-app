import React from "react";

export const NoMoreStuck: React.FC = () => {
  return (
    <div className="self-center flex w-full max-w-7xl mx-auto flex-col items-center pt-8 sm:pt-10 lg:pt-12 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="flex min-h-[400px] sm:min-h-[500px] lg:min-h-[663px] w-full items-center gap-6 sm:gap-8 lg:gap-12 xl:gap-16 justify-center flex-col lg:flex-row">
        <div className="self-stretch flex min-w-0 flex-col items-stretch justify-center w-full lg:w-1/2 max-w-2xl lg:max-w-none my-auto">
          <div className="w-full text-black dark:text-white text-center lg:text-left">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight uppercase">
              become an eco champion.
            </h2>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light leading-relaxed mt-3 sm:mt-4">
              Join the movement that's making environmental learning fun,
              interactive, and rewarding for every student.
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 sm:mt-6 justify-center lg:justify-start">
              <span className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-green-100 text-green-800 text-xs sm:text-sm font-medium">
                <span className="text-sm sm:text-base">🌱</span> Learn by doing
              </span>
              <span className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium">
                <span className="text-sm sm:text-base">🎯</span> Track progress
              </span>
              <span className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-yellow-100 text-yellow-800 text-xs sm:text-sm font-medium">
                <span className="text-sm sm:text-base">🏆</span> Earn rewards
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-5 sm:mt-7 justify-center lg:justify-start">
              <button className="bg-[#0a0e09] text-white font-bold text-sm px-4 sm:px-5 py-2 sm:py-3 rounded-full w-full sm:w-auto">
                Get started
              </button>
              <button className="border border-[#0a0e09] text-[#0a0e09] font-bold text-sm px-4 sm:px-5 py-2 sm:py-3 rounded-full w-full sm:w-auto">
                See how it works
              </button>
            </div>
          </div>
        </div>
        <div className="self-stretch flex min-w-0 h-auto sm:h-[400px] lg:h-[538px] flex-col items-stretch justify-center w-full lg:w-1/2 max-w-md lg:max-w-lg xl:max-w-xl my-auto">
          <div className="justify-center shadow-[0px_8px_32px_0px_rgba(50,60,69,0.20)] bg-white flex min-h-[400px] sm:min-h-[500px] lg:min-h-[539px] w-full flex-col overflow-hidden rounded-2xl">
            <div className="self-stretch w-full bg-white max-w-full gap-2 sm:gap-4 text-base sm:text-lg text-[rgba(10,14,9,1)] font-semibold leading-tight px-4 sm:px-6 py-3 sm:py-4 border-[rgba(242,242,242,1)] border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 text-green-800 text-xs sm:text-sm font-bold">AI</span>
                <span className="text-sm sm:text-base">Eco Learning Platform</span>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
                ● Online
              </span>
            </div>
            <div className="bg-white self-stretch w-full overflow-hidden flex-1 p-4 sm:p-6">
              <div className="bg-[rgba(242,242,242,1)] w-fit max-w-full text-sm sm:text-[15px] text-black font-normal leading-relaxed px-3 sm:px-4 py-2 sm:py-3 rounded-[16px_4px_16px_16px]">
                How can I reduce my carbon footprint?
              </div>
              <div className="bg-white w-full overflow-hidden mt-4 sm:mt-6 pb-2">
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 text-green-800 text-xs sm:text-sm font-bold mt-1">AI</span>
                  <div className="text-black text-sm sm:text-[15px] font-light leading-relaxed">
                    <span className="font-normal">Great question!</span> Let's start your eco journey.
                    <br />
                    <br />Based on your location, here are 3 actionable steps:
                    <ul className="list-disc pl-4 sm:pl-5 mt-2 space-y-1">
                      <li>Switch to renewable energy</li>
                      <li>Reduce single-use plastics</li>
                      <li>Choose sustainable transportation</li>
                    </ul>
                    <div className="mt-3 inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                      Earn 50 eco-points for each completed challenge
                    </div>
                    <div className="mt-3 sm:mt-4">
                      <button className="text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#0a0e09] text-white">
                        Accept all challenges
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white flex w-full max-w-full flex-col items-stretch text-sm sm:text-[15px] text-[rgba(140,140,140,1)] font-light justify-center p-3 sm:p-4 border-[rgba(242,242,242,1)] border-t">
              <div className="bg-white border flex w-full items-center justify-between pl-3 sm:pl-4 pr-2 py-1 rounded-3xl border-[rgba(217,217,217,1)] border-solid">
                <input
                  type="text"
                  placeholder="Ask about sustainability..."
                  className="self-stretch flex-1 shrink basis-[0%] my-auto outline-none text-sm"
                />
                <button className="ml-2 bg-[#0a0e09] text-white text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoMoreStuck;
