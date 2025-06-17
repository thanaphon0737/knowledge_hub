-- This SQL script creates the complete database schema based on the ERD.
-- It's best practice to separate each CREATE TABLE statement into its own migration file.

-- Enable the pgcrypto extension to use gen_random_uuid() for UUID generation.
-- This should be run once per database.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ========= TABLE 1: users =========
-- Stores user authentication and profile information.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ========= TABLE 2: documents =========
-- Stores a collection or "project" belonging to a user, which acts as a container for files.
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ========= TABLE 3: files =========
-- Stores metadata for each individual file or URL source within a document collection.
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL, -- e.g., 'upload', 'url'
    file_name TEXT, -- Original name for uploaded files
    source_location TEXT NOT NULL, -- Path in object storage or the URL
    file_size BIGINT, -- Size in bytes for uploaded files
    file_type TEXT, -- MIME type for uploaded files
    processing_status TEXT NOT NULL DEFAULT 'PENDING', -- e.g., 'PENDING', 'PROCESSING', 'READY', 'ERROR'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ========= TABLE 4: chat_sessions =========
-- Represents a single conversation thread or chat session for a user.
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL, -- Can be the first user message or a generated title
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ========= TABLE 5: chat_messages =========
-- Stores each individual message within a chat session.
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL, -- e.g., 'user' or 'ai'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ========= INDEXES FOR PERFORMANCE =========
-- It's good practice to create indexes on foreign key columns to speed up join operations.
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_files_document_id ON files(document_id);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);

