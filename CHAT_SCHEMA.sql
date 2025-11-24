-- Chat System Schema for Freestyle Vancouver Volunteer App
-- Run this in Supabase SQL Editor to add chat functionality

-- 1. Create chat_rooms table (for team chats and club notifications)
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('team', 'club_notifications')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create chat_room_members table (who's in which chat)
CREATE TABLE IF NOT EXISTS chat_room_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'coach', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_room_id, volunteer_id)
);

-- 3. Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_chat_room ON messages(chat_room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_volunteer ON chat_room_members(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room ON chat_room_members(chat_room_id);

-- 5. Enable Row Level Security
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can view members of their rooms" ON chat_room_members;
DROP POLICY IF EXISTS "Users can add members to rooms" ON chat_room_members;
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their rooms" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- 6. RLS Policies for chat_rooms
-- Users can see all rooms (filtering happens in the app via getUserChatRooms)
CREATE POLICY "Users can view their chat rooms"
  ON chat_rooms FOR SELECT
  USING (true);  -- Simplified: let volunteers see all rooms, filtering happens in app

-- Allow authenticated users to create chat rooms
CREATE POLICY "Users can create chat rooms"
  ON chat_rooms FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 7. RLS Policies for chat_room_members
-- Users can view all members (needed to display chat participant lists)
CREATE POLICY "Users can view members of their rooms"
  ON chat_room_members FOR SELECT
  USING (true);  -- Simplified: authenticated users can see memberships

-- Allow inserting members when creating team chats (admin function)
CREATE POLICY "Users can add members to rooms"
  ON chat_room_members FOR INSERT
  WITH CHECK (
    volunteer_id IN (
      SELECT id FROM volunteers WHERE user_id = auth.uid()
    )
  );

-- 8. RLS Policies for messages
-- Users can view messages in rooms they're members of
CREATE POLICY "Users can view messages in their rooms"
  ON messages FOR SELECT
  USING (
    chat_room_id IN (
      SELECT chat_room_id 
      FROM chat_room_members 
      WHERE volunteer_id IN (
        SELECT id FROM volunteers WHERE user_id = auth.uid()
      )
    )
  );

-- Users can send messages to rooms they're members of
CREATE POLICY "Users can send messages to their rooms"
  ON messages FOR INSERT
  WITH CHECK (
    chat_room_id IN (
      SELECT chat_room_id 
      FROM chat_room_members 
      WHERE volunteer_id IN (
        SELECT id FROM volunteers WHERE user_id = auth.uid()
      )
    )
  );

-- Users can update their own messages
CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (
    sender_id IN (
      SELECT id FROM volunteers WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (
    sender_id IN (
      SELECT id FROM volunteers WHERE user_id = auth.uid()
    )
  );

-- 9. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers for updated_at
-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON chat_rooms;
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;

CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Create the club notifications room (everyone can see this)
INSERT INTO chat_rooms (name, type, description)
VALUES ('Club Notifications', 'club_notifications', 'Important announcements and updates for all volunteers')
ON CONFLICT DO NOTHING;

-- 12. Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Done! Chat system is ready to use.
