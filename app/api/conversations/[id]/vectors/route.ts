import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const conversationId = params.id;

    const vectors = await query(
      `
      SELECT * FROM conversation_vectors 
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `,
      [conversationId],
    );

    return NextResponse.json(vectors);
  } catch (error) {
    console.error("Error fetching conversation vectors:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation vectors" },
      { status: 500 },
    );
  }
}
