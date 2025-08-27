import { api, APIError } from "encore.dev/api";
import { symptomDB } from "./db";
import type { SymptomEntry } from "./types";

interface UpdateEntryRequest {
  id: string;
  symptoms: {
    pain: number;
    mood: number;
    energy: number;
    sleep: number;
  };
  notes?: string;
  triggers: string[];
}

// Updates an existing symptom entry.
export const updateEntry = api<UpdateEntryRequest, SymptomEntry>(
  { expose: true, method: "PUT", path: "/entries/:id" },
  async (req) => {
    // Validate symptom values
    const { pain, mood, energy, sleep } = req.symptoms;
    if (pain < 1 || pain > 10 || mood < 1 || mood > 10 || 
        energy < 1 || energy > 10 || sleep < 1 || sleep > 10) {
      throw APIError.invalidArgument("symptom values must be between 1 and 10");
    }

    // Check if entry exists
    const existingEntry = await symptomDB.queryRow<{
      id: string;
      user_id: string;
      date: string;
      timestamp: number;
    }>`
      SELECT id, user_id, date, timestamp
      FROM symptom_entries
      WHERE id = ${req.id}
    `;

    if (!existingEntry) {
      throw APIError.notFound("entry not found");
    }

    // Convert triggers array to PostgreSQL array format
    const triggersArray = `{${req.triggers.map(t => `"${t.replace(/"/g, '\\"')}"`).join(',')}}`;

    await symptomDB.exec`
      UPDATE symptom_entries
      SET pain = ${pain}, mood = ${mood}, energy = ${energy}, sleep = ${sleep},
          notes = ${req.notes || null}, triggers = ${triggersArray}
      WHERE id = ${req.id}
    `;

    return {
      id: existingEntry.id,
      userId: existingEntry.user_id,
      date: existingEntry.date,
      timestamp: existingEntry.timestamp,
      symptoms: req.symptoms,
      notes: req.notes,
      triggers: req.triggers,
      completed: true,
    };
  }
);
