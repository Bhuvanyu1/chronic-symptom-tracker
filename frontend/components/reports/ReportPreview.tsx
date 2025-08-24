import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, User, Calendar, TrendingUp } from 'lucide-react';
import type { User, SymptomEntry, Pattern } from '~backend/symptom/types';

interface ReportPreviewProps {
  user: User;
  entries: SymptomEntry[];
  patterns: Pattern[];
  dateRange: number;
  onClose: () => void;
}

export default function ReportPreview({ user, entries, patterns, dateRange, onClose }: ReportPreviewProps) {
  const calculateAverages = () => {
    if (entries.length === 0) return { pain: 0, mood: 0, energy: 0, sleep: 0 };
    
    const totals = entries.reduce((acc, entry) => ({
      pain: acc.pain + entry.symptoms.pain,
      mood: acc.mood + entry.symptoms.mood,
      energy: acc.energy + entry.symptoms.energy,
      sleep: acc.sleep + entry.symptoms.sleep,
    }), { pain: 0, mood: 0, energy: 0, sleep: 0 });

    return {
      pain: Math.round((totals.pain / entries.length) * 10) / 10,
      mood: Math.round((totals.mood / entries.length) * 10) / 10,
      energy: Math.round((totals.energy / entries.length) * 10) / 10,
      sleep: Math.round((totals.sleep / entries.length) * 10) / 10,
    };
  };

  const averages = calculateAverages();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - dateRange);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Report Preview</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center border-b pb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Symptom Tracking Report</h1>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Summary Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Average Pain</p>
                  <p className="text-2xl font-bold text-red-600">{averages.pain}/10</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Average Mood</p>
                  <p className="text-2xl font-bold text-green-600">{averages.mood}/10</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Average Energy</p>
                  <p className="text-2xl font-bold text-yellow-600">{averages.energy}/10</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Average Sleep</p>
                  <p className="text-2xl font-bold text-blue-600">{averages.sleep}/10</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Total Entries:</span> {entries.length}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Tracking Consistency:</span> {Math.round((entries.length / dateRange) * 100)}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Patterns */}
          {patterns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Insights & Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patterns.slice(0, 5).map((pattern, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-900 flex-1">{pattern.description}</p>
                        <span className="text-xs text-gray-500 ml-2">
                          {Math.round(pattern.confidence * 100)}% confidence
                        </span>
                      </div>
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded capitalize">
                        {pattern.type}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-center py-2">Pain</th>
                      <th className="text-center py-2">Mood</th>
                      <th className="text-center py-2">Energy</th>
                      <th className="text-center py-2">Sleep</th>
                      <th className="text-left py-2">Triggers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.slice(0, 10).map((entry) => (
                      <tr key={entry.id} className="border-b">
                        <td className="py-2">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="text-center py-2">{entry.symptoms.pain}/10</td>
                        <td className="text-center py-2">{entry.symptoms.mood}/10</td>
                        <td className="text-center py-2">{entry.symptoms.energy}/10</td>
                        <td className="text-center py-2">{entry.symptoms.sleep}/10</td>
                        <td className="py-2 text-xs">
                          {entry.triggers.length > 0 ? entry.triggers.join(', ') : 'None'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {entries.length > 10 && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing 10 of {entries.length} entries. Full data available in PDF download.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
