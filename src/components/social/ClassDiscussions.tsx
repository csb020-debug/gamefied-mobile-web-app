import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ClassDiscussions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Discussions</CardTitle>
        <CardDescription>Discussions are temporarily disabled</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Discussion functionality will be available once the discussion tables are properly configured.
        </p>
      </CardContent>
    </Card>
  );
};

export default ClassDiscussions;