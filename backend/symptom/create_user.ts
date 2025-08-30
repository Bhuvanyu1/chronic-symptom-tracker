import { api, APIError } from "encore.dev/api";
import { symptomDB } from "./db";
import type { CreateUserRequest, User } from "./types";

// Creates a new user profile.
export const createUser = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/users" },
  async (req) => {
    if (!req.name?.trim()) {
      throw APIError.invalidArgument("name is required");
    }
    if (!Array.isArray(req.conditions) || req.conditions.length === 0) {
      throw APIError.invalidArgument("at least one condition must be selected");
    }
    if (!req.checkInTime?.trim()) {
      throw APIError.invalidArgument("checkInTime is required");
    }

    const id = crypto.randomUUID();
    const joinDate = new Date();

    // Ensure correct casting for Postgres array and timestamp types
    await symptomDB.rawExec(
      `INSERT INTO users (id, name, conditions, check_in_time, join_date)
       VALUES ($1, $2, $3::text[], $4, $5::timestamp)`,
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
      joinDate: joinDate.toISOString(),
    };
  }
);
