import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// The WebSocket-based Pool supports interactive transactions (needed for row locking when issuing stamps).
neonConfig.webSocketConstructor = ws;

const globalForDb = globalThis as unknown as { pool?: Pool };

// The pool connects lazily on first query, so builds work without DATABASE_URL.
// Idle clients are closed before Neon drops them, and the connect timeout allows for a Neon cold start.
const pool = (globalForDb.pool ??= createPool());

function createPool() {
  const p = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
  });
  // Neon may close an idle connection; log it instead of letting it throw. The pool reconnects on the next query.
  p.on("error", (err: Error) => console.warn("[db] idle client error:", err.message));
  return p;
}

export const db = drizzle({ client: pool, schema });
export { schema };
