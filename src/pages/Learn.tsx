import React from "react";
import Footer from "../components/learning-companion/Footer";
import ExpandableCardDemo from "@/components/ui/expandable-card-demo-grid";
 

const Learn: React.FC = () => {

  return (
    <div className="min-h-screen bg-background relative">
      <main className="flex-1 py-10">
      <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-[45px] font-black leading-[0.9] tracking-[-0.9px] uppercase text-foreground mb-4">
              Environmental Lessons
            </h1>
            <p className="text-[24px] font-light leading-[34px] text-foreground max-w-2xl mx-auto">
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