
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
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex-shrink-0">
            <div className={`min-h-[56px] ${isMobile ? 'w-[140px]' : 'w-[200px]'} max-w-full`}>
              <img
                src="/eco-quest-logo.png"
                className="aspect-[2.22] object-contain w-full"
                alt="Eco Quest Logo"
              />
            </div>
          </Link>
          
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2 text-sm font-semibold transition-all duration-300 hover:text-[#B8EE7C] ${
                    location.pathname === item.path 
                      ? 'text-[#B8EE7C] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#B8EE7C]' 
                      : 'text-[#0A0E09]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
          
          {isMobile && (
            <button className="md:hidden p-2">
              <svg className="w-6 h-6 text-[#0A0E09]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
