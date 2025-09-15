
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Learn", path: "/learn" },
    { name: "Games", path: "/games" },
    { name: "Challenges", path: "/challenges" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <div
      className="justify-between items-center backdrop-blur-md bg-[rgba(255,255,255,0.80)] flex w-full px-16 py-4 max-md:px-4"
      aria-label="Top navigation bar"
    >
      <div className="flex items-center gap-8 w-full">
        <Link to="/" className="flex-shrink-0">
          <div className={`min-h-[60px] ${isMobile ? 'w-[120px]' : 'w-[160px]'} max-w-full`}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/5649d9f7037e46bfb785405d17b2e6b707bf0d6d?placeholderIfAbsent=true"
              className="aspect-[2.22] object-contain w-full"
              alt="EcoLearn Platform Logo"
            />
          </div>
        </Link>
        
        {!isMobile && (
          <nav className="flex items-center gap-6 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-semibold transition-colors hover:text-[#B8EE7C] ${
                  location.pathname === item.path 
                    ? 'text-[#B8EE7C]' 
                    : 'text-[rgba(10,14,9,1)]'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}
        
        <div className="flex items-center gap-4">
          <div className="bg-[#B8EE7C] text-[#0A0E09] px-3 py-1 rounded-full text-sm font-bold">
            🌿 1,250 Eco-Points
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
