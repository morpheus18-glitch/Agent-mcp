import { hash } from "bcryptjs"
import { query, transaction } from "@/lib/db"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

async function seedAdminUser() {
  try {
    console.log("Checking if admin user exists...")

    // Check if admin user already exists
    const existingAdmin = await query("SELECT * FROM users WHERE email = $1", ["admin@example.com"])

    if (existingAdmin.rows.length > 0) {
      console.log("Admin user already exists.")
      return
    }

    console.log("Creating admin user...")

    // Hash the password
    const hashedPassword = await hash("Admin123!", 10)

    // Create the admin user and profile in a transaction
    await transaction(async (client) => {
      // Insert the user
      const userResult = await client.query(
        "INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id",
        ["admin@example.com", hashedPassword, "Admin User", "admin"],
      )

      const userId = userResult.rows[0].id

      // Create the user profile
      await client.query("INSERT INTO user_profiles (user_id) VALUES ($1)", [userId])

      return { id: userId, email: "admin@example.com", fullName: "Admin User" }
    })

    console.log("Admin user created successfully!")
    console.log("Email: admin@example.com")
    console.log("Password: Admin123!")
    console.log("Please change this password after first login.")
  } catch (error: unknown) {
    console.error("Error seeding admin user:", error)
  }
}

// Run the seed function
seedAdminUser()
  .then(() => {
    console.log("Seed completed.")
    process.exit(0)
  })
  .catch((error: unknown) => {
    console.error("Seed failed:", error)
    process.exit(1)
  })
