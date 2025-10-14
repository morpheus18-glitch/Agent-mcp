import { NextResponse } from "next/server"
import { getDealDocumentBinary } from "@/lib/deal-service"

interface Params {
  params: { dealId: string; documentId: string }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const document = await getDealDocumentBinary(params.dealId, params.documentId)
    return new NextResponse(document.pdfData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${document.fileName}"`,
        "Content-Length": document.pdfData.length.toString(),
      },
    })
  } catch (error) {
    console.error("Failed to download deal document", error)
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }
}
