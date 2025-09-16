import React from "react";

export const NoMoreStuck: React.FC = () => {
  return (
    <div className="self-center flex w-full max-w-[1222px] mx-auto flex-col items-center pt-10 pb-20 px-4">
      <div className="flex min-h-[663px] w-full items-center gap-[40px_100px] justify-center flex-wrap">
        <div className="self-stretch flex min-w-60 flex-col items-stretch justify-center w-[551px] max-w-full my-auto">
          <div className="w-full text-black text-center">
            <h2 className="text-[45px] font-black leading-[0.9] tracking-[-0.9px] uppercase max-md:text-[40px]">
              become an eco champion.
            </h2>
            <div className="text-[32px] font-light leading-[45px] mt-4 max-md:text-2xl max-md:leading-relaxed">
              Join the movement that's making environmental learning fun,
              interactive, and rewarding for every student.
            </div>
            <div className="flex items-center gap-3 mt-6 justify-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <span className="text-base">🌱</span> Learn by doing
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                <span className="text-base">🎯</span> Track progress
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                <span className="text-base">🏆</span> Earn rewards
              </span>
            </div>
            <div className="flex items-center gap-4 mt-7 justify-center">
              <button className="bg-[#0a0e09] text-white font-bold text-sm px-5 py-3 rounded-full">
                Get started
              </button>
              <button className="border border-[#0a0e09] text-[#0a0e09] font-bold text-sm px-5 py-3 rounded-full">
                See how it works
              </button>
            </div>
          </div>
        </div>
        <div className="self-stretch flex min-w-60 h-[538px] flex-col items-stretch justify-center w-[390px] max-w-full my-auto">
          <div className="justify-center shadow-[0px_8px_32px_0px_rgba(50,60,69,0.20)] bg-white flex min-h-[539px] w-full flex-col overflow-hidden rounded-2xl">
            <div className="self-stretch w-full bg-white max-w-full gap-4 text-lg text-[rgba(10,14,9,1)] font-semibold leading-[1.4] px-6 py-4 border-[rgba(242,242,242,1)] border-b max-md:px-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 text-sm font-bold">AI</span>
                <span>Eco Learning Platform</span>
              </div>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
                ● Online
              </span>
            </div>
            <div className="bg-white self-stretch w-full overflow-hidden flex-1 p-6 max-md:px-5">
              <div className="bg-[rgba(242,242,242,1)] w-fit max-w-full text-[15px] text-black font-normal leading-[1.4] px-4 py-3 rounded-[16px_4px_16px_16px]">
                How can I reduce my carbon footprint?
              </div>
              <div className="bg-white w-full overflow-hidden mt-6 pb-2">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 text-sm font-bold mt-1">AI</span>
                  <div className="text-black text-[15px] font-light leading-[21px]">
                    <span className="font-normal">Great question!</span> Let's start your eco journey.
                    <br />
                    <br />Based on your location, here are 3 actionable steps:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Switch to renewable energy</li>
                      <li>Reduce single-use plastics</li>
                      <li>Choose sustainable transportation</li>
                    </ul>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                      Earn 50 eco-points for each completed challenge
                    </div>
                    <div className="mt-4">
                      <button className="text-xs font-bold px-4 py-2 rounded-full bg-[#0a0e09] text-white">
                        Accept all challenges
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white flex w-full max-w-full flex-col items-stretch text-[15px] text-[rgba(140,140,140,1)] font-light justify-center p-4 border-[rgba(242,242,242,1)] border-t">
              <div className="bg-white border flex w-full items-center justify-between pl-4 pr-2 py-1 rounded-3xl border-[rgba(217,217,217,1)] border-solid">
                <input
                  type="text"
                  placeholder="Ask about sustainability..."
                  className="self-stretch flex-1 shrink basis-[0%] my-auto outline-none"
                />
                <button className="ml-2 bg-[#0a0e09] text-white text-xs font-bold px-4 py-2 rounded-full">
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
