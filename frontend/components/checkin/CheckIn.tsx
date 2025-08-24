import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import SymptomSlider from './SymptomSlider';
import { Calendar, CheckCircle } from 'lucide-react';

const commonTriggers = [
  'Stress',
  'Weather',
  'Medication',
  'Exercise',
  'Sleep',
  'Diet',
  'Work',
  'Travel',
  'Hormones',
  'Social events'
];

export default function CheckIn() {
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    pain: 5,
    mood: 5,
    energy: 5,
    sleep: 5,
    notes: '',
    triggers: [] as string[]
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    checkExistingEntry();
  }, [user]);

  const checkExistingEntry = async () => {
    if (!user) return;

    try {
      const response = await backend.symptom.getEntries({
        userId: user.id,
        startDate: today,
        endDate: today,
        limit: 1
      });

      if (response.entries.length > 0) {
        const entry = response.entries[0];
        setFormData({
          pain: entry.symptoms.pain,
          mood: entry.symptoms.mood,
          energy: entry.symptoms.energy,
          sleep: entry.symptoms.sleep,
          notes: entry.notes || '',
          triggers: entry.triggers
        });
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Failed to check existing entry:', error);
    }
  };

  const handleSymptomChange = (symptom: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [symptom]: value
    }));
  };

  const handleTriggerChange = (trigger: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      triggers: checked
        ? [...prev.triggers, trigger]
        : prev.triggers.filter(t => t !== trigger)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await backend.symptom.createEntry({
        userId: user.id,
        date: today,
        symptoms: {
          pain: formData.pain,
          mood: formData.mood,
          energy: formData.energy,
          sleep: formData.sleep
        },
        notes: formData.notes.trim() || undefined,
        triggers: formData.triggers
      });

      setSubmitted(true);
      toast({
        title: "Check-in completed!",
        description: "Your symptoms have been recorded successfully."
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to submit check-in:', error);
      if (error.message?.includes('already exists')) {
        toast({
          title: "Already checked in",
          description: "You've already completed today's check-in.",
          variant: "destructive"
        });
        setSubmitted(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to submit check-in. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Check-in Complete!</h2>
            <p className="text-green-700 mb-6">
              Thank you for tracking your symptoms today. Your data helps us understand your patterns better.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-green-600">Pain</p>
                <p className="text-2xl font-bold text-green-900">{formData.pain}/10</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-green-600">Mood</p>
                <p className="text-2xl font-bold text-green-900">{formData.mood}/10</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-green-600">Energy</p>
                <p className="text-2xl font-bold text-green-900">{formData.energy}/10</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-green-600">Sleep</p>
                <p className="text-2xl font-bold text-green-900">{formData.sleep}/10</p>
              </div>
            </div>
            <Button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
              View Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-2xl">Daily Check-in</CardTitle>
              <p className="text-gray-600">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Symptom Sliders */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">How are you feeling today?</h3>
              
              <SymptomSlider
                label="Pain Level"
                value={formData.pain}
                onChange={(value) => handleSymptomChange('pain', value)}
                color="red"
                lowLabel="No pain"
                highLabel="Severe pain"
              />
              
              <SymptomSlider
                label="Mood"
                value={formData.mood}
                onChange={(value) => handleSymptomChange('mood', value)}
                color="green"
                lowLabel="Very low"
                highLabel="Excellent"
              />
              
              <SymptomSlider
                label="Energy Level"
                value={formData.energy}
                onChange={(value) => handleSymptomChange('energy', value)}
                color="yellow"
                lowLabel="Exhausted"
                highLabel="Very energetic"
              />
              
              <SymptomSlider
                label="Sleep Quality"
                value={formData.sleep}
                onChange={(value) => handleSymptomChange('sleep', value)}
                color="blue"
                lowLabel="Very poor"
                highLabel="Excellent"
              />
            </div>

            {/* Triggers */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Potential Triggers</h3>
              <p className="text-sm text-gray-600">
                Select any factors that might have influenced your symptoms today.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonTriggers.map((trigger) => (
                  <div key={trigger} className="flex items-center space-x-2">
                    <Checkbox
                      id={trigger}
                      checked={formData.triggers.includes(trigger)}
                      onCheckedChange={(checked) => handleTriggerChange(trigger, checked as boolean)}
                    />
                    <Label htmlFor={trigger} className="text-sm">{trigger}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional details about your day, symptoms, or observations..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-gray-500">
                {formData.notes.length}/500 characters
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Submitting...' : 'Complete Check-in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
