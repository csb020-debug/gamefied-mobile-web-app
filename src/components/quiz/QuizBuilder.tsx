import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
  explanation?: string;
}

interface QuizBuilderProps {
  classId: string;
  onQuizCreated: () => void;
}

const QuizBuilder: React.FC<QuizBuilderProps> = ({ classId, onQuizCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice', icon: '🔘' },
    { value: 'true_false', label: 'True/False', icon: '✅' },
    { value: 'short_answer', label: 'Short Answer', icon: '📝' },
    { value: 'essay', label: 'Essay', icon: '📄' }
  ];

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      question: '',
      options: type === 'multiple_choice' ? ['', '', '', ''] : undefined,
      correctAnswer: type === 'true_false' ? 0 : undefined,
      points: 10,
      explanation: ''
    };
    setQuestions([...questions, newQuestion]);
    setEditingQuestion(newQuestion);
  };

  const updateQuestion = (updatedQuestion: Question) => {
    setQuestions(questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
    setEditingQuestion(null);
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim() || questions.length === 0) {
      toast({
        title: "Error",
        description: "Please add a title and at least one question.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert([{
          class_id: classId,
          title: quizTitle.trim(),
          description: quizDescription.trim(),
          type: 'quiz',
          config: {
            questions: questions,
            totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
            timeLimit: null, // Can be added later
            instructions: 'Answer all questions to the best of your ability.'
          }
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Quiz created!",
        description: `${quizTitle} has been added to your class.`,
      });

      // Reset form
      setQuizTitle('');
      setQuizDescription('');
      setQuestions([]);
      setEditingQuestion(null);
      setIsOpen(false);
      onQuizCreated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const QuestionEditor = ({ question, onSave, onCancel }: {
    question: Question;
    onSave: (q: Question) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(question);

    const handleSave = () => {
      if (!formData.question.trim()) {
        toast({
          title: "Error",
          description: "Question text is required.",
          variant: "destructive",
        });
        return;
      }
      onSave(formData);
    };

    return (
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Edit Question</h3>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Question Text *</Label>
            <Textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter your question here..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Points</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 10 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as Question['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Multiple Choice Options */}
          {formData.type === 'multiple_choice' && (
            <div className="space-y-2">
              <Label>Answer Options</Label>
              {formData.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(formData.options || [])];
                      newOptions[index] = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFormData({ ...formData, correctAnswer: index })}
                    className={formData.correctAnswer === index ? 'bg-green-100' : ''}
                  >
                    Correct
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* True/False Options */}
          {formData.type === 'true_false' && (
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <div className="flex space-x-4">
                <Button
                  variant={formData.correctAnswer === 0 ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, correctAnswer: 0 })}
                >
                  True
                </Button>
                <Button
                  variant={formData.correctAnswer === 1 ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, correctAnswer: 1 })}
                >
                  False
                </Button>
              </div>
            </div>
          )}

          {/* Short Answer / Essay */}
          {(formData.type === 'short_answer' || formData.type === 'essay') && (
            <div className="space-y-2">
              <Label>Sample Answer (Optional)</Label>
              <Textarea
                value={formData.correctAnswer as string || ''}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                placeholder="Provide a sample answer or key points..."
                rows={3}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Explanation (Optional)</Label>
            <Textarea
              value={formData.explanation || ''}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Explain why this is the correct answer..."
              rows={2}
            />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Quiz</DialogTitle>
          <DialogDescription>
            Build an interactive quiz for your students with different question types.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="e.g., Environmental Science Quiz"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                placeholder="Brief description of the quiz..."
                rows={2}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Questions ({questions.length})</Label>
              <div className="flex space-x-2">
                {questionTypes.map((type) => (
                  <Button
                    key={type.value}
                    size="sm"
                    variant="outline"
                    onClick={() => addQuestion(type.value as Question['type'])}
                  >
                    {type.icon} Add {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-muted-foreground">No questions yet. Add your first question!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Question {index + 1}</Badge>
                        <Badge variant="secondary">
                          {questionTypes.find(t => t.value === question.type)?.icon} 
                          {questionTypes.find(t => t.value === question.type)?.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {question.points} points
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingQuestion(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm">{question.question || 'No question text'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || questions.length === 0}>
              {isCreating ? 'Creating...' : 'Create Quiz'}
            </Button>
          </div>
        </form>

        {/* Question Editor Modal */}
        {editingQuestion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <QuestionEditor
                question={editingQuestion}
                onSave={updateQuestion}
                onCancel={() => setEditingQuestion(null)}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuizBuilder;
