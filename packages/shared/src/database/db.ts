import { sql } from "bun";

export const db = sql(process.env.DATABASE_URL!);