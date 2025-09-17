import React from "react";
import Footer from "../components/learning-companion/Footer";
import ExpandableCardDemo from "@/components/ui/expandable-card-demo-grid";
 

const Learn: React.FC = () => {

  return (
    <div className="min-h-screen bg-background relative">
      <main className="flex-1 py-8 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight uppercase text-foreground mb-3 sm:mb-4">
              Environmental Lessons
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light leading-relaxed text-foreground max-w-4xl mx-auto">
              Master environmental science through interactive lessons and earn eco-points
            </p>
          </div>

          {/* Expandable Cards Design */}
          <ExpandableCardDemo />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Learn;