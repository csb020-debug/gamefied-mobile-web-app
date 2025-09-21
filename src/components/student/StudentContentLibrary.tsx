import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const StudentContentLibrary: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Library</CardTitle>
        <CardDescription>Content library is temporarily disabled</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Content library functionality will be available once the content tables are properly configured.
        </p>
      </CardContent>
    </Card>
  );
};

export default StudentContentLibrary;