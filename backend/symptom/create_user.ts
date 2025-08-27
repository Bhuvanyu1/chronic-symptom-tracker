import { api } from "encore.dev/api";
import { symptomDB } from "./db";
import type { CreateUserRequest, User } from "./types";

// Creates a new user profile.
export const createUser = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/users" },
  async (req) => {
    const id = crypto.randomUUID();
    const joinDate = new Date().toISOString();

    // Convert conditions array to PostgreSQL array format
    const conditionsArray = `{${req.conditions.map(c => `"${c.replace(/"/g, '\\"')}"`).join(',')}}`;

    await symptomDB.exec`
      INSERT INTO users (id, name, conditions, check_in_time, join_date)
      VALUES (${id}, ${req.name}, ${conditionsArray}, ${req.checkInTime}, ${joinDate})
    `;

    return {
      id,
      name: req.name,
      conditions: req.conditions,
      checkInTime: req.checkInTime,
      joinDate,
    };
  }
);
