
import React from "react";
import Hero from "../components/learning-companion/Hero";
import Features from "../components/learning-companion/Features";
import NoMoreStuck from "../components/learning-companion/NoMoreStuck";
import StudySmarter from "../components/learning-companion/StudySmarter";
import Footer from "../components/learning-companion/Footer";
 

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <Hero />
      <Features />
      <NoMoreStuck />
      <StudySmarter />
      <Footer />
    </div>
  );
};

export default Index;
