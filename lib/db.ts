import { Pool, PoolClient } from "pg"

let pool: Pool | null = null

// Return a singleton PG pool
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  }
  return pool
}

// Close and reset the pool
export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// Helper function to execute a query
export async function query(text: string, params: any[] = []) {
  try {
    return await getPool().query(text, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Run a callback inside a transaction
export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query("BEGIN")
    const result = await fn(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

// Type definitions for our database models
export interface Conversation {
  id: string // UUID
  title: string
  template_id: number | null
  agent_id: number | null
  status: string
  settings: Record<string, any>
  created_at: Date
  updated_at: Date
  last_activity: Date
}

export interface ConversationMessage {
  id: string // UUID
  conversation_id: string // UUID
  role: string
  content: string
  created_at: Date
}

export interface ConversationVector {
  id: string // UUID
  conversation_id: string // UUID
  vector_data: Record<string, any>
  created_at: Date
}
