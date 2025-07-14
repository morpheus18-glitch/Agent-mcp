import { NextResponse } from "next/server"
import { z } from "zod"
import { query } from "@/lib/db"
import { randomUUID } from "crypto"

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = schema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    const { email } = result.data
    const userRes = await query("SELECT id FROM users WHERE email = $1", [email])
    if (userRes.rows.length === 0) {
      // Always respond with success to prevent user enumeration
      return NextResponse.json({ message: "If that email exists, a reset link was sent." })
    }

    const token = randomUUID()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userRes.rows[0].id, token, expires]
    )

    console.log(`Password reset token for ${email}: ${token}`)

    return NextResponse.json({ message: "If that email exists, a reset link was sent." })
  } catch (err) {
    console.error("request-password-reset error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
