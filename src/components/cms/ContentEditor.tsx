import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Link, 
  Image, 
  Megaphone,
  Upload,
  X,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ContentCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
}

interface Content {
  id: string;
  title: string;
  description: string;
  content_type: string;
  content_data: any;
  file_url?: string;
  is_published: boolean;
}

interface ContentEditorProps {
  classId: string;
  categories: ContentCategory[];
  content?: Content | null;
  onContentCreated: () => void;
  onCancel: () => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  classId,
  categories,
  content,
  onContentCreated,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    description: content?.description || '',
    content_type: content?.content_type || 'lesson',
    is_published: content?.is_published || false,
    content_data: content?.content_data || {}
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    content?.content_data?.categories || []
  );
  const [newCategory, setNewCategory] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const contentTypes = [
    {
      value: 'lesson',
      label: 'Lesson',
      description: 'Educational lesson content',
      icon: <BookOpen className="h-4 w-4" />,
      color: 'text-blue-600'
    },
    {
      value: 'video',
      label: 'Video',
      description: 'Video content or links',
      icon: <Video className="h-4 w-4" />,
      color: 'text-red-600'
    },
    {
      value: 'document',
      label: 'Document',
      description: 'PDF, Word, or other documents',
      icon: <FileText className="h-4 w-4" />,
      color: 'text-green-600'
    },
    {
      value: 'resource',
      label: 'Resource',
      description: 'Images, files, or other resources',
      icon: <Image className="h-4 w-4" />,
      color: 'text-yellow-600'
    },
    {
      value: 'announcement',
      label: 'Announcement',
      description: 'Important class announcements',
      icon: <Megaphone className="h-4 w-4" />,
      color: 'text-orange-600'
    },
    {
      value: 'link',
      label: 'External Link',
      description: 'Links to external resources',
      icon: <Link className="h-4 w-4" />,
      color: 'text-purple-600'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const contentData = {
        ...formData.content_data,
        categories: selectedCategories,
        tags: formData.content_data.tags || [],
        metadata: formData.content_data.metadata || {}
      };

      if (content) {
        // Update existing content
        const { error } = await supabase
          .from('content')
          .update({
            title: formData.title.trim(),
            description: formData.description.trim(),
            content_type: formData.content_type,
            content_data: contentData,
            is_published: formData.is_published,
            updated_at: new Date().toISOString()
          })
          .eq('id', content.id);

        if (error) throw error;

        toast({
          title: "Content updated!",
          description: "Your content has been successfully updated.",
        });
      } else {
        // Create new content
        const { error } = await supabase
          .from('content')
          .insert([{
            class_id: classId,
            teacher_id: (await supabase.auth.getUser()).data.user?.id,
            title: formData.title.trim(),
            description: formData.description.trim(),
            content_type: formData.content_type,
            content_data: contentData,
            is_published: formData.is_published
          }]);

        if (error) throw error;

        toast({
          title: "Content created!",
          description: "Your content has been successfully created.",
        });
      }

      onContentCreated();
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

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const { data, error } = await supabase
        .from('content_categories')
        .insert([{
          class_id: classId,
          name: newCategory.trim(),
          color: '#3B82F6'
        }])
        .select()
        .single();

      if (error) throw error;

      setNewCategory('');
      toast({
        title: "Category created!",
        description: "New category has been added.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const renderContentTypeEditor = () => {
    switch (formData.content_type) {
      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="video_url">Video URL</Label>
              <Input
                id="video_url"
                value={formData.content_data.video_url || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  content_data: {
                    ...formData.content_data,
                    video_url: e.target.value
                  }
                })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <Label htmlFor="video_duration">Duration (minutes)</Label>
              <Input
                id="video_duration"
                type="number"
                value={formData.content_data.duration || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  content_data: {
                    ...formData.content_data,
                    duration: parseInt(e.target.value) || 0
                  }
                })}
                placeholder="10"
              />
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="file_upload">Upload Document</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop your document here, or click to browse
                </p>
                <Button variant="outline" size="sm">
                  Choose File
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="document_type">Document Type</Label>
              <Select
                value={formData.content_data.document_type || 'pdf'}
                onValueChange={(value) => setFormData({
                  ...formData,
                  content_data: {
                    ...formData.content_data,
                    document_type: value
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">Word Document</SelectItem>
                  <SelectItem value="ppt">PowerPoint</SelectItem>
                  <SelectItem value="txt">Text File</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'link':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="link_url">URL</Label>
              <Input
                id="link_url"
                value={formData.content_data.link_url || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  content_data: {
                    ...formData.content_data,
                    link_url: e.target.value
                  }
                })}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="link_description">Link Description</Label>
              <Textarea
                id="link_description"
                value={formData.content_data.link_description || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  content_data: {
                    ...formData.content_data,
                    link_description: e.target.value
                  }
                })}
                placeholder="Brief description of what this link contains..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'lesson':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="lesson_content">Lesson Content</Label>
              <Textarea
                id="lesson_content"
                value={formData.content_data.lesson_content || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  content_data: {
                    ...formData.content_data,
                    lesson_content: e.target.value
                  }
                })}
                placeholder="Write your lesson content here..."
                rows={8}
              />
            </div>
            <div>
              <Label htmlFor="learning_objectives">Learning Objectives</Label>
              <Textarea
                id="learning_objectives"
                value={formData.content_data.learning_objectives || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  content_data: {
                    ...formData.content_data,
                    learning_objectives: e.target.value
                  }
                })}
                placeholder="What will students learn from this lesson?"
                rows={3}
              />
            </div>
          </div>
        );

      case 'announcement':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="announcement_content">Announcement Content</Label>
              <Textarea
                id="announcement_content"
                value={formData.content_data.announcement_content || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  content_data: {
                    ...formData.content_data,
                    announcement_content: e.target.value
                  }
                })}
                placeholder="Write your announcement here..."
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.content_data.priority || 'normal'}
                onValueChange={(value) => setFormData({
                  ...formData,
                  content_data: {
                    ...formData.content_data,
                    priority: value
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {content ? 'Edit Content' : 'Create New Content'}
        </h2>
        <p className="text-muted-foreground">
          {content ? 'Update your content details' : 'Add new educational content for your class'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Content Type */}
            <div className="space-y-3">
              <Label>Content Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {contentTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.content_type === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFormData({ ...formData, content_type: type.value })}
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
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter content title..."
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
                placeholder="Brief description of the content..."
                rows={3}
              />
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Create new category..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button type="button" onClick={handleCreateCategory} disabled={!newCategory.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            {renderContentTypeEditor()}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="publish">Publish immediately</Label>
                <p className="text-sm text-muted-foreground">
                  Make this content visible to students
                </p>
              </div>
              <Switch
                id="publish"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? 'Saving...' : (content ? 'Update Content' : 'Create Content')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContentEditor;
