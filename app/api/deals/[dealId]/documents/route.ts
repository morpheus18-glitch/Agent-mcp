import { NextResponse } from "next/server"
import { generateDealDocument } from "@/lib/deal-service"

interface Params {
  params: { dealId: string }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const body = await req.json()
    const document = await generateDealDocument(params.dealId, body)
    return NextResponse.json(document)
  } catch (error) {
    console.error("Failed to generate deal document", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to generate deal document" }, { status: 500 })
  }
}
