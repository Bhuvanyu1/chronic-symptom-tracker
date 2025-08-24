import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, TrendingUp, Target, Award } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { SymptomEntry, Pattern } from '~backend/symptom/types';
import SymptomChart from './SymptomChart';
import PatternCard from './PatternCard';

export default function Dashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayEntry, setTodayEntry] = useState<SymptomEntry | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get last 30 days of entries
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const startDateStr = startDate.toISOString().split('T')[0];

      const [entriesResponse, patternsResponse] = await Promise.all([
        backend.symptom.getEntries({
          userId: user.id,
          startDate: startDateStr,
          endDate: endDate,
          limit: 30
        }),
        backend.symptom.getPatterns({
          userId: user.id,
          days: 30
        })
      ]);

      setEntries(entriesResponse.entries);
      setPatterns(patternsResponse.patterns);

      // Check if today's entry exists
      const today = new Date().toISOString().split('T')[0];
      const todayEntryExists = entriesResponse.entries.find(entry => entry.date === today);
      setTodayEntry(todayEntryExists || null);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasEntry = entries.some(entry => entry.date === dateStr);
      if (hasEntry) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const streak = calculateStreak();
  const averages = calculateAverages();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Here's your symptom tracking overview</p>
        </div>
        
        {!todayEntry && (
          <Link to="/checkin">
            <Button className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Today's Check-in</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-blue-600">{streak} days</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Pain</p>
                <p className="text-2xl font-bold text-red-600">{averages.pain}/10</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Mood</p>
                <p className="text-2xl font-bold text-green-600">{averages.mood}/10</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Energy</p>
                <p className="text-2xl font-bold text-yellow-600">{averages.energy}/10</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SymptomChart
          title="Pain Levels"
          data={entries}
          symptom="pain"
          color="#ef4444"
        />
        <SymptomChart
          title="Mood Levels"
          data={entries}
          symptom="mood"
          color="#10b981"
        />
        <SymptomChart
          title="Energy Levels"
          data={entries}
          symptom="energy"
          color="#f59e0b"
        />
        <SymptomChart
          title="Sleep Quality"
          data={entries}
          symptom="sleep"
          color="#3b82f6"
        />
      </div>

      {/* Patterns */}
      {patterns.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Insights & Patterns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patterns.slice(0, 4).map((pattern, index) => (
              <PatternCard key={index} pattern={pattern} />
            ))}
          </div>
        </div>
      )}

      {todayEntry && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-900">Today's check-in completed!</h3>
                <p className="text-sm text-green-700">
                  Pain: {todayEntry.symptoms.pain}/10, Mood: {todayEntry.symptoms.mood}/10, 
                  Energy: {todayEntry.symptoms.energy}/10, Sleep: {todayEntry.symptoms.sleep}/10
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
