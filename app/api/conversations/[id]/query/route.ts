import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const conversationId = params.id;
    const { content } = await request.json();

    // First, save the query to the database
    const result = await query(
      `
      INSERT INTO conversation_messages (conversation_id, role, content)
      VALUES ($1, 'user', $2)
      RETURNING *
    `,
      [conversationId, content],
    );

    // Update the conversation's last_activity
    await query(
      `
      UPDATE conversations
      SET last_activity = NOW()
      WHERE id = $1
    `,
      [conversationId],
    );

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error processing query:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 },
    );
  }
}
