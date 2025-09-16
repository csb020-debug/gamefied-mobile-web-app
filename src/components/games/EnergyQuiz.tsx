import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import GameLayout from "@/components/games/GameLayout";
import GameHUD from "@/components/games/GameHUD";
import { useGameEngine } from "@/hooks/useGameEngine";

interface EnergyQuizProps {
  onComplete: () => void;
}

const EnergyQuiz: React.FC<EnergyQuizProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const engine = useGameEngine({ initialLives: 3, initialScore: 0, autoStart: true });

  const questions = [
    {
      question: "Which energy source produces the least carbon emissions?",
      options: ["Coal", "Natural Gas", "Solar Power", "Oil"],
      correct: 2,
      explanation: "Solar power produces virtually no carbon emissions during operation!"
    },
    {
      question: "What percentage of global electricity comes from renewable sources?",
      options: ["About 15%", "About 30%", "About 50%", "About 75%"],
      correct: 1,
      explanation: "Approximately 30% of global electricity comes from renewable sources as of 2024."
    },
    {
      question: "Which country leads in wind energy production?",
      options: ["Germany", "USA", "China", "Denmark"],
      correct: 2,
      explanation: "China is the world's largest producer of wind energy!"
    },
    {
      question: "How long can solar panels typically generate electricity?",
      options: ["10-15 years", "20-25 years", "25-30 years", "35+ years"],
      correct: 2,
      explanation: "Solar panels typically last 25-30 years and often come with 25-year warranties."
    },
    {
      question: "What is geothermal energy?",
      options: [
        "Energy from ocean waves",
        "Energy from Earth's internal heat", 
        "Energy from biomass",
        "Energy from hydrogen"
      ],
      correct: 1,
      explanation: "Geothermal energy harnesses the natural heat from inside the Earth!"
    }
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === questions[currentQuestion].correct;
    setShowResult(true);

    if (isCorrect) {
      engine.addPoints(15);
      toast.success("Correct! +15 points");
    } else {
      engine.miss();
      toast.error("Incorrect. Keep learning!");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizComplete(false);
    engine.reset();
  };

  if (quizComplete) {
    const totalPossible = questions.length * 15;
    const percentage = Math.round(((engine.score) / totalPossible) * 100);
    return (
      <GameLayout
        hud={<GameHUD score={engine.score} streak={engine.streak} lives={engine.lives} maxLives={engine.maxLives} onReset={resetQuiz} />}
      >
        <Card className="p-8 text-center w-full">
          <h2 className="text-3xl font-bold text-black mb-4">⚡ Quiz Complete!</h2>
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-xl mb-2">Final Score: <span className="font-bold text-[#B8EE7C]">{engine.score}</span> points</p>
          <p className="text-lg mb-4">Accuracy: {percentage}%</p>
          <p className="text-gray-600 mb-6">
            {percentage >= 80 ? "Excellent! You're an energy expert! 🌟" :
             percentage >= 60 ? "Good job! Keep learning about renewable energy! 👍" :
             "Keep studying! Every expert was once a beginner! 📚"}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={resetQuiz}
              className="bg-[#B8EE7C] text-[#0A0E09] font-bold py-3 px-6 rounded-lg hover:bg-[#96EE60] transition-colors"
            >
              Retake Quiz
            </button>
            <button
              onClick={onComplete}
              className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Games
            </button>
          </div>
        </Card>
      </GameLayout>
    );
  }

  const question = questions[currentQuestion];

  return (
    <GameLayout
      hud={<GameHUD score={engine.score} streak={engine.streak} lives={engine.lives} maxLives={engine.maxLives} onReset={resetQuiz} />}
    >
      <Card className="p-8 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-2">⚡ Renewable Energy Quiz</h2>
          <p className="text-gray-600">Test your knowledge about clean energy!</p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-lg font-semibold">Score: {engine.score}</span>
            <span className="text-lg font-semibold">Question {currentQuestion + 1}/{questions.length}</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-black mb-6">{question.question}</h3>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? showResult
                      ? index === question.correct
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-[#B8EE7C] bg-[#B8EE7C]/10'
                    : showResult && index === question.correct
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                {showResult && index === question.correct && (
                  <span className="float-right text-green-600">✓</span>
                )}
                {showResult && selectedAnswer === index && index !== question.correct && (
                  <span className="float-right text-red-600">✗</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {showResult && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              <strong>Explanation:</strong> {question.explanation}
            </p>
          </div>
        )}

        <div className="text-center">
          {!showResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className={`px-8 py-3 rounded-lg font-bold transition-colors ${
                selectedAnswer !== null
                  ? 'bg-[#B8EE7C] text-[#0A0E09] hover:bg-[#96EE60]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="bg-[#B8EE7C] text-[#0A0E09] font-bold py-3 px-8 rounded-lg hover:bg-[#96EE60] transition-colors"
            >
              {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          )}
        </div>

        <div className="mt-8">
          <div className="bg-gray-200 rounded-full h-4">
            <div 
              className="bg-[#B8EE7C] h-4 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Progress: {Math.round(((currentQuestion) / questions.length) * 100)}%
          </p>
        </div>
      </Card>
    </GameLayout>
  );
};

export default EnergyQuiz;