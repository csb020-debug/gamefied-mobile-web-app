import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Plus, 
  Pin, 
  Lock, 
  Users, 
  Calendar,
  Reply,
  Edit,
  Trash2,
  ThumbsUp,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Discussion {
  id: string;
  title: string;
  description: string;
  discussion_type: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  posts_count: number;
  last_activity: string;
}

interface DiscussionPost {
  id: string;
  content: string;
  author_id: string;
  author_type: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  parent_post_id?: string;
  replies_count: number;
  likes_count: number;
}

interface ClassDiscussionsProps {
  classId: string;
  className: string;
}

const ClassDiscussions: React.FC<ClassDiscussionsProps> = ({ classId, className }) => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchDiscussions();
  }, [classId]);

  useEffect(() => {
    if (selectedDiscussion) {
      fetchPosts(selectedDiscussion.id);
    }
  }, [selectedDiscussion]);

  const fetchDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          posts_count:discussion_posts(count),
          last_activity:discussion_posts(created_at)
        `)
        .eq('class_id', classId)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const processedDiscussions = (data || []).map((discussion: any) => ({
        ...discussion,
        posts_count: Number(discussion.posts_count?.[0]?.count ?? 0),
        last_activity: discussion.last_activity?.[0]?.created_at || discussion.created_at
      }));

      setDiscussions(processedDiscussions);
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

  const fetchPosts = async (discussionId: string) => {
    try {
      const { data, error } = await supabase
        .from('discussion_posts')
        .select(`
          *,
          replies_count:discussion_posts(count),
          likes_count:post_likes(count)
        `)
        .eq('discussion_id', discussionId)
        .is('parent_post_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const processedPosts = (data || []).map((post: any) => ({
        ...post,
        replies_count: Number(post.replies_count?.[0]?.count ?? 0),
        likes_count: Number(post.likes_count?.[0]?.count ?? 0)
      }));

      setPosts(processedPosts);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateDiscussion = async (formData: {
    title: string;
    description: string;
    discussion_type: string;
  }) => {
    try {
      const { error } = await supabase
        .from('discussions')
        .insert([{
          class_id: classId,
          created_by: user?.id,
          title: formData.title,
          description: formData.description,
          discussion_type: formData.discussion_type
        }]);

      if (error) throw error;

      toast({
        title: "Discussion created!",
        description: "Your discussion has been created successfully.",
      });

      fetchDiscussions();
      setShowCreateDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !selectedDiscussion) return;

    try {
      const { error } = await supabase
        .from('discussion_posts')
        .insert([{
          discussion_id: selectedDiscussion.id,
          author_id: user?.id,
          author_type: 'teacher', // This would be determined by user role
          content: newPost.trim(),
          parent_post_id: replyingTo || null
        }]);

      if (error) throw error;

      setNewPost('');
      setReplyingTo(null);
      fetchPosts(selectedDiscussion.id);
      fetchDiscussions();

      toast({
        title: "Post created!",
        description: "Your post has been added to the discussion.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getDiscussionTypeColor = (type: string) => {
    switch (type) {
      case 'general': return 'bg-blue-100 text-blue-800';
      case 'assignment': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      case 'announcement': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDiscussionIcon = (type: string) => {
    switch (type) {
      case 'general': return <MessageSquare className="h-4 w-4" />;
      case 'assignment': return <MessageSquare className="h-4 w-4" />;
      case 'project': return <Users className="h-4 w-4" />;
      case 'announcement': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Class Discussions</h2>
          <p className="text-muted-foreground">Engage with students through discussions</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Discussion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CreateDiscussionDialog
              onCreateDiscussion={handleCreateDiscussion}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {!selectedDiscussion ? (
        /* Discussions List */
        <div className="space-y-4">
          {discussions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start a discussion to engage with your students
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Discussion
                </Button>
              </CardContent>
            </Card>
          ) : (
            discussions.map((discussion) => (
              <Card 
                key={discussion.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedDiscussion(discussion)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {discussion.is_pinned && <Pin className="h-4 w-4 text-yellow-500" />}
                      {discussion.is_locked && <Lock className="h-4 w-4 text-red-500" />}
                      {getDiscussionIcon(discussion.discussion_type)}
                      <Badge className={getDiscussionTypeColor(discussion.discussion_type)}>
                        {discussion.discussion_type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(discussion.last_activity).toLocaleDateString()}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{discussion.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {discussion.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {discussion.posts_count} posts
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Discussion View */
        <div className="space-y-4">
          {/* Discussion Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDiscussion(null)}
                  >
                    ← Back
                  </Button>
                  {selectedDiscussion.is_pinned && <Pin className="h-4 w-4 text-yellow-500" />}
                  {selectedDiscussion.is_locked && <Lock className="h-4 w-4 text-red-500" />}
                  {getDiscussionIcon(selectedDiscussion.discussion_type)}
                  <Badge className={getDiscussionTypeColor(selectedDiscussion.discussion_type)}>
                    {selectedDiscussion.discussion_type}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(selectedDiscussion.updated_at).toLocaleDateString()}
                </div>
              </div>
              <CardTitle className="text-xl">{selectedDiscussion.title}</CardTitle>
              <CardDescription>{selectedDiscussion.description}</CardDescription>
            </CardHeader>
          </Card>

          {/* Posts */}
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {post.author_type === 'teacher' ? 'T' : 'S'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">
                          {post.author_type === 'teacher' ? 'Teacher' : 'Student'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleString()}
                        </span>
                        {post.is_edited && (
                          <Badge variant="outline" className="text-xs">Edited</Badge>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-line">{post.content}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <Button size="sm" variant="ghost">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {post.likes_count}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                        >
                          <Reply className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                        {post.replies_count > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {post.replies_count} replies
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* New Post Form */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {replyingTo && (
                  <div className="bg-muted p-2 rounded text-sm">
                    <span className="text-muted-foreground">Replying to post...</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyingTo(null)}
                      className="ml-2"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                <Textarea
                  placeholder="Write your post..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewPost('');
                      setReplyingTo(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                    Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Create Discussion Dialog Component
const CreateDiscussionDialog: React.FC<{
  onCreateDiscussion: (data: any) => void;
  onCancel: () => void;
}> = ({ onCreateDiscussion, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discussion_type: 'general'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onCreateDiscussion(formData);
  };

  return (
    <DialogHeader>
      <DialogTitle>Create New Discussion</DialogTitle>
      <DialogDescription>
        Start a new discussion topic for your class
      </DialogDescription>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Title *</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Discussion title..."
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what this discussion is about..."
            rows={3}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Type</label>
          <select
            value={formData.discussion_type}
            onChange={(e) => setFormData({ ...formData, discussion_type: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="general">General Discussion</option>
            <option value="assignment">Assignment Discussion</option>
            <option value="project">Project Discussion</option>
            <option value="announcement">Announcement</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Discussion</Button>
        </div>
      </form>
    </DialogHeader>
  );
};

export default ClassDiscussions;
