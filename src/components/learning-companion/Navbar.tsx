
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div
      className="justify-between items-center backdrop-blur-md bg-[rgba(255,255,255,0.80)] flex w-full px-16 py-4 max-md:px-4"
      aria-label="Top navigation bar"
    >
      <div className="self-stretch flex min-w-60 w-full flex-col items-center flex-1 shrink basis-[0%] my-auto pt-6">
        <div className={`min-h-[100px] ${isMobile ? 'w-[160px]' : 'w-[223px]'} max-w-full`}>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/5649d9f7037e46bfb785405d17b2e6b707bf0d6d?placeholderIfAbsent=true"
            className="aspect-[2.22] object-contain w-full"
            alt="Learning Companion Logo"
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
