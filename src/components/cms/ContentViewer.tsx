import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Link, 
  Image, 
  Megaphone,
  Calendar,
  User,
  ExternalLink,
  Download
} from 'lucide-react';

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

interface ContentViewerProps {
  content: Content;
  onClose: () => void;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ content, onClose }) => {
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

  const renderContent = () => {
    switch (content.content_type) {
      case 'video':
        return (
          <div className="space-y-4">
            {content.content_data.video_url && (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Video Content</p>
                  <Button asChild>
                    <a href={content.content_data.video_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Watch Video
                    </a>
                  </Button>
                </div>
              </div>
            )}
            {content.content_data.duration && (
              <p className="text-sm text-muted-foreground">
                Duration: {content.content_data.duration} minutes
              </p>
            )}
          </div>
        );

      case 'document':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Document Ready</p>
              <p className="text-sm text-gray-600 mb-4">
                {content.content_data.document_type?.toUpperCase() || 'PDF'} Document
              </p>
              <div className="space-x-2">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
              </div>
            </div>
          </div>
        );

      case 'link':
        return (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start space-x-3">
                <Link className="h-5 w-5 text-blue-600 mt-1" />
                <div className="flex-1">
                  <a
                    href={content.content_data.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {content.content_data.link_url}
                  </a>
                  {content.content_data.link_description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {content.content_data.link_description}
                    </p>
                  )}
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href={content.content_data.link_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        );

      case 'lesson':
        return (
          <div className="space-y-6">
            {content.content_data.learning_objectives && (
              <div>
                <h3 className="font-semibold mb-2">Learning Objectives</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-line">
                    {content.content_data.learning_objectives}
                  </p>
                </div>
              </div>
            )}
            {content.content_data.lesson_content && (
              <div>
                <h3 className="font-semibold mb-2">Lesson Content</h3>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line">
                    {content.content_data.lesson_content}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 'announcement':
        return (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-l-4 ${
              content.content_data.priority === 'urgent' ? 'bg-red-50 border-red-500' :
              content.content_data.priority === 'high' ? 'bg-orange-50 border-orange-500' :
              content.content_data.priority === 'low' ? 'bg-blue-50 border-blue-500' :
              'bg-gray-50 border-gray-500'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <Megaphone className="h-5 w-5" />
                <span className="font-medium">
                  {content.content_data.priority === 'urgent' ? 'URGENT' :
                   content.content_data.priority === 'high' ? 'HIGH PRIORITY' :
                   content.content_data.priority === 'low' ? 'LOW PRIORITY' :
                   'ANNOUNCEMENT'}
                </span>
              </div>
              <p className="whitespace-pre-line">
                {content.content_data.announcement_content}
              </p>
            </div>
          </div>
        );

      case 'resource':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Resource Available</p>
              <p className="text-sm text-gray-600 mb-4">
                {content.content_data.resource_type || 'Resource File'}
              </p>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download Resource
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No content preview available</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {getContentIcon(content.content_type)}
          <div>
            <h2 className="text-2xl font-bold">{content.title}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getContentTypeColor(content.content_type)}>
                {content.content_type}
              </Badge>
              <Badge variant={content.is_published ? "default" : "outline"}>
                {content.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Description */}
      {content.description && (
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground">{content.description}</p>
        </div>
      )}

      {/* Categories */}
      {content.content_data.categories && content.content_data.categories.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {content.content_data.categories.map((category: string, index: number) => (
              <Badge key={index} variant="outline">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="border-t pt-6">
        {renderContent()}
      </div>

      {/* Metadata */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Created: {new Date(content.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Updated: {new Date(content.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentViewer;
