import { api } from "encore.dev/api";
import { symptomDB } from "./db";
import type { CreateUserRequest, User } from "./types";

// Creates a new user profile.
export const createUser = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/users" },
  async (req) => {
    const id = crypto.randomUUID();
    const joinDate = new Date().toISOString();

    // Use rawExec with proper PostgreSQL array syntax
    await symptomDB.rawExec(
      `INSERT INTO users (id, name, conditions, check_in_time, join_date)
       VALUES ($1, $2, $3, $4, $5)`,
      id,
      req.name,
      req.conditions,
      req.checkInTime,
      joinDate
    );

    return {
      id,
      name: req.name,
      conditions: req.conditions,
      checkInTime: req.checkInTime,
      joinDate,
    };
  }
);
