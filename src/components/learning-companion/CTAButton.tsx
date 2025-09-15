
import React from "react";

interface CTAButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  text,
  onClick,
  className = "",
}) => {
  return (
    <button
      className={`bg-[#B8EE7C] text-[17px] text-[#0A0E09] font-bold py-3 px-8 rounded-full hover:bg-[#96EE60] transition-colors cursor-pointer ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default CTAButton;
