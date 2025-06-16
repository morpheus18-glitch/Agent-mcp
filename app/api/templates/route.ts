import { NextResponse } from "next/server";
import { searchTemplates } from "@/lib/template-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const q = searchParams.get("q") || undefined;
    const includePublic = searchParams.get("includePublic") !== "false";
    const tags = searchParams.getAll("tag");

    const { templates } = await searchTemplates({
      category,
      query: q,
      tags: tags.length > 0 ? tags : undefined,
      includePublic,
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}
