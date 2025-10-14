import { NextResponse } from "next/server"
import { getDeal } from "@/lib/deal-service"

interface Params {
  params: { dealId: string }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const result = await getDeal(params.dealId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch deal", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to fetch deal" }, { status: 500 })
  }
}
