import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// neon-http (the simpler driver) has no db.transaction() support at all, and
// we rely on real transactions for the credit deduct/grant logic — the
// WebSocket-based Pool is required for that, hence the `ws` polyfill (Node
// has no native WebSocket global the way edge/browser runtimes do).
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export const db = drizzle(pool, { schema });
