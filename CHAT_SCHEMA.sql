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

-- 6. RLS Policies for chat_rooms
-- Users can see rooms they're members of
CREATE POLICY "Users can view their chat rooms"
  ON chat_rooms FOR SELECT
  USING (
    id IN (
      SELECT chat_room_id 
      FROM chat_room_members 
      WHERE volunteer_id IN (
        SELECT id FROM volunteers WHERE user_id = auth.uid()
      )
    )
  );

-- 7. RLS Policies for chat_room_members
-- Users can see members of rooms they're in
CREATE POLICY "Users can view members of their rooms"
  ON chat_room_members FOR SELECT
  USING (
    chat_room_id IN (
      SELECT chat_room_id 
      FROM chat_room_members 
      WHERE volunteer_id IN (
        SELECT id FROM volunteers WHERE user_id = auth.uid()
      )
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
