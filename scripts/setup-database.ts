import { query, closePool } from "../lib/db";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function setupDatabase() {
  console.log("🚀 Setting up database...");

  try {
    // Test connection
    const result = await query("SELECT NOW() as current_time");
    console.log(`✅ Connected to database at ${result.rows[0].current_time}`);

    // Enable pgvector extension if available
    try {
      await query("CREATE EXTENSION IF NOT EXISTS vector;");
      console.log("✅ Vector extension enabled successfully.");
    } catch (error) {
      console.warn(
        "⚠️ Warning: Could not enable vector extension. Some features may not work:",
        error.message,
      );
      console.warn(
        "You may need to enable the vector extension in your Neon dashboard.",
      );
    }

    // Create tables
    console.log("\n📊 Creating tables...");

    // Users Table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE
      );
    `);
    console.log("✅ Users table created.");

    // User Profiles Table
    await query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        avatar_url VARCHAR(255),
        bio TEXT,
        preferences JSONB DEFAULT '{}'::jsonb
      );
    `);
    console.log("✅ User profiles table created.");

    // Agents Table
    await query(`
      CREATE TABLE IF NOT EXISTS agents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        instructions TEXT NOT NULL,
        color VARCHAR(50) NOT NULL,
        role VARCHAR(255),
        created_by UUID REFERENCES users(id),
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Agents table created.");

    // Conversations Table
    await query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        topic VARCHAR(255) NOT NULL,
        objective TEXT NOT NULL,
        system_prompt TEXT,
        created_by UUID REFERENCES users(id),
        is_public BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        settings JSONB DEFAULT '{}'::jsonb
      );
    `);
    console.log("✅ Conversations table created.");

    // Conversation Agents Table
    await query(`
      CREATE TABLE IF NOT EXISTS conversation_agents (
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        left_at TIMESTAMP WITH TIME ZONE,
        PRIMARY KEY (conversation_id, agent_id)
      );
    `);
    console.log("✅ Conversation agents table created.");

    // Messages Table
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        agent_id UUID REFERENCES agents(id),
        content TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        thinking TEXT,
        metadata JSONB DEFAULT '{}'::jsonb
      );
    `);
    console.log("✅ Messages table created.");

    // Try to create vector-dependent tables
    try {
      // Message Embeddings Table (requires vector extension)
      await query(`
        CREATE TABLE IF NOT EXISTS message_embeddings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
          embedding vector(1536) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Message embeddings table created.");

      // Create vector indexes
      await query(`
        CREATE INDEX IF NOT EXISTS idx_message_embeddings_vector ON message_embeddings USING ivfflat (embedding vector_cosine_ops);
      `);
      console.log("✅ Vector indexes created.");
    } catch (error) {
      console.warn(
        "⚠️ Warning: Could not create vector-dependent tables:",
        error.message,
      );
      console.warn("Creating alternative tables without vector support...");

      // Create alternative tables without vector support
      await query(`
        CREATE TABLE IF NOT EXISTS message_embeddings_simple (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
          embedding_json JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ Alternative tables without vector support created.");
    }

    // Templates Table
    await query(`
      CREATE TABLE IF NOT EXISTS templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        content JSONB NOT NULL,
        tags TEXT[],
        created_by UUID REFERENCES users(id),
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Templates table created.");

    // Agent Templates Table
    await query(`
      CREATE TABLE IF NOT EXISTS agent_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        config JSONB NOT NULL,
        created_by UUID REFERENCES users(id),
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Agent templates table created.");

    // Conversation Tags Table
    await query(`
      CREATE TABLE IF NOT EXISTS conversation_tags (
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        tag VARCHAR(100) NOT NULL,
        PRIMARY KEY (conversation_id, tag)
      );
    `);
    console.log("✅ Conversation tags table created.");

    // Conversation Analysis Table
    await query(`
      CREATE TABLE IF NOT EXISTS conversation_analysis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
        analysis_type VARCHAR(100) NOT NULL,
        results JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Conversation analysis table created.");

    // Sentiment Analysis Table
    await query(`
      CREATE TABLE IF NOT EXISTS sentiment_analysis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
        sentiment_score REAL NOT NULL,
        sentiment_label VARCHAR(50) NOT NULL,
        confidence REAL NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Sentiment analysis table created.");

    // AI Memory Table
    await query(`
      CREATE TABLE IF NOT EXISTS ai_memory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        context JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ AI memory table created.");

    // Training Jobs Table
    await query(`
      CREATE TABLE IF NOT EXISTS training_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        model VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        params JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Training jobs table created.");

    // System Metrics Table
    await query(`
      CREATE TABLE IF NOT EXISTS system_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        metric_name VARCHAR(255) NOT NULL,
        metric_value DOUBLE PRECISION NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ System metrics table created.");

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_conversation_agents_conversation_id ON conversation_agents(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
      CREATE INDEX IF NOT EXISTS idx_agents_created_by ON agents(created_by);
    `);
    console.log("✅ Indexes created.");

    console.log("\n🎉 Database setup completed successfully!");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    throw error;
  } finally {
    await closePool();
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log("Database setup script completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database setup failed:", error);
    process.exit(1);
  });
