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
