import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Link, 
  Image, 
  Megaphone,
  Search,
  Filter,
  ExternalLink,
  Download,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Content {
  id: string;
  title: string;
  description: string;
  content_type: string;
  content_data: any;
  file_url?: string;
  is_published: boolean;
  created_at: string;
}

interface StudentContentLibraryProps {
  classId: string;
  className: string;
}

const StudentContentLibrary: React.FC<StudentContentLibraryProps> = ({ classId, className }) => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [contentType, setContentType] = useState<string>('all');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, [classId]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('class_id', classId)
        .eq('is_published', true)
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
    const matchesType = contentType === 'all' || item.content_type === contentType;
    
    return matchesSearch && matchesType;
  });

  const renderContentPreview = (item: Content) => {
    switch (item.content_type) {
      case 'video':
        return (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Video Content</p>
              {item.content_data.video_url && (
                <Button asChild size="sm">
                  <a href={item.content_data.video_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Watch Video
                  </a>
                </Button>
              )}
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Document Ready</p>
            <p className="text-sm text-gray-600 mb-4">
              {item.content_data.document_type?.toUpperCase() || 'PDF'} Document
            </p>
            <div className="space-x-2">
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button size="sm" variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
            </div>
          </div>
        );

      case 'link':
        return (
          <div className="border rounded-lg p-4 bg-gray-50 mb-4">
            <div className="flex items-start space-x-3">
              <Link className="h-5 w-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <a
                  href={item.content_data.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {item.content_data.link_url}
                </a>
                {item.content_data.link_description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {item.content_data.link_description}
                  </p>
                )}
              </div>
              <Button size="sm" variant="outline" asChild>
                <a href={item.content_data.link_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        );

      case 'lesson':
        return (
          <div className="mb-4">
            {item.content_data.learning_objectives && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Learning Objectives</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm whitespace-pre-line">
                    {item.content_data.learning_objectives}
                  </p>
                </div>
              </div>
            )}
            {item.content_data.lesson_content && (
              <div>
                <h4 className="font-semibold mb-2">Lesson Content</h4>
                <div className="prose max-w-none text-sm">
                  <p className="whitespace-pre-line line-clamp-4">
                    {item.content_data.lesson_content}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 'announcement':
        return (
          <div className={`p-4 rounded-lg border-l-4 mb-4 ${
            item.content_data.priority === 'urgent' ? 'bg-red-50 border-red-500' :
            item.content_data.priority === 'high' ? 'bg-orange-50 border-orange-500' :
            item.content_data.priority === 'low' ? 'bg-blue-50 border-blue-500' :
            'bg-gray-50 border-gray-500'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <Megaphone className="h-5 w-5" />
              <span className="font-medium">
                {item.content_data.priority === 'urgent' ? 'URGENT' :
                 item.content_data.priority === 'high' ? 'HIGH PRIORITY' :
                 item.content_data.priority === 'low' ? 'LOW PRIORITY' :
                 'ANNOUNCEMENT'}
              </span>
            </div>
            <p className="whitespace-pre-line text-sm">
              {item.content_data.announcement_content}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

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
      <div>
        <h2 className="text-2xl font-bold">Content Library</h2>
        <p className="text-muted-foreground">Educational content for {className}</p>
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
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Types</option>
              <option value="lesson">Lessons</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
              <option value="resource">Resources</option>
              <option value="announcement">Announcements</option>
              <option value="link">Links</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                {getContentIcon(item.content_type)}
                <Badge className={getContentTypeColor(item.content_type)}>
                  {item.content_type}
                </Badge>
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {item.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {renderContentPreview(item)}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedContent(item)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No content found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || contentType !== 'all'
                ? 'Try adjusting your filters to see more content.'
                : 'No content has been published yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Content Detail Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getContentIcon(selectedContent.content_type)}
                  <div>
                    <h2 className="text-2xl font-bold">{selectedContent.title}</h2>
                    <Badge className={getContentTypeColor(selectedContent.content_type)}>
                      {selectedContent.content_type}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setSelectedContent(null)}>
                  Close
                </Button>
              </div>
              
              {selectedContent.description && (
                <p className="text-muted-foreground mb-6">{selectedContent.description}</p>
              )}

              {renderContentPreview(selectedContent)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentContentLibrary;
