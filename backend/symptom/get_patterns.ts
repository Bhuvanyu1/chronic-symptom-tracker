import { api } from "encore.dev/api";
import { symptomDB } from "./db";
import type { GetPatternsRequest, GetPatternsResponse, Pattern, SymptomEntry } from "./types";

// Analyzes patterns in symptom data for a user.
export const getPatterns = api<GetPatternsRequest, GetPatternsResponse>(
  { expose: true, method: "GET", path: "/patterns" },
  async (req) => {
    const days = req.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const rows = await symptomDB.queryAll<{
      pain: number;
      mood: number;
      energy: number;
      sleep: number;
      triggers: string[];
      date: string;
    }>`
      SELECT pain, mood, energy, sleep, triggers, date
      FROM symptom_entries
      WHERE user_id = ${req.userId} AND date >= ${startDate.toISOString().split('T')[0]}
      ORDER BY date ASC
    `;

    if (rows.length < 7) {
      return { patterns: [] };
    }

    const patterns: Pattern[] = [];

    // Analyze correlations
    const correlations = analyzeCorrelations(rows);
    patterns.push(...correlations);

    // Analyze trends
    const trends = analyzeTrends(rows);
    patterns.push(...trends);

    // Analyze triggers
    const triggerPatterns = analyzeTriggers(rows);
    patterns.push(...triggerPatterns);

    return { patterns };
  }
);

function analyzeCorrelations(entries: any[]): Pattern[] {
  const patterns: Pattern[] = [];

  // Pain-Mood correlation
  const painMoodCorr = calculateCorrelation(
    entries.map(e => e.pain),
    entries.map(e => e.mood)
  );

  if (Math.abs(painMoodCorr) > 0.5) {
    patterns.push({
      type: 'correlation',
      description: painMoodCorr < 0 
        ? 'Higher pain levels are associated with lower mood scores'
        : 'Higher pain levels are associated with higher mood scores',
      confidence: Math.abs(painMoodCorr),
      data: { correlation: painMoodCorr, symptoms: ['pain', 'mood'] }
    });
  }

  // Energy-Sleep correlation
  const energySleepCorr = calculateCorrelation(
    entries.map(e => e.energy),
    entries.map(e => e.sleep)
  );

  if (Math.abs(energySleepCorr) > 0.5) {
    patterns.push({
      type: 'correlation',
      description: energySleepCorr > 0
        ? 'Better sleep quality is associated with higher energy levels'
        : 'Better sleep quality is associated with lower energy levels',
      confidence: Math.abs(energySleepCorr),
      data: { correlation: energySleepCorr, symptoms: ['energy', 'sleep'] }
    });
  }

  return patterns;
}

function analyzeTrends(entries: any[]): Pattern[] {
  const patterns: Pattern[] = [];
  const symptoms = ['pain', 'mood', 'energy', 'sleep'];

  for (const symptom of symptoms) {
    const values = entries.map(e => e[symptom]);
    const trend = calculateTrend(values);

    if (Math.abs(trend) > 0.1) {
      patterns.push({
        type: 'trend',
        description: trend > 0
          ? `${symptom.charAt(0).toUpperCase() + symptom.slice(1)} levels have been increasing over time`
          : `${symptom.charAt(0).toUpperCase() + symptom.slice(1)} levels have been decreasing over time`,
        confidence: Math.min(Math.abs(trend) * 2, 1),
        data: { trend, symptom, values }
      });
    }
  }

  return patterns;
}

function analyzeTriggers(entries: any[]): Pattern[] {
  const patterns: Pattern[] = [];
  const triggerCounts: Record<string, { total: number; highPain: number; lowMood: number }> = {};

  entries.forEach(entry => {
    entry.triggers.forEach((trigger: string) => {
      if (!triggerCounts[trigger]) {
        triggerCounts[trigger] = { total: 0, highPain: 0, lowMood: 0 };
      }
      triggerCounts[trigger].total++;
      if (entry.pain >= 7) triggerCounts[trigger].highPain++;
      if (entry.mood <= 4) triggerCounts[trigger].lowMood++;
    });
  });

  Object.entries(triggerCounts).forEach(([trigger, counts]) => {
    if (counts.total >= 3) {
      const painRatio = counts.highPain / counts.total;
      const moodRatio = counts.lowMood / counts.total;

      if (painRatio > 0.6) {
        patterns.push({
          type: 'trigger',
          description: `${trigger} appears to be associated with higher pain levels`,
          confidence: painRatio,
          data: { trigger, metric: 'pain', ratio: painRatio, occurrences: counts.total }
        });
      }

      if (moodRatio > 0.6) {
        patterns.push({
          type: 'trigger',
          description: `${trigger} appears to be associated with lower mood`,
          confidence: moodRatio,
          data: { trigger, metric: 'mood', ratio: moodRatio, occurrences: counts.total }
        });
      }
    }
  });

  return patterns;
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

function calculateTrend(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;

  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope;
}
