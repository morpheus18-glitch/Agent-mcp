import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const conversationId = params.id;

    // Get the latest messages for this conversation
    const messages = await query(
      `
      SELECT * FROM conversation_messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `,
      [conversationId],
    );

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error streaming conversation:", error);
    return NextResponse.json(
      { error: "Failed to stream conversation" },
      { status: 500 },
    );
  }
}
