#!/bin/bash
set -e

echo "Starting LLM Sandbox setup..."

# Set up database tables if needed
if [ -n "$DATABASE_URL" ]; then
  echo "Setting up database..."
  
  # Create necessary tables using the Neon serverless client
  node -e "
  const { neon } = require('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL);
  
  async function setupDatabase() {
    try {
      // Create conversations table if it doesn't exist
      await sql\`
        CREATE TABLE IF NOT EXISTS conversations (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          template_id INTEGER,
          agent_id INTEGER,
          status VARCHAR(50) DEFAULT 'active',
          settings JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      \`;
      
      // Create conversation_messages table if it doesn't exist
      await sql\`
        CREATE TABLE IF NOT EXISTS conversation_messages (
          id SERIAL PRIMARY KEY,
          conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
          role VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      \`;
      
      // Create conversation_vectors table if it doesn't exist
      await sql\`
        CREATE TABLE IF NOT EXISTS conversation_vectors (
          id SERIAL PRIMARY KEY,
          conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
          vector_data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      \`;
      
      console.log('Database setup completed successfully');
    } catch (error) {
      console.error('Database setup error:', error);
      process.exit(1);
    }
  }
  
  setupDatabase();
  "
fi

echo "Setup completed successfully!"
exit 0
