import { api, APIError } from "encore.dev/api";
import { symptomDB } from "./db";
import type { User } from "./types";

interface GetUserRequest {
  id: string;
}

// Retrieves a user by ID.
export const getUser = api<GetUserRequest, User>(
  { expose: true, method: "GET", path: "/users/:id" },
  async (req) => {
    const row = await symptomDB.queryRow<{
      id: string;
      name: string;
      conditions: string[];
      check_in_time: string;
      join_date: string;
    }>`
      SELECT id, name, conditions, check_in_time, join_date
      FROM users
      WHERE id = ${req.id}
    `;

    if (!row) {
      throw APIError.notFound("user not found");
    }

    return {
      id: row.id,
      name: row.name,
      conditions: row.conditions,
      checkInTime: row.check_in_time,
      joinDate: row.join_date,
    };
  }
);
