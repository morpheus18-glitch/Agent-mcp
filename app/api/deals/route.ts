import { NextResponse } from "next/server"
import { listDeals, saveDeal } from "@/lib/deal-service"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get("storeId")
    if (!storeId) {
      return NextResponse.json({ error: "storeId query parameter is required" }, { status: 400 })
    }
    const customerId = searchParams.get("customerId") ?? undefined
    const deals = await listDeals({ storeId, customerId })
    return NextResponse.json(deals)
  } catch (error) {
    console.error("Failed to list deals", error)
    return NextResponse.json({ error: "Failed to list deals" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = await saveDeal(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to save deal", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to save deal" }, { status: 500 })
  }
}
