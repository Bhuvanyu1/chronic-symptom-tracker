import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SymptomEntry } from '~backend/symptom/types';

interface SymptomChartProps {
  title: string;
  data: SymptomEntry[];
  symptom: 'pain' | 'mood' | 'energy' | 'sleep';
  color: string;
}

export default function SymptomChart({ title, data, symptom, color }: SymptomChartProps) {
  const chartData = data
    .slice()
    .reverse()
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: entry.symptoms[symptom],
      fullDate: entry.date
    }));

  const getColorByValue = (value: number) => {
    if (value <= 3) return '#ef4444'; // red
    if (value <= 6) return '#f59e0b'; // yellow
    return '#10b981'; // green
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={[1, 10]}
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [value, title]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {chartData.length === 0 && (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>No data available. Start tracking to see your progress!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
