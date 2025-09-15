
import React from "react";

export const StudySmarter: React.FC = () => {
  return (
    <div className="bg-[rgba(242,242,242,1)] flex w-full flex-col items-center pt-10 pb-20 px-4 max-md:max-w-full">
      <div className="flex w-[720px] max-w-full flex-col items-stretch text-[#0a0e09] text-center py-3">
        <h2 className="text-[45px] font-black leading-none self-center max-md:max-w-full max-md:text-[32px]">
          HOW THEY'RE STUDYING SMARTER
        </h2>
        <div className="w-full text-[32px] font-light leading-[45px] mt-2 max-md:max-w-full max-md:text-xl max-md:leading-normal">
          Watch how Brainly is taking students from "what even is this?" to "I
          got this."
        </div>
      </div>
      <div className="flex min-h-[566px] w-[1012px] max-w-full items-center gap-[40px] justify-center flex-wrap">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/043071858dfd2a81b3e8ca9d860afe465d77fb50?placeholderIfAbsent=true"
          className="aspect-[283/504] object-contain w-[226px] shadow-[0px_8px_32px_0px_rgba(50,60,69,0.20)] self-stretch min-w-60 grow shrink my-auto max-md:max-w-[180px]"
          alt="Student example 1"
        />
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/3b025859e9aaa0b2ca167722d836a26b7cb219a0?placeholderIfAbsent=true"
          className="aspect-[283/504] object-contain w-[226px] shadow-[0px_8px_32px_0px_rgba(50,60,69,0.20)] self-stretch min-w-60 grow shrink my-auto max-md:max-w-[180px]"
          alt="Student example 2"
        />
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/376860ac3b1892e0c4b42ca87b482748f2977e14?placeholderIfAbsent=true"
          className="aspect-[283/504] object-contain w-[226px] shadow-[0px_8px_32px_0px_rgba(50,60,69,0.20)] self-stretch min-w-60 grow shrink my-auto max-md:max-w-[180px]"
          alt="Student example 3"
        />
      </div>
    </div>
  );
};

export default StudySmarter;
