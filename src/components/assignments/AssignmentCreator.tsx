import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, GamepadIcon, BookOpen, Target, Leaf, Zap, Recycle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChallengeCreatorProps {
  classId: string;
  onChallengeCreated: () => void;
}

const ChallengeCreator: React.FC<ChallengeCreatorProps> = ({ classId, onChallengeCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'game' as 'game' | 'challenge' | 'quiz',
    dueDate: null as Date | null,
    points: 100,
    instructions: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    category: 'action' as 'action' | 'learning' | 'tracking' | 'lifestyle'
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.type) return;

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert([{
          class_id: classId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          type: formData.type,
          due_at: formData.dueDate?.toISOString() || null,
          config: {
            points: formData.points,
            instructions: formData.instructions.trim(),
            difficulty: formData.difficulty
          }
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Challenge created!",
        description: `${formData.title} has been added to your class.`,
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'game',
        dueDate: null,
        points: 100,
        instructions: '',
        difficulty: 'easy',
        category: 'action'
      });
      setIsOpen(false);
      onChallengeCreated();
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

  const challengeTypes = [
    {
      value: 'game',
      label: 'Interactive Game',
      description: 'Educational games and simulations',
      icon: <GamepadIcon className="h-4 w-4" />,
      color: 'text-blue-600'
    },
    {
      value: 'challenge',
      label: 'Real-world Challenge',
      description: 'Environmental action challenges',
      icon: <Target className="h-4 w-4" />,
      color: 'text-green-600'
    },
    {
      value: 'quiz',
      label: 'Knowledge Quiz',
      description: 'Multiple choice and written questions',
      icon: <BookOpen className="h-4 w-4" />,
      color: 'text-purple-600'
    }
  ];

  const challengeCategories = [
    {
      value: 'action',
      label: 'Action Challenge',
      description: 'Hands-on environmental actions',
      icon: <Leaf className="h-4 w-4" />,
      color: 'text-green-600'
    },
    {
      value: 'learning',
      label: 'Learning Activity',
      description: 'Educational content and lessons',
      icon: <BookOpen className="h-4 w-4" />,
      color: 'text-blue-600'
    },
    {
      value: 'tracking',
      label: 'Tracking Challenge',
      description: 'Monitor and record environmental data',
      icon: <Zap className="h-4 w-4" />,
      color: 'text-yellow-600'
    },
    {
      value: 'lifestyle',
      label: 'Lifestyle Change',
      description: 'Sustainable lifestyle modifications',
      icon: <Recycle className="h-4 w-4" />,
      color: 'text-purple-600'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription>
            Create an engaging assignment for your students to complete.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assignment Type */}
          <div className="space-y-3">
            <Label>Assignment Type</Label>
            <div className="grid grid-cols-1 gap-3">
              {challengeTypes.map((type) => (
                <div
                  key={type.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.type === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setFormData({ ...formData, type: type.value as any })}
                >
                  <div className="flex items-center space-x-3">
                    <div className={type.color}>{type.icon}</div>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Waste Sorting Challenge"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of what students will do..."
              rows={3}
            />
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Detailed instructions for students..."
              rows={4}
            />
          </div>

          {/* Points and Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="1"
                max="1000"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 100 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP") : "Select due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate || undefined}
                  onSelect={(date) => setFormData({ ...formData, dueDate: date || null })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Assignment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeCreator;
