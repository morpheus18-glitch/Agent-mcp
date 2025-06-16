import { query, closePool } from "../lib/db";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function testConnection() {
  try {
    console.log("Testing database connection...");
    console.log(
      "Database URL:",
      process.env.DATABASE_URL ? "Set (hidden for security)" : "Not set",
    );

    // Test the connection
    const result = await query("SELECT NOW() as current_time");
    console.log("Connection successful!");
    console.log("Current database time:", result.rows[0].current_time);

    // Check if vector extension is available
    try {
      await query("SELECT * FROM pg_extension WHERE extname = 'vector'");
      console.log("Vector extension is installed.");
    } catch {
      console.warn("Vector extension is not installed or accessible.");
    }

    // List all tables
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("Available tables:");
    if (tables.rows.length === 0) {
      console.log("No tables found. You may need to run the setup-db script.");
    } else {
      tables.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name}`);
      });

      // Verify critical tables exist
      const requiredTables = ["users", "conversations"];
      const missingTables = requiredTables.filter(
        (name) => !tables.rows.some((row) => row.table_name === name),
      );
      if (missingTables.length > 0) {
        console.warn(
          `Warning: Missing required tables: ${missingTables.join(", ")}. You may need to run the setup-db script.`,
        );
      }
    }
  } catch (error) {
    console.error("Database connection test failed:", error);
  } finally {
    // Close the pool
    await closePool();
  }
}

// Run the test
testConnection()
  .then(() => {
    console.log("Test completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed with error:", error);
    process.exit(1);
  });
