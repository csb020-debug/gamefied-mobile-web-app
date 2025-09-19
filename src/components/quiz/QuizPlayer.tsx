import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Trophy, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
  explanation?: string;
}

interface QuizPlayerProps {
  quiz: {
    id: string;
    title: string;
    description: string;
    config: {
      questions: Question[];
      totalPoints: number;
      timeLimit?: number;
      instructions: string;
    };
  };
  onComplete: (score: number, totalPoints: number) => void;
  onExit: () => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onComplete, onExit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [timeLeft, setTimeLeft] = useState(quiz.config.timeLimit || null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const questions = quiz.config.questions;
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (timeLeft && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateScore = () => {
    let totalScore = 0;
    questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined) {
        if (question.type === 'multiple_choice' || question.type === 'true_false') {
          if (userAnswer === question.correctAnswer) {
            totalScore += question.points;
          }
        } else {
          // For short answer and essay, give partial credit
          totalScore += question.points * 0.8; // 80% for attempting
        }
      }
    });
    return totalScore;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setIsSubmitted(true);
    setShowResults(true);
    
    toast({
      title: "Quiz Submitted!",
      description: `You scored ${finalScore} out of ${quiz.config.totalPoints} points!`,
    });
  };

  const handleComplete = () => {
    onComplete(score, quiz.config.totalPoints);
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice': return '🔘';
      case 'true_false': return '✅';
      case 'short_answer': return '📝';
      case 'essay': return '📄';
      default: return '❓';
    }
  };

  const renderQuestion = () => {
    const userAnswer = answers[currentQuestion.id];

    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getQuestionIcon(currentQuestion.type)}</span>
              <div>
                <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
                <CardDescription>{currentQuestion.points} points</CardDescription>
              </div>
            </div>
            {timeLeft && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium">{currentQuestion.question}</div>

          {currentQuestion.type === 'multiple_choice' && (
            <RadioGroup
              value={userAnswer?.toString()}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
            >
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === 'true_false' && (
            <RadioGroup
              value={userAnswer?.toString()}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="true" />
                <Label htmlFor="true" className="cursor-pointer">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="false" />
                <Label htmlFor="false" className="cursor-pointer">False</Label>
              </div>
            </RadioGroup>
          )}

          {(currentQuestion.type === 'short_answer' || currentQuestion.type === 'essay') && (
            <Textarea
              value={userAnswer || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder={currentQuestion.type === 'short_answer' ? 'Enter your answer...' : 'Write your essay response...'}
              rows={currentQuestion.type === 'essay' ? 6 : 3}
              className="w-full"
            />
          )}

          {showResults && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {userAnswer === currentQuestion.correctAnswer ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {userAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              {currentQuestion.explanation && (
                <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderResults = () => {
    const percentage = Math.round((score / quiz.config.totalPoints) * 100);
    const correctAnswers = questions.filter(q => answers[q.id] === q.correctAnswer).length;

    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          <CardDescription>Here's how you did</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="text-3xl font-bold text-primary">{score}</div>
              <div className="text-sm text-muted-foreground">Points Earned</div>
            </div>
            <div className="p-4 bg-secondary/10 rounded-lg">
              <div className="text-3xl font-bold text-secondary">{percentage}%</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Correct Answers</span>
              <span>{correctAnswers}/{questions.length}</span>
            </div>
            <Progress value={(correctAnswers / questions.length) * 100} className="h-2" />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleComplete} className="flex-1">
              <Trophy className="h-4 w-4 mr-2" />
              Complete Quiz
            </Button>
            <Button variant="outline" onClick={onExit}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (showResults) {
    return renderResults();
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={onExit}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit Quiz
            </Button>
            <div className="text-sm text-muted-foreground">
              {Object.keys(answers).length}/{questions.length} answered
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-muted-foreground">{quiz.description}</p>
          </div>

          <div className="mt-4">
            <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="h-2" />
          </div>
        </div>

        {/* Question */}
        {renderQuestion()}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex space-x-2">
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={isSubmitted}>
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;
