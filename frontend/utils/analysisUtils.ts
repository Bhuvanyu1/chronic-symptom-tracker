import type { SymptomEntry } from '~backend/symptom/types';

export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

export function calculateSymptomAverages(entries: SymptomEntry[]) {
  if (entries.length === 0) {
    return { pain: 0, mood: 0, energy: 0, sleep: 0 };
  }

  const totals = entries.reduce(
    (acc, entry) => ({
      pain: acc.pain + entry.symptoms.pain,
      mood: acc.mood + entry.symptoms.mood,
      energy: acc.energy + entry.symptoms.energy,
      sleep: acc.sleep + entry.symptoms.sleep,
    }),
    { pain: 0, mood: 0, energy: 0, sleep: 0 }
  );

  return {
    pain: Math.round((totals.pain / entries.length) * 10) / 10,
    mood: Math.round((totals.mood / entries.length) * 10) / 10,
    energy: Math.round((totals.energy / entries.length) * 10) / 10,
    sleep: Math.round((totals.sleep / entries.length) * 10) / 10,
  };
}

export function calculateStreak(entries: SymptomEntry[]): number {
  if (entries.length === 0) return 0;

  // Sort entries by date (most recent first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) { // Check up to a year
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    const hasEntry = sortedEntries.some(entry => entry.date === dateStr);
    if (hasEntry) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getSymptomTrend(entries: SymptomEntry[], symptom: keyof SymptomEntry['symptoms']): 'improving' | 'worsening' | 'stable' {
  if (entries.length < 7) return 'stable';

  // Sort by date
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const values = sortedEntries.map(entry => entry.symptoms[symptom]);
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = calculateAverage(firstHalf);
  const secondAvg = calculateAverage(secondHalf);

  const difference = secondAvg - firstAvg;

  // For pain, lower is better; for mood/energy/sleep, higher is better
  if (symptom === 'pain') {
    if (difference < -0.5) return 'improving';
    if (difference > 0.5) return 'worsening';
  } else {
    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'worsening';
  }

  return 'stable';
}

export function getMostCommonTriggers(entries: SymptomEntry[], limit: number = 5): Array<{ trigger: string; count: number }> {
  const triggerCounts: Record<string, number> = {};

  entries.forEach(entry => {
    entry.triggers.forEach(trigger => {
      triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    });
  });

  return Object.entries(triggerCounts)
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getWorstDays(entries: SymptomEntry[], limit: number = 5): SymptomEntry[] {
  return [...entries]
    .sort((a, b) => {
      const scoreA = a.symptoms.pain + (10 - a.symptoms.mood) + (10 - a.symptoms.energy) + (10 - a.symptoms.sleep);
      const scoreB = b.symptoms.pain + (10 - b.symptoms.mood) + (10 - b.symptoms.energy) + (10 - b.symptoms.sleep);
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

export function getBestDays(entries: SymptomEntry[], limit: number = 5): SymptomEntry[] {
  return [...entries]
    .sort((a, b) => {
      const scoreA = (10 - a.symptoms.pain) + a.symptoms.mood + a.symptoms.energy + a.symptoms.sleep;
      const scoreB = (10 - b.symptoms.pain) + b.symptoms.mood + b.symptoms.energy + b.symptoms.sleep;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}
