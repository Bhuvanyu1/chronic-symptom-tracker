export const SYMPTOM_COLORS = {
  pain: '#ef4444',
  mood: '#10b981',
  energy: '#f59e0b',
  sleep: '#3b82f6',
} as const;

export const SYMPTOM_LABELS = {
  pain: 'Pain Level',
  mood: 'Mood',
  energy: 'Energy Level',
  sleep: 'Sleep Quality',
} as const;

export const COMMON_TRIGGERS = [
  'Stress',
  'Weather',
  'Medication',
  'Exercise',
  'Sleep',
  'Diet',
  'Work',
  'Travel',
  'Hormones',
  'Social events',
] as const;

export const COMMON_CONDITIONS = [
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
  'Other',
] as const;

export const TIME_OPTIONS = [
  { value: '07:00', label: '7:00 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '21:00', label: '9:00 PM' },
] as const;

export const DATE_RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last year' },
] as const;

export const SYMPTOM_DESCRIPTIONS = {
  pain: {
    low: 'No pain',
    high: 'Severe pain',
  },
  mood: {
    low: 'Very low',
    high: 'Excellent',
  },
  energy: {
    low: 'Exhausted',
    high: 'Very energetic',
  },
  sleep: {
    low: 'Very poor',
    high: 'Excellent',
  },
} as const;
