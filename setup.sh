#!/bin/bash
set -e

echo "Starting LLM Sandbox setup..."

# Install required packages for the setup script
echo "Installing required packages..."
npm install @neondatabase/serverless

# Set up database tables if needed
if [ -n "$DATABASE_URL" ]; then
  echo "Setting up database..."
  
  # Create necessary tables using the Neon serverless client
  node -e "
  const { neon } = require('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL);
  
  async function setupDatabase() {
    try {
      // Check if conversations table exists
      const tableExists = await sql\`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'conversations'
        )
      \`;
      
      // If table doesn't exist, create all tables with consistent data types
      if (!tableExists[0].exists) {
        console.log('Creating tables...');
        
        // Create conversations table with UUID primary key
        await sql\`
          CREATE TABLE IF NOT EXISTS conversations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
        
        // Create conversation_messages table with UUID foreign key
        await sql\`
          CREATE TABLE IF NOT EXISTS conversation_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
            role VARCHAR(50) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        \`;
        
        // Create conversation_vectors table with UUID foreign key
        await sql\`
          CREATE TABLE IF NOT EXISTS conversation_vectors (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
            vector_data JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        \`;
      } else {
        console.log('Tables already exist, skipping creation');
      }
      
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
