
import React, { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  buttonText: string;
  illustration: ReactNode;
  onButtonClick?: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  buttonText,
  illustration,
  onButtonClick,
}) => {
  return (
    <div className="min-w-60 w-[600px] max-md:max-w-full mb-8">
      <div className="bg-[rgba(242,242,242,1)] flex min-w-60 items-stretch gap-10 flex-wrap flex-1 shrink basis-[0%] my-auto p-6 rounded-2xl">
        <div className="flex min-w-60 flex-col items-stretch flex-1 shrink basis-[0%] my-auto">
          <div className="w-full text-[rgba(10,14,9,1)]">
            <div className="text-[41px] font-black leading-none tracking-[-0.41px]">
              {title}
            </div>
            <div className="text-base font-light leading-[22px] tracking-[0.47px] mt-6">
              {description}
            </div>
          </div>
          <button
            className="bg-[rgba(10,14,9,1)] text-xs text-white font-bold text-center leading-none mt-16 pt-[11px] pb-[9px] px-4 rounded-[999px] max-md:mt-10"
            onClick={onButtonClick}
          >
            {buttonText}
          </button>
        </div>
        {illustration}
      </div>
    </div>
  );
};

export default FeatureCard;
