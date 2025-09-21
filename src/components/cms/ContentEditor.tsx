import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ContentEditorProps {
  classId: string;
  content?: any;
  onSave?: () => void;
  onCancel?: () => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ classId, content, onSave, onCancel }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Editor</CardTitle>
        <CardDescription>Content management is temporarily disabled</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Content management functionality will be available once the content tables are properly configured.
        </p>
      </CardContent>
    </Card>
  );
};

export default ContentEditor;