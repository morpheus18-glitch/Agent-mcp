import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query("SELECT * FROM system_metrics ORDER BY timestamp DESC LIMIT 100")

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching metrics:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { metric_name, metric_value } = await req.json()

    const result = await query("INSERT INTO system_metrics (metric_name, metric_value) VALUES ($1, $2) RETURNING *", [
      metric_name,
      metric_value,
    ])

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error creating metric:", error)
    return NextResponse.json({ error: "Failed to create metric" }, { status: 500 })
  }
}
