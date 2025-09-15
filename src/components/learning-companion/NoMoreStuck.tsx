import React from "react";

export const NoMoreStuck: React.FC = () => {
  return (
    <div className="self-center flex w-[1222px] max-w-full flex-col items-center pt-10 pb-20 px-4">
      <div className="flex min-h-[663px] w-full items-center gap-[40px_100px] justify-between flex-wrap max-md:justify-center">
        <div className="self-stretch flex min-w-60 flex-col items-stretch justify-center w-[551px] max-w-full my-auto">
          <div className="w-full text-black max-md:text-center">
            <h2 className="text-[45px] font-black leading-[0.9] tracking-[-0.9px] uppercase max-md:text-[40px]">
              become an eco champion.
            </h2>
            <div className="text-[32px] font-light leading-[45px] mt-4 max-md:text-2xl max-md:leading-relaxed">
              Join the movement that's making environmental learning fun,
              interactive, and rewarding for every student.
            </div>
          </div>
        </div>
        <div className="self-stretch flex min-w-60 h-[538px] flex-col items-stretch justify-center w-[390px] max-w-full my-auto">
          <div className="justify-center shadow-[0px_8px_32px_0px_rgba(50,60,69,0.20)] bg-white flex min-h-[539px] w-full flex-col overflow-hidden rounded-2xl">
            <div className="self-stretch w-full bg-white max-w-full gap-4 text-lg text-[rgba(10,14,9,1)] font-semibold leading-[1.4] px-6 py-4 border-[rgba(242,242,242,1)] border-b max-md:px-5">
              Eco Learning Platform
            </div>
            <div className="bg-white self-stretch w-full overflow-hidden flex-1 p-6 max-md:px-5">
              <div className="bg-[rgba(242,242,242,1)] w-full text-[15px] text-black font-normal leading-[1.4] px-4 py-3 rounded-[16px_4px_16px_16px]">
                How can I reduce my carbon footprint?
              </div>
              <div className="bg-white w-full overflow-hidden mt-6 pb-4">
                <div className="flex w-8 items-center gap-2">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/04d511fd79612c844bc2631603e74858164add05?placeholderIfAbsent=true"
                    className="aspect-[1] object-contain w-8 self-stretch my-auto rounded-[999px]"
                    alt="AI avatar"
                  />
                </div>
                <div className="text-black text-[15px] font-light leading-[21px] mt-2">
                  Great question! Let's start your eco journey. <br />
                  <br />Based on your location, here are 3 actionable steps: 
                  switch to renewable energy, reduce single-use plastics, and 
                  choose sustainable transportation. Complete these challenges 
                  to earn 50 eco-points each! Ready to make a difference?
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
                <div className="self-stretch flex min-h-10 my-auto py-2 rounded-[999px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoMoreStuck;
