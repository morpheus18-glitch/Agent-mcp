/* eslint-disable @typescript-eslint/no-explicit-any */
import { neon } from "@neondatabase/serverless"

type Sql = any

let cachedSql: Sql | null = null

/**
 * Lazily create and return the Neon client. This avoids evaluating the
 * connection string at build time when environment variables might not be set.
 */
function getSqlClient(): Sql {
  if (!cachedSql) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    cachedSql = neon(url)
  }
  return cachedSql
}

// Provide a wrapper around the neon transaction API so callers receive an
// object with a `query` method. This matches how our scripts use the helper.
export async function transaction<T>(
  fn: (client: { query: Sql }) => Promise<T>,
): Promise<T> {
  const sql = getSqlClient()
  return sql.transaction((inner: any) => {
    const client = { query: inner }
    return fn(client)
  })
}

// Helper function to execute a query
export async function query(query: string, params: unknown[] = []): Promise<any> {
  try {
    const sql = getSqlClient()
    return await sql.query(query, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// In the serverless client there is no persistent pool, but we expose helpers
// for API compatibility with code that expects them.
export function getPool() {
  return getSqlClient()
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
  settings: Record<string, unknown>
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
  vector_data: Record<string, unknown>
  created_at: Date
}

export interface Role {
  id: string // UUID
  name: string
  description: string | null
  created_at: Date
}

export interface Permission {
  id: string // UUID
  name: string
  description: string | null
}

export interface MenuItem {
  id: string // UUID
  name: string
  path: string | null
  icon: string | null
  parent_id: string | null
  sort_order: number
  created_at: Date
  updated_at: Date
}

export interface Setting {
  id: string // UUID
  user_id: string | null
  key: string
  value: string
  created_at: Date
  updated_at: Date
}

export interface Configuration {
  key: string
  value: string
  updated_at: Date
}
