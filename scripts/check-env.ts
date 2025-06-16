/**
 * This script checks if all required environment variables are set
 */

import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// Define required environment variables
const requiredEnvVars = [
  { name: "NEXTAUTH_URL", example: "http://localhost:3000" },
  { name: "NEXTAUTH_SECRET", example: "a-secure-random-string-min-32-chars" },
  {
    name: "DATABASE_URL",
    example: "postgres://user:password@hostname:port/database",
  },
  { name: "GROQ_API_KEY", example: "your-groq-api-key" },
];

// Add this function to validate URL format
function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// Check if all required environment variables are set
const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar.name],
);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingEnvVars.forEach((envVar) => {
    console.error(`   - ${envVar.name} (Example: ${envVar.example})`);
  });

  // Check if .env.local exists
  const envFilePath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envFilePath)) {
    console.error("\n❌ .env.local file not found!");
    console.error(
      "   Please create a .env.local file in the root directory with the required environment variables.",
    );

    // Create .env.local.example if it doesn't exist
    const exampleEnvFilePath = path.join(process.cwd(), ".env.local.example");
    if (!fs.existsSync(exampleEnvFilePath)) {
      const exampleEnvContent = requiredEnvVars
        .map((envVar) => `${envVar.name}=${envVar.example}`)
        .join("\n");

      fs.writeFileSync(exampleEnvFilePath, exampleEnvContent);
      console.error(
        `   An example file has been created at ${exampleEnvFilePath}`,
      );
    } else {
      console.error(`   You can use .env.local.example as a template.`);
    }
  } else {
    console.error(
      "\n❌ .env.local file exists but is missing required variables!",
    );
    console.error(
      "   Please update your .env.local file with the missing variables.",
    );
  }

  process.exit(1);
} else {
  console.log("✅ All required environment variables are set!");

  // Check if NEXTAUTH_SECRET is secure
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    console.warn(
      "⚠️  NEXTAUTH_SECRET is too short! It should be at least 32 characters long.",
    );
    console.warn("   Consider using a more secure secret.");
  }

  // Check if DATABASE_URL is valid
  if (
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.startsWith("postgres://")
  ) {
    console.warn(
      "⚠️  DATABASE_URL doesn't seem to be a valid PostgreSQL connection string.",
    );
    console.warn("   It should start with 'postgres://'.");
  }

  // In the part where you check environment variables, add this validation:
  if (process.env.NEXTAUTH_URL && !isValidUrl(process.env.NEXTAUTH_URL)) {
    console.error(
      `❌ NEXTAUTH_URL is not a valid URL: ${process.env.NEXTAUTH_URL}`,
    );
    console.error(
      "   It should be a complete URL including protocol, e.g., http://localhost:3000",
    );
    process.exit(1);
  }

  process.exit(0);
}
