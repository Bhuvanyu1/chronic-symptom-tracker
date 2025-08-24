import { SQLDatabase } from "encore.dev/storage/sqldb";

export const symptomDB = new SQLDatabase("symptom", {
  migrations: "./migrations",
});
