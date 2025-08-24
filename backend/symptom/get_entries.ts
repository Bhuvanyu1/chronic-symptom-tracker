import { api } from "encore.dev/api";
import { symptomDB } from "./db";
import type { GetEntriesRequest, GetEntriesResponse, SymptomEntry } from "./types";

// Retrieves symptom entries for a user within a date range.
export const getEntries = api<GetEntriesRequest, GetEntriesResponse>(
  { expose: true, method: "GET", path: "/entries" },
  async (req) => {
    let query = `
      SELECT id, user_id, date, timestamp, pain, mood, energy, sleep, notes, triggers, completed
      FROM symptom_entries
      WHERE user_id = $1
    `;
    const params: any[] = [req.userId];
    let paramIndex = 2;

    if (req.startDate) {
      query += ` AND date >= $${paramIndex}`;
      params.push(req.startDate);
      paramIndex++;
    }

    if (req.endDate) {
      query += ` AND date <= $${paramIndex}`;
      params.push(req.endDate);
      paramIndex++;
    }

    query += ` ORDER BY date DESC`;

    if (req.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(req.limit);
    }

    const rows = await symptomDB.rawQueryAll<{
      id: string;
      user_id: string;
      date: string;
      timestamp: number;
      pain: number;
      mood: number;
      energy: number;
      sleep: number;
      notes: string | null;
      triggers: string[];
      completed: boolean;
    }>(query, ...params);

    const entries: SymptomEntry[] = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      date: row.date,
      timestamp: row.timestamp,
      symptoms: {
        pain: row.pain,
        mood: row.mood,
        energy: row.energy,
        sleep: row.sleep,
      },
      notes: row.notes || undefined,
      triggers: row.triggers,
      completed: row.completed,
    }));

    return { entries };
  }
);
