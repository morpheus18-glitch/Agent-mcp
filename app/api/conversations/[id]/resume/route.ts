import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const conversationId = params.id;

    // Update the conversation status to active
    await query(
      `
      UPDATE conversations
      SET status = 'active', 
          updated_at = NOW()
      WHERE id = $1
    `,
      [conversationId],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resuming conversation:", error);
    return NextResponse.json(
      { error: "Failed to resume conversation" },
      { status: 500 },
    );
  }
}
