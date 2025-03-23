-- Create AI Configuration table
CREATE TABLE IF NOT EXISTS ai_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  api_key TEXT NOT NULL,
  model_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE ai_config ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own AI configurations
CREATE POLICY "Users can view their own AI configs" 
  ON ai_config 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own AI configurations
CREATE POLICY "Users can insert their own AI configs" 
  ON ai_config 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own AI configurations
CREATE POLICY "Users can update their own AI configs" 
  ON ai_config 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own AI configurations
CREATE POLICY "Users can delete their own AI configs" 
  ON ai_config 
  FOR DELETE 
  USING (auth.uid() = user_id);
