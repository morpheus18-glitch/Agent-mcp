import { neon } from "@neondatabase/serverless"

// Keep a reference to the client so scripts can reuse or close it
let client = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null

// Create a SQL client
export const sql = client!

// Helper function to execute a query
export async function query(query: string, params: any[] = []) {
  try {
    if (!client) {
      throw new Error("DATABASE_URL not set")
    }
    return await client.query(query, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Functions expected by scripts
export function getPool() {
  if (!client && process.env.DATABASE_URL) {
    client = neon(process.env.DATABASE_URL)
  }
  return client
}

export async function closePool() {
  // Neon serverless does not use persistent connections,
  // but we clear the reference for completeness.
  client = null
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
