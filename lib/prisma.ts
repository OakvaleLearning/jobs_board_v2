import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined;
};

// Prisma Postgres (db.prisma.io) closes idle server-side connections quickly.
// The pg pool can hand a query a socket the server already dropped, which
// surfaces as P1017 "Server has closed the connection" (ConnectionClosed).
// Pool tuning narrows the race but can't eliminate it, so we also retry.
function isConnectionClosed(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  if (code === "P1017") return true;
  const cause = (err as { cause?: unknown }).cause;
  const message = String((err as { message?: unknown }).message ?? "");
  return (
    /ConnectionClosed|Server has closed the connection|Connection terminated/i.test(
      message,
    ) || isConnectionClosed(cause)
  );
}

function createClient() {
  const adapter = new PrismaPg(
    {
      connectionString: process.env.DATABASE_URL,
      // Recycle idle connections client-side before the server drops them,
      // and keep sockets alive, to reduce the P1017 race window.
      idleTimeoutMillis: 5_000,
      keepAlive: true,
      // The Prisma Postgres DIRECT endpoint (db.prisma.io) caps at ~20
      // connections for the role. This pool is only one consumer — Prisma
      // Studio, `prisma migrate`, seeds, and every other running process each
      // open their own connections against the same cap, so a greedy pool here
      // causes P2037 "too many connections" the moment two of them overlap.
      // Keep this small (override with DB_POOL_MAX per environment) and release
      // idle sockets quickly so the cap is shared. For high-concurrency
      // production, front the app with a real pooler instead of the direct URL.
      max: Number(process.env.DB_POOL_MAX ?? 5),
      // Don't let a request queue forever when the cap is momentarily reached;
      // fail fast so it can be retried instead of piling up more waiters.
      connectionTimeoutMillis: 10_000,
    },
    {
      // Prevent a dropped background connection from becoming an
      // unhandled error that takes down the dev server.
      onPoolError: (err) => console.error("[prisma] pool error:", err.message),
      onConnectionError: (err) =>
        console.error("[prisma] connection error:", err.message),
    },
  );

  return new PrismaClient({ adapter }).$extends({
    query: {
      async $allOperations({ args, query }) {
        const maxAttempts = 3;
        for (let attempt = 1; ; attempt++) {
          try {
            return await query(args);
          } catch (err) {
            // Only retry a dead reused socket, and only up to the cap.
            // The retry checks out a fresh connection from the pool.
            if (attempt >= maxAttempts || !isConnectionClosed(err)) throw err;
            await new Promise((r) => setTimeout(r, 50 * attempt));
          }
        }
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
