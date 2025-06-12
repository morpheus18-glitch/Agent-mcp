/**
 * This script sets up the LLM Sandbox application
 * It checks environment variables and sets up the database
 */

import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import readline from "readline"
import crypto from "crypto"

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Function to ask a question and get user input
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

// Function to generate a secure random string
function generateSecureString(length = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

// Main setup function
async function setup() {
  console.log("🚀 Setting up LLM Sandbox...")
  console.log("============================\n")

  // Check if .env.local exists
  const envFilePath = path.join(process.cwd(), ".env.local")
  const envFileExists = fs.existsSync(envFilePath)
  let createEnvFile = !envFileExists

  if (envFileExists) {
    const overwrite = await askQuestion("❓ .env.local already exists. Do you want to update it? (y/n): ")
    if (overwrite.toLowerCase() === "y") {
      createEnvFile = true
    }
  }

  if (createEnvFile) {
    console.log("\n📝 Setting up environment variables...")

    // Get NEXTAUTH_URL
    const defaultUrl = "http://localhost:3000"
    const nextAuthUrl = await askQuestion(`❓ Enter your NEXTAUTH_URL (default: ${defaultUrl}): `)

    // Generate NEXTAUTH_SECRET
    const nextAuthSecret = generateSecureString()
    console.log(`✅ Generated NEXTAUTH_SECRET: ${nextAuthSecret.substring(0, 8)}...`)

    // Get DATABASE_URL
    const defaultDbUrl = "postgres://user:password@hostname:port/database"
    const dbUrl = await askQuestion(`❓ Enter your DATABASE_URL (example: ${defaultDbUrl}): `)

    // Get GROQ_API_KEY
    const groqApiKey = await askQuestion("❓ Enter your GROQ_API_KEY: ")

    // Create .env.local file
    const envContent = `# NextAuth Configuration
NEXTAUTH_URL=${nextAuthUrl || defaultUrl}
NEXTAUTH_SECRET=${nextAuthSecret}

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=${dbUrl}

# LLM API Keys
GROQ_API_KEY=${groqApiKey}
NEXT_PUBLIC_GROQ_API_KEY=${groqApiKey}

# Vector Store (Upstash) - Optional
# UPSTASH_VECTOR_REST_URL=your-upstash-vector-url
# UPSTASH_VECTOR_REST_TOKEN=your-upstash-vector-token
`

    fs.writeFileSync(envFilePath, envContent)
    console.log("✅ Created .env.local file")
  }

  // Set up the database
  console.log("\n🗄️  Setting up the database...")
  try {
    execSync("pnpm run setup-db", { stdio: "inherit" })
    console.log("✅ Database setup completed")
  } catch (error) {
    console.error("❌ Database setup failed")
    console.error(error)
  }

  // Test the database connection
  console.log("\n🔍 Testing database connection...")
  try {
    execSync("pnpm run test-db", { stdio: "inherit" })
    console.log("✅ Database connection test completed")
  } catch (error) {
    console.error("❌ Database connection test failed")
    console.error(error)
  }

  // Create admin user
  console.log("\n👤 Creating admin user...")
  try {
    execSync("pnpm run seed-admin", { stdio: "inherit" })
    console.log("✅ Admin user created")
  } catch (error) {
    console.error("❌ Admin user creation failed")
    console.error(error)
  }

  console.log("\n🎉 Setup completed!")
  console.log("You can now run the application with: pnpm run dev")

  rl.close()
}

// Run the setup
setup().catch((error) => {
  console.error("❌ Setup failed:", error)
  rl.close()
  process.exit(1)
})
