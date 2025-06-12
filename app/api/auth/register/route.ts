import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"
import { query, transaction } from "@/lib/db"

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
  )

// User registration schema
const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate the request body
    const result = userSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 })
    }

    const { email, password, fullName } = result.data

    // Check if user already exists
    const existingUser = await query("SELECT * FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)

    // Create the user and profile in a transaction
    const user = await transaction(async (client) => {
      // Insert the user
      const userResult = await client.query(
        "INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id",
        [email, hashedPassword, fullName],
      )

      const userId = userResult.rows[0].id

      // Create the user profile
      await client.query("INSERT INTO user_profiles (user_id) VALUES ($1)", [userId])

      return { id: userId, email, fullName }
    })

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed", message: error.message }, { status: 500 })
  }
}
