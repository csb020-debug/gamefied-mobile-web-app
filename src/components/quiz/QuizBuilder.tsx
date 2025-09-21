import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const QuizBuilder: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Builder</CardTitle>
        <CardDescription>Quiz building is temporarily disabled</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Quiz building functionality will be available once the database schema is properly configured.
        </p>
      </CardContent>
    </Card>
  );
};

export default QuizBuilder;