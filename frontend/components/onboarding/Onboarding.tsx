import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '@/components/ui/use-toast';
import { Activity, User, Heart } from 'lucide-react';
import { COMMON_CONDITIONS, TIME_OPTIONS } from '../../utils/constants';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    conditions: [] as string[],
    checkInTime: '09:00'
  });
  const { createUser } = useUser();
  const { toast } = useToast();

  const handleConditionChange = (condition: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      conditions: checked
        ? [...prev.conditions, condition]
        : prev.conditions.filter(c => c !== condition)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue.",
        variant: "destructive"
      });
      return;
    }

    if (formData.conditions.length === 0) {
      toast({
        title: "Conditions required",
        description: "Please select at least one condition to track.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createUser(formData);
      toast({
        title: "Welcome!",
        description: "Your profile has been created successfully."
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      toast({
        title: "Error",
        description: "Failed to create your profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to SymptomTracker</CardTitle>
          <p className="text-gray-600">Let's set up your profile to start tracking your symptoms</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-blue-600 mb-4">
                <User className="h-5 w-5" />
                <span className="font-medium">Personal Information</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="checkInTime">Preferred Check-in Time</Label>
                <Select value={formData.checkInTime} onValueChange={(value) => setFormData(prev => ({ ...prev, checkInTime: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={() => setStep(2)} className="w-full">
                Next
              </Button>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-blue-600 mb-4">
                <Heart className="h-5 w-5" />
                <span className="font-medium">Conditions to Track</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Select the conditions you'd like to track. You can modify this later.
              </p>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {COMMON_CONDITIONS.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      checked={formData.conditions.includes(condition)}
                      onCheckedChange={(checked) => handleConditionChange(condition, checked as boolean)}
                    />
                    <Label htmlFor={condition} className="text-sm">{condition}</Label>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  Complete Setup
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
