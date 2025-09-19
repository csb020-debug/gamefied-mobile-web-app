import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  FileText, 
  Video, 
  Link, 
  Image, 
  BookOpen, 
  Megaphone,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Folder,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ContentEditor from './ContentEditor';
import ContentViewer from './ContentViewer';

interface Content {
  id: string;
  title: string;
  description: string;
  content_type: string;
  content_data: any;
  file_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface ContentCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
}

interface ContentManagerProps {
  classId: string;
  className: string;
}

const ContentManager: React.FC<ContentManagerProps> = ({ classId, className }) => {
  const [content, setContent] = useState<Content[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [contentType, setContentType] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [viewingContent, setViewingContent] = useState<Content | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
    fetchCategories();
  }, [classId]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
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

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('content_categories')
        .select('*')
        .eq('class_id', classId)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Content deleted",
        description: "The content has been successfully deleted.",
      });

      fetchContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async (contentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('content')
        .update({ is_published: !currentStatus })
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Content unpublished" : "Content published",
        description: currentStatus 
          ? "The content is now hidden from students." 
          : "The content is now visible to students.",
      });

      fetchContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'link': return <Link className="h-5 w-5" />;
      case 'resource': return <Image className="h-5 w-5" />;
      case 'announcement': return <Megaphone className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-red-100 text-red-800';
      case 'document': return 'bg-green-100 text-green-800';
      case 'link': return 'bg-purple-100 text-purple-800';
      case 'resource': return 'bg-yellow-100 text-yellow-800';
      case 'announcement': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           item.content_data?.categories?.includes(selectedCategory);
    const matchesType = contentType === 'all' || item.content_type === contentType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">Manage educational content for {className}</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <ContentEditor
              classId={classId}
              categories={categories}
              onContentCreated={() => {
                fetchContent();
                setShowCreateDialog(false);
              }}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lesson">Lessons</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="resource">Resources</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="link">Links</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getContentIcon(item.content_type)}
                  <Badge className={getContentTypeColor(item.content_type)}>
                    {item.content_type}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewingContent(item)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingContent(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteContent(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {item.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {item.is_published ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Eye className="h-3 w-3 mr-1" />
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Draft
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTogglePublish(item.id, item.is_published)}
                  className="w-full"
                >
                  {item.is_published ? 'Unpublish' : 'Publish'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No content found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all' || contentType !== 'all'
                ? 'Try adjusting your filters to see more content.'
                : 'Create your first piece of content to get started.'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Content
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Content Dialog */}
      {editingContent && (
        <Dialog open={!!editingContent} onOpenChange={() => setEditingContent(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <ContentEditor
              classId={classId}
              categories={categories}
              content={editingContent}
              onContentCreated={() => {
                fetchContent();
                setEditingContent(null);
              }}
              onCancel={() => setEditingContent(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Content Dialog */}
      {viewingContent && (
        <Dialog open={!!viewingContent} onOpenChange={() => setViewingContent(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <ContentViewer
              content={viewingContent}
              onClose={() => setViewingContent(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContentManager;
