import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PeerReviewSystem: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Peer Review System</CardTitle>
        <CardDescription>Peer reviews are temporarily disabled</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Peer review functionality will be available once the review tables are properly configured.
        </p>
      </CardContent>
    </Card>
  );
};

export default PeerReviewSystem;