-- Create lessons table with proper schema
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  course TEXT,
  status TEXT CHECK (status IN ('Todo', 'Doing', 'Done', 'Blocked')) DEFAULT 'Todo',
  priority INTEGER CHECK (priority >= 1 AND priority <= 5) DEFAULT 3,
  tags JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  estimate_mins INTEGER,
  actual_mins INTEGER,
  unlock_at TIMESTAMP WITH TIME ZONE,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  review_level INTEGER DEFAULT 0,
  next_review_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for performance
CREATE INDEX IF NOT EXISTS idx_lessons_user_id ON lessons(user_id);

-- Create index on updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_lessons_updated_at ON lessons(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own lessons
CREATE POLICY "Users can view own lessons" ON lessons
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own lessons
CREATE POLICY "Users can insert own lessons" ON lessons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own lessons
CREATE POLICY "Users can update own lessons" ON lessons
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own lessons
CREATE POLICY "Users can delete own lessons" ON lessons
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
