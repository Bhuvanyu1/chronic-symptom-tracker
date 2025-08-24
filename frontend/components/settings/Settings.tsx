import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '@/components/ui/use-toast';
import { useNotifications } from '../../hooks/useNotifications';
import { Settings as SettingsIcon, User, Bell, Trash2 } from 'lucide-react';
import { COMMON_CONDITIONS, TIME_OPTIONS } from '../../utils/constants';
import backend from '~backend/client';

export default function Settings() {
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const { supported, permission, requestPermission, scheduleDaily, sendCheckInReminder } = useNotifications();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    conditions: user?.conditions || [],
    checkInTime: user?.checkInTime || '09:00'
  });
  const [notificationSettings, setNotificationSettings] = useState({
    dailyReminders: false,
    weeklyReports: false,
  });
  const [saving, setSaving] = useState(false);

  const handleConditionChange = (condition: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      conditions: checked
        ? [...prev.conditions, condition]
        : prev.conditions.filter(c => c !== condition)
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const updatedUser = await backend.symptom.updateUser({
        id: user.id,
        name: formData.name,
        conditions: formData.conditions,
        checkInTime: formData.checkInTime
      });
      
      setUser(updatedUser);
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully."
      });
    } catch (error) {
      console.error('Failed to update user:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = async (type: 'dailyReminders' | 'weeklyReports', enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        toast({
          title: "Permission denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive"
        });
        return;
      }
    }

    setNotificationSettings(prev => ({ ...prev, [type]: enabled }));

    if (type === 'dailyReminders' && enabled) {
      scheduleDaily(formData.checkInTime, sendCheckInReminder);
      toast({
        title: "Notifications enabled",
        description: `You'll receive daily reminders at ${formData.checkInTime}.`
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

  const testNotification = () => {
    if (permission === 'granted') {
      sendCheckInReminder();
      toast({
        title: "Test notification sent",
        description: "Check if you received the notification."
      });
    } else {
      toast({
        title: "Notifications not enabled",
        description: "Please enable notifications first.",
        variant: "destructive"
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
                {TIME_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Conditions to Track</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
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
            {!supported && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Notifications are not supported in your browser.
                </p>
              </div>
            )}
            
            {supported && permission === 'denied' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  Notifications are blocked. Please enable them in your browser settings.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Check-in Reminders</p>
                <p className="text-sm text-gray-600">Get reminded to complete your daily symptom check-in</p>
              </div>
              <Checkbox
                checked={notificationSettings.dailyReminders}
                onCheckedChange={(checked) => handleNotificationToggle('dailyReminders', checked as boolean)}
                disabled={!supported}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Reports</p>
                <p className="text-sm text-gray-600">Receive weekly summaries of your symptom patterns</p>
              </div>
              <Checkbox
                checked={notificationSettings.weeklyReports}
                onCheckedChange={(checked) => handleNotificationToggle('weeklyReports', checked as boolean)}
                disabled={!supported}
              />
            </div>

            {supported && (
              <div className="pt-4 border-t">
                <Button variant="outline" onClick={testNotification} size="sm">
                  Test Notification
                </Button>
              </div>
            )}
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
