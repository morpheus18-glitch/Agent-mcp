import { NextResponse } from "next/server"
import { z } from "zod"
import { query } from "@/lib/db"
import { hash } from "bcrypt"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const schema = z.object({
  userId: z.string().uuid(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const result = schema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { userId, password } = result.data
    const hashed = await hash(password, 10)
    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [hashed, userId])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("reset-user-password error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
