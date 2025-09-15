
import React from "react";
import Navbar from "../components/learning-companion/Navbar";
import Hero from "../components/learning-companion/Hero";
import Features from "../components/learning-companion/Features";
import NoMoreStuck from "../components/learning-companion/NoMoreStuck";
import StudySmarter from "../components/learning-companion/StudySmarter";
import Footer from "../components/learning-companion/Footer";

const Index: React.FC = () => {
  return (
    <div className="flex flex-col max-w-[1920px] mx-auto px-[70px] max-md:px-4">
      <div className="items-start bg-white relative flex gap-2.5 overflow-hidden">
        <div className="absolute z-0 flex min-w-60 w-[1597px] shrink-0 h-[959px] left-[-127px] top-[220px] max-md:max-w-full" />
        <div className="z-0 flex min-w-60 w-full flex-col items-stretch my-auto">
          <Navbar />
          <Hero />
          <Features />
          <NoMoreStuck />
          <StudySmarter />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
