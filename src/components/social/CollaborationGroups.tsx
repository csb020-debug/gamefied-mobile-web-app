import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CollaborationGroups: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collaboration Groups</CardTitle>
        <CardDescription>Collaboration features are temporarily disabled</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Collaboration functionality will be available once the collaboration tables are properly configured.
        </p>
      </CardContent>
    </Card>
  );
};

export default CollaborationGroups;