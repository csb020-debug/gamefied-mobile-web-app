"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
    onClick,
  }: {
    card: any;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
    onClick?: () => void;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      onClick={onClick}
      className={cn(
        "rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out cursor-pointer",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]",
        onClick && "hover:scale-105"
      )}
    >
      <img
        src={card.src}
        alt={card.title}
        className="object-cover absolute inset-0"
      />
       <div
         className={cn(
           "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center py-6 px-4 transition-opacity duration-300",
           hovered === index ? "opacity-100" : "opacity-0"
         )}
       >
         <div className="text-center">
           <div className="text-lg md:text-xl font-['Luckiest_Guy'] text-white drop-shadow-2xl leading-tight">
             {card.title}
           </div>
         </div>
       </div>
    </div>
  )
);

Card.displayName = "Card";

type Card = {
  title: string;
  src: string;
};

export function FocusCards({ cards }: { cards: Card[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto md:px-8 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}

export function FocusCardsWithClick({ 
  cards, 
  onGameClick, 
  games 
}: { 
  cards: Card[]; 
  onGameClick: (gameId: string) => void;
  games: any[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const handleCardClick = (cardTitle: string) => {
    // Find the game that matches the card title
    const game = games.find(g => g.title === cardTitle);
    if (game) {
      onGameClick(game.id);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto md:px-8 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
          onClick={() => handleCardClick(card.title)}
        />
      ))}
    </div>
  );
}
