import { api, APIError } from "encore.dev/api";
import { symptomDB } from "./db";

interface DeleteEntryRequest {
  id: string;
}

// Deletes a symptom entry.
export const deleteEntry = api<DeleteEntryRequest, void>(
  { expose: true, method: "DELETE", path: "/entries/:id" },
  async (req) => {
    const result = await symptomDB.queryRow`
      SELECT id FROM symptom_entries WHERE id = ${req.id}
    `;

    if (!result) {
      throw APIError.notFound("entry not found");
    }

    await symptomDB.exec`
      DELETE FROM symptom_entries WHERE id = ${req.id}
    `;
  }
);
