-- This SQL script creates the trigger function and applies it to existing tables.
-- Run this once on your database if you have already created the tables.

-- Step 1: Create the trigger function.
-- This function will set the 'updated_at' column to the current time.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';


-- Step 2: Apply the trigger to each table that has an 'updated_at' column.
-- This tells PostgreSQL to run the function above before every UPDATE on these tables.

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at
BEFORE UPDATE ON files
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
BEFORE UPDATE ON chat_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
