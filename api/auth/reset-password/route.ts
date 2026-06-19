import { NextResponse } from "next/server"
import { z } from "zod"
import { query, transaction } from "@/lib/db"
import { hash } from "bcrypt"

const schema = z.object({
  token: z.string().uuid(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = schema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { token, password } = result.data
    const tokenRes = await query(
      "SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1",
      [token]
    )
    if (tokenRes.rows.length === 0) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }
    const { user_id, expires_at } = tokenRes.rows[0]
    if (new Date(expires_at) < new Date()) {
      await query("DELETE FROM password_reset_tokens WHERE token = $1", [token])
      return NextResponse.json({ error: "Token expired" }, { status: 400 })
    }

    const hashed = await hash(password, 10)
    await transaction(async (client) => {
      await client.query("UPDATE users SET password_hash = $1 WHERE id = $2", [hashed, user_id])
      await client.query("DELETE FROM password_reset_tokens WHERE token = $1", [token])
    })

    return NextResponse.json({ message: "Password updated" })
  } catch (err) {
    console.error("reset-password error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
