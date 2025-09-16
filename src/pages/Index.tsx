
import React from "react";
import Navbar from "../components/learning-companion/Navbar";
import Hero from "../components/learning-companion/Hero";
import Features from "../components/learning-companion/Features";
import NoMoreStuck from "../components/learning-companion/NoMoreStuck";
import StudySmarter from "../components/learning-companion/StudySmarter";
import Footer from "../components/learning-companion/Footer";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <Hero />
        <Features />
        <NoMoreStuck />
        <StudySmarter />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
