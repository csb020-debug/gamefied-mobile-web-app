import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Users, 
  Eye, 
  Edit, 
  CheckCircle,
  Clock,
  Target,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PeerReview {
  id: string;
  assignment_id: string;
  reviewer_id: string;
  reviewee_id: string;
  content: string;
  rating: number;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  reviewer_name: string;
  reviewee_name: string;
  is_edited?: boolean;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: string;
  created_at: string;
}

interface Student {
  id: string;
  nickname: string;
}

interface PeerReviewSystemProps {
  classId: string;
  className: string;
}

const PeerReviewSystem: React.FC<PeerReviewSystemProps> = ({ classId, className }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [reviews, setReviews] = useState<PeerReview[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
    fetchStudents();
  }, [classId]);

  useEffect(() => {
    if (selectedAssignment) {
      fetchReviews(selectedAssignment.id);
    }
  }, [selectedAssignment]);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('nickname');

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchReviews = async (assignmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('peer_reviews')
        .select(`
          *,
          reviewer:students!peer_reviews_reviewer_id_fkey(nickname),
          reviewee:students!peer_reviews_reviewee_id_fkey(nickname)
        `)
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedReviews = (data || []).map(review => ({
        ...review,
        reviewer_name: review.reviewer?.nickname || 'Unknown',
        reviewee_name: review.reviewee?.nickname || 'Unknown'
      }));

      setReviews(processedReviews);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateReview = async (formData: {
    reviewee_id: string;
    content: string;
    rating: number;
    is_anonymous: boolean;
  }) => {
    if (!selectedAssignment) return;

    try {
      const { error } = await supabase
        .from('peer_reviews')
        .insert([{
          assignment_id: selectedAssignment.id,
          reviewer_id: user?.id, // This would be the current student's ID
          reviewee_id: formData.reviewee_id,
          content: formData.content,
          rating: formData.rating,
          is_anonymous: formData.is_anonymous
        }]);

      if (error) throw error;

      toast({
        title: "Review submitted!",
        description: "Your peer review has been submitted successfully.",
      });

      fetchReviews(selectedAssignment.id);
      setShowCreateDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading peer reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Peer Review System</h2>
          <p className="text-muted-foreground">Enable students to review each other's work</p>
        </div>
        {selectedAssignment && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Star className="h-4 w-4 mr-2" />
                Submit Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CreateReviewDialog
                assignment={selectedAssignment}
                students={students}
                onSubmitReview={handleCreateReview}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!selectedAssignment ? (
        /* Assignments List */
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create assignments to enable peer reviews
                </p>
              </CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => (
              <Card 
                key={assignment.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedAssignment(assignment)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4" />
                      <Badge variant="outline">{assignment.type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(assignment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {assignment.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Click to view peer reviews</span>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Reviews for Selected Assignment */
        <div className="space-y-6">
          {/* Assignment Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAssignment(null)}
                  >
                    ← Back
                  </Button>
                  <Target className="h-5 w-5" />
                  <Badge variant="outline">{selectedAssignment.type}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(selectedAssignment.created_at).toLocaleDateString()}
                </div>
              </div>
              <CardTitle className="text-xl">{selectedAssignment.title}</CardTitle>
              <CardDescription>{selectedAssignment.description}</CardDescription>
            </CardHeader>
          </Card>

          {/* Reviews Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{reviews.length}</div>
                    <div className="text-sm text-muted-foreground">Total Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold">
                      {reviews.length > 0 
                        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                        : '0.0'
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{students.length}</div>
                    <div className="text-sm text-muted-foreground">Students</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews List */}
          <Card>
            <CardHeader>
              <CardTitle>Peer Reviews</CardTitle>
              <CardDescription>
                Reviews submitted by students for this assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Students haven't submitted any peer reviews for this assignment yet.
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Star className="h-4 w-4 mr-2" />
                      Submit First Review
                    </Button>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold">
                              {review.is_anonymous ? '?' : review.reviewer_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {review.is_anonymous ? 'Anonymous' : review.reviewer_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              reviewing {review.reviewee_name}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium">Rating:</span>
                          <div className="flex items-center space-x-1">
                            {getRatingStars(review.rating)}
                          </div>
                          <span className={`text-sm font-medium ${getRatingColor(review.rating)}`}>
                            {review.rating}/5
                          </span>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm whitespace-pre-line">{review.content}</p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-4">
                          <Button size="sm" variant="ghost">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Helpful
                          </Button>
                          <Button size="sm" variant="ghost">
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            Not Helpful
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {review.is_edited && 'Edited'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Create Review Dialog Component
const CreateReviewDialog: React.FC<{
  assignment: Assignment;
  students: Student[];
  onSubmitReview: (data: any) => void;
  onCancel: () => void;
}> = ({ assignment, students, onSubmitReview, onCancel }) => {
  const [formData, setFormData] = useState({
    reviewee_id: '',
    content: '',
    rating: 5,
    is_anonymous: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reviewee_id || !formData.content.trim()) return;
    onSubmitReview(formData);
  };

  return (
    <DialogHeader>
      <DialogTitle>Submit Peer Review</DialogTitle>
      <DialogDescription>
        Review a classmate's work for "{assignment.title}"
      </DialogDescription>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Reviewing *</label>
          <select
            value={formData.reviewee_id}
            onChange={(e) => setFormData({ ...formData, reviewee_id: e.target.value })}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select a student to review</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.nickname}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Rating *</label>
          <div className="flex items-center space-x-2 mt-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setFormData({ ...formData, rating })}
                className={`p-2 rounded ${
                  formData.rating >= rating
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Star className="h-5 w-5" />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {formData.rating}/5 stars
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Review Content *</label>
          <Textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Provide constructive feedback about the work..."
            rows={6}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="anonymous"
            checked={formData.is_anonymous}
            onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="anonymous" className="text-sm">
            Submit anonymously
          </label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Submit Review</Button>
        </div>
      </form>
    </DialogHeader>
  );
};

export default PeerReviewSystem;
