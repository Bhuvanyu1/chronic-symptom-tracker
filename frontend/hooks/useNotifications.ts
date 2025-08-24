import { useState, useEffect } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!supported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  };

  const sendNotification = (options: NotificationOptions): Notification | null => {
    if (!supported || permission !== 'granted') return null;

    try {
      return new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: false,
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  };

  const scheduleDaily = (time: string, callback: () => void) => {
    if (!supported || permission !== 'granted') return;

    const [hours, minutes] = time.split(':').map(Number);
    
    const scheduleNext = () => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const timeUntilNotification = scheduledTime.getTime() - now.getTime();

      setTimeout(() => {
        callback();
        // Schedule the next notification for tomorrow
        scheduleNext();
      }, timeUntilNotification);
    };

    scheduleNext();
  };

  const sendCheckInReminder = () => {
    return sendNotification({
      title: 'Daily Check-in Reminder',
      body: "Don't forget to track your symptoms today!",
      tag: 'daily-checkin',
    });
  };

  return {
    supported,
    permission,
    requestPermission,
    sendNotification,
    scheduleDaily,
    sendCheckInReminder,
  };
}
