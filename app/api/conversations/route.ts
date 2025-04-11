import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const conversations = await query(`
      SELECT * FROM conversations 
      ORDER BY created_at DESC
    `)

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, template_id, agent_id, settings } = body

    const result = await query(
      `
      INSERT INTO conversations (title, template_id, agent_id, settings)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [title, template_id, agent_id, JSON.stringify(settings)],
    )

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
