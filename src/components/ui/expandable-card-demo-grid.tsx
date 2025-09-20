"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import {
  IconCheck,
} from "@tabler/icons-react";

export default function ExpandableCardDemo() {
  const [active, setActive] = useState<(typeof cards)[number] | boolean | null>(
    null
  );
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[500px] h-full md:h-[90vh] md:max-h-[90vh] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.title}-${id}`} className="relative flex-shrink-0">
                <img
                  width={500}
                  height={320}
                  src={active.imageSrc}
                  alt={active.title}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-center"
                />
                {active.completed && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2 shadow-lg">
                    <IconCheck className="w-5 h-5" />
                  </div>
                )}
              </motion.div>

              <div className="flex-shrink-0">
                <div className="flex justify-between items-start p-4">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-medium text-neutral-700 dark:text-neutral-200 text-base"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400 text-base"
                    >
                      {active.description}
                    </motion.p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {active.difficulty}
                      </span>
                      <span className="text-green-600 font-semibold text-sm">
                        🌿 {active.points} pts
                      </span>
                      <span className="text-gray-500 text-sm">
                        {active.progress}% Complete
                      </span>
                    </div>
                  </div>

                  <motion.button
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white hover:bg-green-600 transition-colors"
                    onClick={() => {
                      // Handle lesson action - start, continue, or review lesson
                    }}
                  >
                    {active.progress === 0 ? 'Start Lesson' : active.completed ? 'Review Lesson' : 'Continue Lesson'}
                  </motion.button>
                </div>
                <div className="pt-4 relative px-4 flex-1 flex flex-col">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-sm md:text-base lg:text-base flex-1 overflow-y-auto dark:text-neutral-400 pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    style={{
                      maxHeight: 'calc(100vh - 500px)',
                      minHeight: '200px'
                    }}
                  >
                    <div className="space-y-4">
                      {typeof active.content === "function"
                        ? active.content()
                        : active.content}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start gap-3">
        {cards.map((card, index) => (
          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={card.title}
            onClick={() => setActive(card)}
            className="p-4 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer transition-colors"
          >
            <div className="flex gap-4 flex-col w-full">
              <motion.div layoutId={`image-${card.title}-${id}`} className="relative">
                <img
                  width={300}
                  height={240}
                  src={card.imageSrc}
                  alt={card.title}
                  className={`w-full rounded-lg object-cover object-center h-80`}
                />
                {card.completed && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1.5 shadow-md">
                    <IconCheck className="w-4 h-4" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="rounded-lg bg-gradient-to-t from-black/60 via-black/30 to-transparent p-3">
                    <div className="flex items-center justify-between text-white text-sm mb-2">
                      <span className="font-semibold">{card.title}</span>
                      <span className="font-medium">Progress {card.progress}%</span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full bg-green-500 transition-all duration-500"
                        style={{ width: `${card.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
              {null}
            </div>
          </motion.div>
        ))}
      </ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

const cards = [
  {
    title: "Climate Change Basics",
    description: "Understanding greenhouse gases and global warming impact.",
    imageSrc: "/climate.png",
    difficulty: "Beginner",
    points: 100,
    progress: 85,
    completed: false,
    content: () => {
      return (
        <div className="space-y-4">
          <p>
            Climate change refers to long-term shifts in global temperatures and weather patterns. 
            While climate variations are natural, since the 1800s human activities have been the 
            main driver of climate change, primarily due to burning fossil fuels.
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Key Learning Points:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Greenhouse gas effects on atmosphere</li>
              <li>• Global temperature rise patterns</li>
              <li>• Impact on weather systems</li>
              <li>• Human vs natural causes</li>
            </ul>
          </div>
        </div>
      );
    },
  },
  {
    title: "Renewable Energy",
    description: "Solar, wind, and hydroelectric power solutions.",
    imageSrc: "/renewable.png",
    difficulty: "Intermediate",
    points: 150,
    progress: 100,
    completed: true,
    content: () => {
      return (
        <div className="space-y-4">
          <p>
            Renewable energy comes from natural sources that are constantly replenished. 
            These include solar, wind, hydroelectric, geothermal, and biomass energy. 
            Unlike fossil fuels, renewable energy sources produce little to no greenhouse gas emissions.
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Types of Renewable Energy:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Solar photovoltaic systems</li>
              <li>• Wind turbines and farms</li>
              <li>• Hydroelectric power plants</li>
              <li>• Geothermal energy systems</li>
            </ul>
          </div>
        </div>
      );
    },
  },
  {
    title: "Ocean Conservation",
    description: "Marine ecosystems and plastic pollution solutions.",
    imageSrc: "/ocean.png",
    difficulty: "Beginner",
    points: 120,
    progress: 45,
    completed: false,
    content: () => {
      return (
        <div className="space-y-4">
          <p>
            Ocean conservation involves protecting and preserving marine ecosystems, 
            which cover over 70% of Earth's surface. Our oceans face threats from 
            pollution, overfishing, climate change, and habitat destruction.
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Conservation Strategies:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Marine protected areas</li>
              <li>• Sustainable fishing practices</li>
              <li>• Plastic waste reduction</li>
              <li>• Coral reef restoration</li>
            </ul>
          </div>
        </div>
      );
    },
  },
  {
    title: "Sustainable Living",
    description: "Eco-friendly lifestyle choices and footprint reduction.",
    imageSrc: "/sustainable_living.png",
    difficulty: "Advanced",
    points: 180,
    progress: 0,
    completed: false,
    content: () => {
      return (
        <div className="space-y-4">
          <p>
            Sustainable living means making choices that reduce your environmental impact 
            and promote the long-term health of our planet. It involves conscious decisions 
            about consumption, energy use, transportation, and waste management.
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Sustainable Practices:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Reduce, reuse, recycle</li>
              <li>• Energy-efficient appliances</li>
              <li>• Sustainable transportation</li>
              <li>• Conscious consumption</li>
            </ul>
          </div>
        </div>
      );
    },
  },
  {
    title: "Biodiversity Protection",
    description: "Preserving wildlife and natural habitats worldwide.",
    imageSrc: "/bio.png", // Updated to use the provided bio.png in public
    difficulty: "Intermediate",
    points: 200,
    progress: 30,
    completed: false,
    content: () => {
      return (
        <div className="space-y-4">
          <p>
            Biodiversity refers to the variety of life on Earth, including all species 
            of plants, animals, fungi, and microorganisms. Protecting biodiversity is 
            crucial for ecosystem stability, human survival, and the planet's health.
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Protection Methods:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Habitat preservation</li>
              <li>• Species conservation programs</li>
              <li>• Anti-poaching efforts</li>
              <li>• Ecosystem restoration</li>
            </ul>
          </div>
        </div>
      );
    },
  },
  {
    title: "Waste Management",
    description: "Reduce, reuse, recycle for circular economy.",
    imageSrc: "/waste_management.png",
    difficulty: "Beginner",
    points: 140,
    progress: 60,
    completed: false,
    content: () => {
      return (
        <div className="space-y-4">
          <p>
            Effective waste management is essential for protecting the environment and 
            human health. The circular economy approach focuses on keeping resources 
            in use for as long as possible through reduction, reuse, and recycling.
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Waste Hierarchy:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Reduce consumption</li>
              <li>• Reuse materials</li>
              <li>• Recycle properly</li>
              <li>• Compost organic waste</li>
            </ul>
          </div>
        </div>
      );
    },
  },
  {
    title: "Green Technology",
    description: "Innovative technologies for sustainability.",
    imageSrc: "/green_tech.png",
    difficulty: "Advanced",
    points: 220,
    progress: 15,
    completed: false,
    content: () => {
      return (
        <div className="space-y-4">
          <p>
            Green technology, also known as clean technology, refers to environmentally 
            friendly innovations that help reduce environmental impact. These technologies 
            are designed to be more efficient and sustainable than traditional alternatives.
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Green Tech Examples:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Electric vehicles</li>
              <li>• Smart grid systems</li>
              <li>• Carbon capture technology</li>
              <li>• Green building materials</li>
            </ul>
          </div>
        </div>
      );
    },
  },
  {
    title: "Environmental Action",
    description: "Practical steps to make a real difference.",
    imageSrc: "/environmental_action.png",
    difficulty: "Intermediate",
    points: 160,
    progress: 70,
    completed: false,
    content: () => {
      return (
        <div className="space-y-4">
          <p>
            Taking environmental action means making conscious choices and taking steps 
            to protect and preserve our planet. Individual actions, when multiplied by 
            millions, can create significant positive change for the environment.
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Action Steps:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Join environmental groups</li>
              <li>• Advocate for policy changes</li>
              <li>• Educate others</li>
              <li>• Support sustainable businesses</li>
            </ul>
          </div>
        </div>
      );
    },
  },
];
