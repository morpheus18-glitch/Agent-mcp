import { hash } from "bcrypt";
import { query, transaction } from "@/lib/db";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

interface Options {
  email?: string;
  password?: string;
  fullName?: string;
  role?: string;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const opts: Options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, "");
    opts[key as keyof Options] = args[i + 1];
  }
  return opts;
}

async function createUser(opts: Options) {
  const { email, password, fullName, role = "user" } = opts;
  if (!email || !password) {
    console.error(
      "Usage: npm run create-user -- --email <email> --password <password> [--fullName <Full Name>] [--role <role>]"
    );
    process.exit(1);
  }

  console.log(`Checking if user ${email} exists...`);
  const existing = await query("SELECT 1 FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    console.log("User already exists.");
    return;
  }

  console.log("Creating user...");
  const hashed = await hash(password, 10);
  await transaction(async (client) => {
    const res = await client.query(
      "INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id",
      [email, hashed, fullName || email, role]
    );
    const userId = res.rows[0].id;
    await client.query("INSERT INTO user_profiles (user_id) VALUES ($1)", [userId]);
  });

  console.log(`User ${email} created with role ${role}.`);
}

createUser(parseArgs())
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error creating user:", err);
    process.exit(1);
  });
