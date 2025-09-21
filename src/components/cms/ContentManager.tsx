import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ContentManagerProps {
  classId: string;
}

const ContentManager: React.FC<ContentManagerProps> = ({ classId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Manager</CardTitle>
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

export default ContentManager;