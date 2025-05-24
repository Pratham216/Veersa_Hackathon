import React from 'react';
import HealthSummary from '@/components/medical-history/HealthSummary';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HealthMetricsTimeline from '@/components/medical-history/HealthMetricsTimeline';
import HealthRecommendations from '@/components/medical-history/HealthRecommendations';

const sampleRecommendations = [
  {
    id: 1,
    title: 'Maintain Regular Exercise',
    description: 'Aim for at least 30 minutes of moderate activity daily.',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Monitor Blood Pressure',
    description: 'Check your blood pressure twice daily.',
    priority: 'medium'
  }
];

const ViewHealthDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Health Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <HealthSummary />
        </CardContent>
      </Card>

      {/* Health Metrics Timeline */}
      <Card>
        <CardContent>
          <HealthMetricsTimeline />
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Health Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <HealthRecommendations recommendations={sampleRecommendations} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewHealthDashboard;