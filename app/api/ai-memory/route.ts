import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const result = await query("SELECT * FROM ai_memory WHERE user_id = $1 ORDER BY created_at DESC", [userId])

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching AI memory:", error)
    return NextResponse.json({ error: "Failed to fetch AI memory" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { user_id, content, context } = await req.json()

    const result = await query("INSERT INTO ai_memory (user_id, content, context) VALUES ($1, $2, $3) RETURNING *", [
      user_id,
      content,
      context,
    ])

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating AI memory:", error)
    return NextResponse.json({ error: "Failed to create AI memory" }, { status: 500 })
  }
}
