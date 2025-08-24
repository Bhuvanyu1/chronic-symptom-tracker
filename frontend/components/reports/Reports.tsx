import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { SymptomEntry, Pattern } from '~backend/symptom/types';
import ReportPreview from './ReportPreview';
import { FileText, Download, Calendar } from 'lucide-react';

export default function Reports() {
  const { user } = useUser();
  const { toast } = useToast();
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, dateRange]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const days = parseInt(dateRange);
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const [entriesResponse, patternsResponse] = await Promise.all([
        backend.symptom.getEntries({
          userId: user.id,
          startDate: startDateStr,
          endDate: endDate
        }),
        backend.symptom.getPatterns({
          userId: user.id,
          days: days
        })
      ]);

      setEntries(entriesResponse.entries);
      setPatterns(patternsResponse.patterns);
    } catch (error) {
      console.error('Failed to load report data:', error);
      toast({
        title: "Error",
        description: "Failed to load report data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = () => {
    if (!user || entries.length === 0) return;

    const averages = calculateAverages();
    const days = parseInt(dateRange);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Create CSV content
    let csvContent = 'Symptom Tracking Report\n';
    csvContent += `Patient: ${user.name}\n`;
    csvContent += `Report Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}\n`;
    csvContent += `Total Entries: ${entries.length}\n\n`;

    csvContent += 'Summary Statistics\n';
    csvContent += `Average Pain Level: ${averages.pain}/10\n`;
    csvContent += `Average Mood: ${averages.mood}/10\n`;
    csvContent += `Average Energy: ${averages.energy}/10\n`;
    csvContent += `Average Sleep Quality: ${averages.sleep}/10\n\n`;

    if (patterns.length > 0) {
      csvContent += 'Key Insights\n';
      patterns.forEach((pattern, index) => {
        const confidence = Math.round(pattern.confidence * 100);
        csvContent += `${index + 1}. ${pattern.description} (${confidence}% confidence)\n`;
      });
      csvContent += '\n';
    }

    csvContent += 'Daily Entries\n';
    csvContent += 'Date,Pain,Mood,Energy,Sleep,Triggers,Notes\n';
    
    entries.forEach((entry) => {
      const triggers = entry.triggers.join(';');
      const notes = (entry.notes || '').replace(/,/g, ';').replace(/\n/g, ' ');
      csvContent += `${entry.date},${entry.symptoms.pain},${entry.symptoms.mood},${entry.symptoms.energy},${entry.symptoms.sleep},"${triggers}","${notes}"\n`;
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `symptom-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Report generated",
      description: "Your symptom report has been downloaded as a CSV file."
    });
  };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and download your symptom tracking reports</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Generate Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Period
              </label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              disabled={loading || entries.length === 0}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Preview Report</span>
            </Button>
            
            <Button
              onClick={generateCSV}
              disabled={loading || entries.length === 0}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download CSV</span>
            </Button>
          </div>

          {entries.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No data available for the selected period.</p>
              <p className="text-sm">Start tracking your symptoms to generate reports.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showPreview && (
        <ReportPreview
          user={user!}
          entries={entries}
          patterns={patterns}
          dateRange={parseInt(dateRange)}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
