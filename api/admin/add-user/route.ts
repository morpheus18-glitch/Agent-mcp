import { NextResponse } from "next/server"
import { z } from "zod"
import { query, transaction } from "@/lib/db"
import { hash } from "bcrypt"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const schema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/),
  fullName: z.string().min(2),
  role: z.enum(["admin", "user"]).default("user"),
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
    const { email, password, fullName, role } = result.data
    const existing = await query("SELECT id FROM users WHERE email = $1", [email])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "User exists" }, { status: 400 })
    }
    const hashed = await hash(password, 10)
    const res = await transaction(async (client) => {
      const result = await client.query(
        "INSERT INTO users (email, password_hash, full_name, role) VALUES ($1,$2,$3,$4) RETURNING id",
        [email, hashed, fullName, role]
      )
      await client.query("INSERT INTO user_profiles (user_id) VALUES ($1)", [result.rows[0].id])
      return result.rows[0]
    })
    return NextResponse.json({ id: res.id })
  } catch (err) {
    console.error("add-user error", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
