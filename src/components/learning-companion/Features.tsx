import React from "react";
import FeatureCard from "./FeatureCard";

export const Features: React.FC = () => {
  // Verified Q&A Illustration
  const verifiedQAIllustration = (
    <div className="w-[232px]">
      <div className="flex w-full items-center">
        <div className="self-stretch flex w-full items-stretch flex-1 shrink basis-[0%] my-auto">
          <div className="bg-[rgba(229,250,184,1)] flex min-h-2 w-full flex-1 shrink basis-[0%]" />
        </div>
      </div>
      <div className="flex items-stretch flex-1 h-full">
        <div className="rotate-[1.6081234170511172e-16rad] flex flex-col items-stretch justify-center">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/654e8777c54860eeee361d1f724fadcaf48d6fd7?placeholderIfAbsent=true"
            className="aspect-[0.67] object-contain w-2"
            alt="Left edge top"
          />
          <div className="bg-[rgba(229,250,184,1)] flex min-h-[229px] w-full flex-1" />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/42dfcb6e774a8dbfbd1cccccb68b161bba16e44d?placeholderIfAbsent=true"
            className="aspect-[0.67] object-contain w-2"
            alt="Left edge bottom"
          />
        </div>
        <div className="bg-[rgba(229,250,184,1)] flex flex-col items-center text-[8px] text-white font-bold whitespace-nowrap text-center leading-none justify-center w-[216px] p-2">
          <div className="w-full max-w-[200px] pt-[87px] pb-[158px] px-3 max-md:pb-[100px]">
            <div className="items-center shadow-[0px_2.519px_15.111px_0px_rgba(0,0,0,0.10)] bg-white flex gap-[5px] -mb-8 rounded-[20.148px] border-[0.63px] border-solid border-[#E2E4E9] max-md:mb-2.5">
              <div className="self-stretch flex w-full flex-col overflow-hidden items-stretch justify-center flex-1 shrink basis-[0%] my-auto pl-3 pr-2 py-2 rounded-[20px]">
                <div className="flex w-full items-center gap-[5px] rounded-xl">
                  <div className="bg-black self-stretch flex items-center gap-1 justify-center my-auto pl-2 pr-2.5 py-[5px] rounded-[999px]">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/5da151258bf91b8bdacd4bee777cd3eca52a8ebe?placeholderIfAbsent=true"
                      className="aspect-[1] object-contain w-2.5 self-stretch shrink-0 my-auto"
                      alt="Search icon"
                    />
                    <div className="self-stretch my-auto">Search</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="rotate-[1.6081234170511172e-16rad] flex flex-col items-stretch justify-center">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/87ac8af5f715cfc1626bc959198a2206e1062620?placeholderIfAbsent=true"
            className="aspect-[0.67] object-contain w-2"
            alt="Right edge top"
          />
          <div className="bg-[rgba(229,250,184,1)] flex min-h-[229px] w-full flex-1" />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/64c655a6b975bba0557a5d8f6bc6a1e220487f8a?placeholderIfAbsent=true"
            className="aspect-[0.67] object-contain w-2"
            alt="Right edge bottom"
          />
        </div>
      </div>
      <div className="flex w-full items-center">
        <div className="self-stretch flex w-full items-center flex-1 shrink basis-[0%] my-auto">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/81be2232536d2ce694440ddd3d099b7be42ec9f3?placeholderIfAbsent=true"
            className="aspect-[1.5] object-contain w-3 self-stretch shrink-0 my-auto"
            alt="Bottom left corner"
          />
          <div className="bg-[rgba(229,250,184,1)] self-stretch flex w-48 shrink h-2 flex-1 basis-[0%]" />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/2f4fd101c0250e52c465eec5f5e256bb556f698c?placeholderIfAbsent=true"
            className="aspect-[1.5] object-contain w-3 self-stretch shrink-0 my-auto"
            alt="Bottom right corner"
          />
        </div>
      </div>
    </div>
  );

  // Worksheets Illustration
  const worksheetsIllustration = (
    <div className="w-[232px]">
      <div className="flex w-full items-center">
        <div className="self-stretch flex w-full items-stretch flex-1 shrink basis-[0%] my-auto">
          <div className="bg-[rgba(229,250,184,1)] flex min-h-2 w-full flex-1 shrink basis-[0%]" />
        </div>
      </div>
      <div className="flex items-stretch flex-1 h-full">
        <div className="rotate-[1.6081234170511172e-16rad] flex flex-col items-stretch justify-center">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/654e8777c54860eeee361d1f724fadcaf48d6fd7?placeholderIfAbsent=true"
            className="aspect-[0.67] object-contain w-2"
            alt="Left edge top"
          />
          <div className="bg-[rgba(229,250,184,1)] flex min-h-[229px] w-full flex-1" />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/42dfcb6e774a8dbfbd1cccccb68b161bba16e44d?placeholderIfAbsent=true"
            className="aspect-[0.67] object-contain w-2"
            alt="Left edge bottom"
          />
        </div>
        <div className="bg-[rgba(229,250,184,1)] flex flex-col items-center justify-center w-[216px] p-2">
          <div className="flex w-full max-w-[200px] flex-col items-stretch px-3 py-[51px]">
            <div className="bg-[rgba(150,238,96,1)] min-h-[22px] text-[9px] text-[rgba(10,14,9,1)] font-semibold text-center leading-[0.8] px-3 py-2 rounded-[22px]">
              {" "}
              . Expert-Verified Answer
            </div>
            <div className="bg-[rgba(206,245,122,1)] flex shrink-0 h-[22px] mt-[38px] rounded-[22px]" />
            <div className="bg-[rgba(206,245,122,1)] flex w-[141px] shrink-0 h-[22px] mt-3.5 rounded-[22px]" />
            <div className="z-10 flex mt-[-15px] items-stretch gap-px max-md:mr-[5px]">
              <div className="bg-[rgba(206,245,122,1)] flex w-[95px] shrink-0 h-[22px] my-auto rounded-[22px]" />
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/c3d8340ebe933fb40739a08b286f380b2a028816?placeholderIfAbsent=true"
                className="aspect-[1] object-contain w-[76px] shrink-0"
                alt="Worksheet illustration"
              />
            </div>
          </div>
        </div>
        <div className="rotate-[1.6081234170511172e-16rad] flex flex-col items-stretch justify-center">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/87ac8af5f715cfc1626bc959198a2206e1062620?placeholderIfAbsent=true"
            className="aspect-[0.67] object-contain w-2"
            alt="Right edge top"
          />
          <div className="bg-[rgba(229,250,184,1)] flex min-h-[229px] w-full flex-1" />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/64c655a6b975bba0557a5d8f6bc6a1e220487f8a?placeholderIfAbsent=true"
            className="aspect-[0.67] object-contain w-2"
            alt="Right edge bottom"
          />
        </div>
      </div>
      <div className="flex w-full items-center">
        <div className="self-stretch flex w-full items-center flex-1 shrink basis-[0%] my-auto">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/81be2232536d2ce694440ddd3d099b7be42ec9f3?placeholderIfAbsent=true"
            className="aspect-[1.5] object-contain w-3 self-stretch shrink-0 my-auto"
            alt="Bottom left corner"
          />
          <div className="bg-[rgba(229,250,184,1)] self-stretch flex w-48 shrink h-2 flex-1 basis-[0%]" />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/2f4fd101c0250e52c465eec5f5e256bb556f698c?placeholderIfAbsent=true"
            className="aspect-[1.5] object-contain w-3 self-stretch shrink-0 my-auto"
            alt="Bottom right corner"
          />
        </div>
      </div>
    </div>
  );

  // Test Prep Illustration
  const testPrepIllustration = (
    <img
      src="https://cdn.builder.io/api/v1/image/assets/TEMP/d06193b335ef4d14cbf322adc015ffd87864c48b?placeholderIfAbsent=true"
      className="aspect-[0.86] object-contain w-[232px]"
      alt="Test Prep illustration"
    />
  );

  // Live Experts Illustration
  const liveExpertsIllustration = (
    <img
      src="https://cdn.builder.io/api/v1/image/assets/TEMP/4c2161d677c618bbbff15a84779d41eb0da351ed?placeholderIfAbsent=true"
      className="aspect-[0.86] object-contain w-[232px]"
      alt="Live Experts illustration"
    />
  );

  return (
    <div className="self-center flex w-full flex-col items-center pt-10 pb-20 max-md:max-w-full">
      <div className="w-[720px] max-w-full text-[45px] text-[#0a0e09] font-black text-center leading-[39px] py-3 max-md:max-w-full max-md:text-[40px] max-md:leading-[38px]">
        SAVING THE PLANET SHOULDN'T FEEL OVERWHELMING.
      </div>
      <div className="flex w-[1222px] max-w-full gap-[24px_0px] justify-between flex-wrap mt-2 py-2.5">
        <FeatureCard
          title="Interactive Lessons"
          description="Learn environmental science through engaging interactive content and multimedia experiences."
          buttonText="Start learning"
          illustration={verifiedQAIllustration}
        />
        <FeatureCard
          title="Eco Challenges"
          description="Complete real-world environmental tasks like tree planting, waste segregation, and green actions."
          buttonText="Take challenge"
          illustration={worksheetsIllustration}
        />
        <FeatureCard
          title="Green Quizzes"
          description="Test your environmental knowledge with gamified quizzes and earn eco-points for each correct answer."
          buttonText="Take quiz"
          illustration={testPrepIllustration}
        />
        <FeatureCard
          title="Eco Rewards"
          description="Earn digital badges, recognition, and compete with schools through sustainable practice tracking."
          buttonText="View rewards"
          illustration={liveExpertsIllustration}
        />
      </div>
    </div>
  );
};

export default Features;
