import { neon } from "@neondatabase/serverless"

// Create a SQL client
export const sql = neon(process.env.DATABASE_URL!)

// Helper function to execute a query
export async function query(query: string, params: any[] = []) {
  try {
    return await sql(query, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
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
