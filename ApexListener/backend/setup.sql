-- Create the tables for Watch2Gether clone

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optional: Room Metadata
CREATE TABLE public.room_metadata (
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  PRIMARY KEY (room_id)
);

-- Create a function to clean up old rooms
CREATE OR REPLACE FUNCTION clean_inactive_rooms()
RETURNS void AS $$
BEGIN
  -- Delete rooms that haven't been active for 24 hours
  DELETE FROM public.rooms WHERE last_active < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Set up pg_cron (if available on Supabase) to run cleanup daily
-- SELECT cron.schedule('cleanup_rooms', '0 0 * * *', 'SELECT clean_inactive_rooms()');

-- RLS Policies (disable for now since no auth required)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update rooms" ON public.rooms FOR UPDATE USING (true);
