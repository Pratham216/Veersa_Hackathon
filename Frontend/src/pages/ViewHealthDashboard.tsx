import React, { useState } from 'react';
import HealthDashboard from '@/components/medical-history/HealthDashboard';
import HealthSummary from '@/components/medical-history/HealthSummary';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { healthMetrics } from '@/components/medical-history/healthMetricsData';
import { Activity, ChartBar, Lightbulb } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('metrics');
  const [selectedMetric, setSelectedMetric] = useState(healthMetrics[0]);

  const tabs = [
    { id: 'metrics', name: 'Metrics', icon: ChartBar },
    { id: 'recommendations', name: 'Recommendations', icon: Lightbulb }
  ];

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

      {/* Health Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Health Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Metric Selection */}
            <div className="flex gap-4 overflow-x-auto pb-4">
              {healthMetrics.map((metric) => (
                <button
                  key={metric.id}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    selectedMetric.id === metric.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {metric.name}
                </button>
              ))}
            </div>

            {/* Selected Metric Dashboard */}
            <HealthDashboard selectedMetric={selectedMetric} />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon
                className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                `}
                aria-hidden="true"
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'metrics' && (
          <div className="bg-white shadow rounded-lg p-6 w-full max-w-full overflow-x-auto">
            <HealthMetricsTimeline />
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Health Recommendations</h2>
            <div className="space-y-6">
              <HealthRecommendations recommendations={sampleRecommendations} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewHealthDashboard; 