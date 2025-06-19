-- Database Schema for Wealth Agent Application
-- Execute this in your Supabase dashboard to create the required tables

-- Create users table for Clerk authentication integration
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  access_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
-- Allow authenticated users to read their own data
CREATE POLICY "Users can read own data" ON users 
  FOR SELECT 
  USING (auth.uid()::text = clerk_id);

-- Allow service role to insert/update (for server-side operations)
CREATE POLICY "Service role can manage users" ON users 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON users 
  FOR UPDATE 
  USING (auth.uid()::text = clerk_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_access_expires ON users(access_expires_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create table for file uploads tracking
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  openai_file_id TEXT NOT NULL,
  vector_store_id TEXT,
  upload_status TEXT DEFAULT 'uploaded' CHECK (upload_status IN ('uploaded', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS for file_uploads
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- Policies for file_uploads
CREATE POLICY "Users can manage own files" ON file_uploads 
  FOR ALL 
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Indexes for file_uploads
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_openai_file_id ON file_uploads(openai_file_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_status ON file_uploads(upload_status);

-- Trigger for file_uploads updated_at
CREATE TRIGGER update_file_uploads_updated_at 
  BEFORE UPDATE ON file_uploads 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create table for chat conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  openai_response_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
CREATE POLICY "Users can manage own conversations" ON conversations 
  FOR ALL 
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_response_id ON conversations(openai_response_id);

-- Trigger for conversations updated_at
CREATE TRIGGER update_conversations_updated_at 
  BEFORE UPDATE ON conversations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create messages table for chat history
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  files_attached TEXT[], -- Array of OpenAI file IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages
CREATE POLICY "Users can read own messages" ON messages 
  FOR SELECT 
  USING (conversation_id IN (
    SELECT id FROM conversations 
    WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  ));

CREATE POLICY "Users can insert own messages" ON messages 
  FOR INSERT 
  WITH CHECK (conversation_id IN (
    SELECT id FROM conversations 
    WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  ));

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Insert sample data (optional - remove in production)
-- INSERT INTO users (clerk_id, email, access_expires_at) 
-- VALUES ('user_test123', 'test@example.com', NOW() + INTERVAL '1 year')
-- ON CONFLICT (clerk_id) DO NOTHING;