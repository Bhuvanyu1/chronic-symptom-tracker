import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '@/components/ui/use-toast';
import { Settings as SettingsIcon, User, Bell, Trash2 } from 'lucide-react';

const commonConditions = [
  'Chronic Pain',
  'Fibromyalgia',
  'Arthritis',
  'Migraine',
  'Depression',
  'Anxiety',
  'Chronic Fatigue',
  'IBS',
  'Lupus',
  'Multiple Sclerosis',
  'Other'
];

export default function Settings() {
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    conditions: user?.conditions || [],
    checkInTime: user?.checkInTime || '09:00'
  });

  const handleConditionChange = (condition: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      conditions: checked
        ? [...prev.conditions, condition]
        : prev.conditions.filter(c => c !== condition)
    }));
  };

  const handleSave = async () => {
    // In a real app, this would update the user via API
    // For now, we'll just update the local state
    if (user) {
      const updatedUser = {
        ...user,
        name: formData.name,
        conditions: formData.conditions,
        checkInTime: formData.checkInTime
      };
      setUser(updatedUser);
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully."
      });
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      localStorage.clear();
      setUser(null);
      toast({
        title: "Data cleared",
        description: "All your data has been removed."
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your profile and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
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
                <SelectItem value="07:00">7:00 AM</SelectItem>
                <SelectItem value="08:00">8:00 AM</SelectItem>
                <SelectItem value="09:00">9:00 AM</SelectItem>
                <SelectItem value="10:00">10:00 AM</SelectItem>
                <SelectItem value="18:00">6:00 PM</SelectItem>
                <SelectItem value="19:00">7:00 PM</SelectItem>
                <SelectItem value="20:00">8:00 PM</SelectItem>
                <SelectItem value="21:00">9:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Conditions to Track</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonConditions.map((condition) => (
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
          </div>

          <Button onClick={handleSave}>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Check-in Reminders</p>
                <p className="text-sm text-gray-600">Get reminded to complete your daily symptom check-in</p>
              </div>
              <Checkbox />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Reports</p>
                <p className="text-sm text-gray-600">Receive weekly summaries of your symptom patterns</p>
              </div>
              <Checkbox />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-900">Clear All Data</p>
              <p className="text-sm text-gray-600 mb-3">
                This will permanently delete all your symptom entries, patterns, and profile information.
              </p>
              <Button variant="destructive" onClick={handleClearData}>
                Clear All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
