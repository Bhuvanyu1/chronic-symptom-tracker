import { api, APIError } from "encore.dev/api";
import { symptomDB } from "./db";
import type { User } from "./types";

interface UpdateUserRequest {
  id: string;
  name: string;
  conditions: string[];
  checkInTime: string;
}

// Updates a user's profile information.
export const updateUser = api<UpdateUserRequest, User>(
  { expose: true, method: "PUT", path: "/users/:id" },
  async (req) => {
    // Check if user exists
    const existingUser = await symptomDB.queryRow`
      SELECT id, join_date FROM users WHERE id = ${req.id}
    `;

    if (!existingUser) {
      throw APIError.notFound("user not found");
    }

    // Convert conditions array to PostgreSQL array format
    const conditionsArray = `{${req.conditions.map(c => `"${c.replace(/"/g, '\\"')}"`).join(',')}}`;

    await symptomDB.exec`
      UPDATE users
      SET name = ${req.name}, conditions = ${conditionsArray}, check_in_time = ${req.checkInTime}
      WHERE id = ${req.id}
    `;

    return {
      id: req.id,
      name: req.name,
      conditions: req.conditions,
      checkInTime: req.checkInTime,
      joinDate: existingUser.join_date,
    };
  }
);
