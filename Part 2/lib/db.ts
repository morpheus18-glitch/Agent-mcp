import { Pool, type Client } from "pg"

// Create a connection pool for server-side operations
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    pool = new Pool({
      connectionString,
      max: 10,
      ssl: true,
    })
  }
  return pool
}

// For server components and API routes
export async function query(text: string, params?: any[]) {
  const client = await getPool().connect()
  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}

// Transaction function
export async function transaction(callback: (client: Client) => Promise<any>): Promise<any> {
  const client = await getPool().connect()
  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

// Close the pool (useful for tests and scripts)
export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
