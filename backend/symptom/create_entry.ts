import { api, APIError } from "encore.dev/api";
import { symptomDB } from "./db";
import type { CreateEntryRequest, SymptomEntry } from "./types";

// Creates a new symptom entry for a user.
export const createEntry = api<CreateEntryRequest, SymptomEntry>(
  { expose: true, method: "POST", path: "/entries" },
  async (req) => {
    // Validate symptom values
    const { pain, mood, energy, sleep } = req.symptoms;
    if (pain < 1 || pain > 10 || mood < 1 || mood > 10 || 
        energy < 1 || energy > 10 || sleep < 1 || sleep > 10) {
      throw APIError.invalidArgument("symptom values must be between 1 and 10");
    }

    // Check if user exists
    const userExists = await symptomDB.queryRow`
      SELECT id FROM users WHERE id = ${req.userId}
    `;
    if (!userExists) {
      throw APIError.notFound("user not found");
    }

    const id = crypto.randomUUID();
    const timestamp = Date.now();

    // Convert triggers array to PostgreSQL array format
    const triggersArray = `{${req.triggers.map(t => `"${t.replace(/"/g, '\\"')}"`).join(',')}}`;

    try {
      await symptomDB.exec`
        INSERT INTO symptom_entries (
          id, user_id, date, timestamp, pain, mood, energy, sleep, notes, triggers
        ) VALUES (
          ${id}, ${req.userId}, ${req.date}, ${timestamp}, 
          ${pain}, ${mood}, ${energy}, ${sleep}, ${req.notes || null}, ${triggersArray}
        )
      `;
    } catch (err) {
      if (err instanceof Error && err.message.includes('unique constraint')) {
        throw APIError.alreadyExists("entry for this date already exists");
      }
      throw err;
    }

    return {
      id,
      userId: req.userId,
      date: req.date,
      timestamp,
      symptoms: req.symptoms,
      notes: req.notes,
      triggers: req.triggers,
      completed: true,
    };
  }
);
