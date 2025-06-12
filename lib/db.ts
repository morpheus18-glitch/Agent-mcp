import { neon } from "@neondatabase/serverless"
import type { NeonQueryFunction } from "@neondatabase/serverless"

// Create a SQL client
export const sql = neon(process.env.DATABASE_URL!)

// Provide a wrapper around the neon transaction API so callers receive an
// object with a `query` method. This matches how our scripts use the helper.
export async function transaction<T>(
  fn: (client: { query: NeonQueryFunction }) => Promise<T>,
): Promise<T> {
  return sql.transaction((inner) => {
    const client = { query: inner }
    return fn(client)
  })
}

// Helper function to execute a query
export async function query(query: string, params: any[] = []) {
  try {
    return await sql(query, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// In the serverless client there is no persistent pool, but we expose helpers
// for API compatibility with code that expects them.
export function getPool() {
  return sql
}

export async function closePool() {
  // noop for serverless driver
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
