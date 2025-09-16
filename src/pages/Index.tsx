
import React from "react";
import StaggeredMenu from "../components/ui/StaggeredMenu";
import Hero from "../components/learning-companion/Hero";
import Features from "../components/learning-companion/Features";
import NoMoreStuck from "../components/learning-companion/NoMoreStuck";
import StudySmarter from "../components/learning-companion/StudySmarter";
import Footer from "../components/learning-companion/Footer";
import { menuItems, socialItems } from "../components/ui/MenuData";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-white relative">
      <StaggeredMenu
        position="right"
        items={menuItems}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        menuButtonColor="#0A0E09"
        openMenuButtonColor="#fff"
        changeMenuColorOnOpen={true}
        colors={['#B19EEF', '#5227FF']}
        logoUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/5649d9f7037e46bfb785405d17b2e6b707bf0d6d?placeholderIfAbsent=true"
        accentColor="#ff6b6b"
        onMenuOpen={() => console.log('Menu opened')}
        onMenuClose={() => console.log('Menu closed')}
      />
      <Hero />
      <Features />
      <NoMoreStuck />
      <StudySmarter />
      <Footer />
    </div>
  );
};

export default Index;
