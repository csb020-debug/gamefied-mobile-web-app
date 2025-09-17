import { cn } from "@/lib/utils";
import {
  IconLeaf,
  IconSun,
  IconWind,
  IconDroplet,
  IconRecycle,
  IconTree,
  IconFlame,
  IconHeart,
  IconCheck,
} from "@tabler/icons-react";

interface LessonFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
  points: number;
  difficulty: string;
  progress: number;
  completed: boolean;
}

export default function EnvironmentalLessonsFeatures() {
  const features: LessonFeature[] = [
    {
      title: "Climate Change Basics",
      description: "Understanding greenhouse gases and global warming impact.",
      icon: <IconFlame className="w-8 h-8" />,
      points: 100,
      difficulty: "Beginner",
      progress: 85,
      completed: false
    },
    {
      title: "Renewable Energy",
      description: "Solar, wind, and hydroelectric power solutions.",
      icon: <IconSun className="w-8 h-8" />,
      points: 150,
      difficulty: "Intermediate",
      progress: 100,
      completed: true
    },
    {
      title: "Ocean Conservation",
      description: "Marine ecosystems and plastic pollution solutions.",
      icon: <IconDroplet className="w-8 h-8" />,
      points: 120,
      difficulty: "Beginner",
      progress: 45,
      completed: false
    },
    {
      title: "Sustainable Living",
      description: "Eco-friendly lifestyle choices and footprint reduction.",
      icon: <IconLeaf className="w-8 h-8" />,
      points: 180,
      difficulty: "Advanced",
      progress: 0,
      completed: false
    },
    {
      title: "Biodiversity Protection",
      description: "Preserving wildlife and natural habitats worldwide.",
      icon: <IconTree className="w-8 h-8" />,
      points: 200,
      difficulty: "Intermediate",
      progress: 30,
      completed: false
    },
    {
      title: "Waste Management",
      description: "Reduce, reuse, recycle for circular economy.",
      icon: <IconRecycle className="w-8 h-8" />,
      points: 140,
      difficulty: "Beginner",
      progress: 60,
      completed: false
    },
    {
      title: "Green Technology",
      description: "Innovative technologies for sustainability.",
      icon: <IconWind className="w-8 h-8" />,
      points: 220,
      difficulty: "Advanced",
      progress: 15,
      completed: false
    },
    {
      title: "Environmental Action",
      description: "Practical steps to make a real difference.",
      icon: <IconHeart className="w-8 h-8" />,
      points: 160,
      difficulty: "Intermediate",
      progress: 70,
      completed: false
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <LessonFeature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const LessonFeature = ({
  title,
  description,
  icon,
  points,
  difficulty,
  progress,
  completed,
  index,
}: LessonFeature & { index: number }) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-neutral-200 transition-all duration-300",
        (index === 0 || index === 4) && "lg:border-l",
        index < 4 && "lg:border-b",
        completed && "bg-green-50 border-green-200 shadow-md shadow-green-100"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-green-50 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-green-50 to-transparent pointer-events-none" />
      )}
      
      {/* Completion Checkmark */}
      {completed && (
        <div className="absolute top-4 right-4 z-20 animate-in fade-in duration-500">
          <div className="bg-green-500 text-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow duration-300">
            <IconCheck className="w-5 h-5" />
          </div>
        </div>
      )}
      
      <div className="mb-4 relative z-10 px-10 text-green-600">
        {icon}
      </div>
      
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-green-200 group-hover/feature:bg-green-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800">
          {title}
        </span>
      </div>
      
      <p className="text-xs text-neutral-500 max-w-xs relative z-10 px-10 mb-4 overflow-hidden" style={{
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}>
        {description}
      </p>

      {/* Progress and Points Section */}
      <div className="px-10 relative z-10 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
            {difficulty}
          </span>
          <span className="text-green-600 font-semibold">
            🌿 {points} pts
          </span>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500 bg-green-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>


        {/* Action Button */}
        <button className={cn(
          "w-full mt-4 font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm",
          completed 
            ? "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg" 
            : "bg-green-500 hover:bg-green-600 text-white"
        )}>
          {progress === 0 ? 'Start Lesson' : completed ? 'Review Lesson' : 'Continue Lesson'}
        </button>
      </div>
    </div>
  );
};
