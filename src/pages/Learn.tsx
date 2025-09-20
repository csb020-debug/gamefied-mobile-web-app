import React, { useState, useEffect } from "react";
import Footer from "../components/learning-companion/Footer";
import ExpandableCardDemo from "@/components/ui/expandable-card-demo-grid";
import { useChallenges } from "@/hooks/useChallenges";
import { useStudent } from "@/hooks/useStudent";
import QuizPlayer from "@/components/quiz/QuizPlayer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Target } from "lucide-react";
 

const Learn: React.FC = () => {
  const { challenges, getSubmissionForChallenge, completeChallenge } = useChallenges();
  const { currentStudent, currentClass } = useStudent();
  const [activeQuiz, setActiveQuiz] = useState<any>(null);

  const quizChallenges = challenges.filter(challenge => challenge.type === 'quiz');

  const handleStartQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
  };

  const handleQuizComplete = async (score: number, totalPoints: number) => {
    if (activeQuiz) {
      try {
        await completeChallenge(activeQuiz.id, score);
        setActiveQuiz(null);
      } catch (error) {
        console.error('Error completing quiz:', error);
      }
    }
  };

  const handleQuizExit = () => {
    setActiveQuiz(null);
  };

  if (activeQuiz) {
    return (
      <QuizPlayer
        quiz={activeQuiz}
        onComplete={handleQuizComplete}
        onExit={handleQuizExit}
      />
    );
  }

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

          {/* Quiz Section */}
          {quizChallenges.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <BookOpen className="h-6 w-6 mr-2" />
                Available Quizzes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizChallenges.map((quiz) => {
                  const submission = getSubmissionForChallenge(quiz.id);
                  const isCompleted = submission?.completed || false;
                  const score = submission?.score || 0;

                  return (
                    <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{quiz.title}</CardTitle>
                          {isCompleted && (
                            <Badge variant="outline" className="bg-green-100">
                              ✓ Complete
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{quiz.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>🌿 {quiz.config?.totalPoints || 100} points</span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {quiz.config?.questions?.length || 0} questions
                            </span>
                          </div>

                          {quiz.due_at && (
                            <div className="text-sm text-muted-foreground">
                              Due: {new Date(quiz.due_at).toLocaleDateString()}
                            </div>
                          )}

                          {isCompleted ? (
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="font-semibold text-green-800">
                                Completed! ({score} points)
                              </div>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleStartQuiz(quiz)}
                              className="w-full"
                            >
                              <Target className="h-4 w-4 mr-2" />
                              Start Quiz
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expandable Cards Design */}
          <ExpandableCardDemo />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Learn;