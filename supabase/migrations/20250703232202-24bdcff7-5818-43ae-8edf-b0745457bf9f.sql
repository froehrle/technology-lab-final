-- Enable realtime for pending_questions table
ALTER TABLE pending_questions REPLICA IDENTITY FULL;

-- Add table to realtime publication if not already added
ALTER PUBLICATION supabase_realtime ADD TABLE pending_questions;