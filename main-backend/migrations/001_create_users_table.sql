-- This SQL script creates the necessary tables for the application.
-- It's best practice to split these into separate migration files.

-- ========= MIGRATION 1: CREATE users TABLE =========
-- This table stores user authentication and profile information.

CREATE TABLE users (
    -- A universally unique identifier for each user, serves as the primary key.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User's email address, used for login. It must be unique across all users.
    email TEXT NOT NULL UNIQUE,

    -- The user's password, stored as a secure hash. Never store plain text passwords.
    password_hash TEXT NOT NULL,

    -- Timestamp for when the user account was created. Defaults to the current time.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Timestamp for the last time the user's record was updated. Defaults to the current time.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ========= MIGRATION 2: CREATE documents TABLE =========
-- This table stores metadata about each document uploaded by a user.

CREATE TABLE documents (
    -- A universally unique identifier for each document.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Key that links this document to a user in the 'users' table.
    -- If a user is deleted, all their documents will be deleted as well (ON DELETE CASCADE).
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- The original filename of the uploaded document (e.g., "report.pdf").
    file_name TEXT NOT NULL,

    -- The path or key where the actual file is stored in your object storage (S3/MinIO).
    file_path TEXT NOT NULL,

    -- The size of the file in bytes. Useful for usage tracking.
    file_size BIGINT NOT NULL,

    -- The MIME type of the file (e.g., "application/pdf", "image/jpeg").
    file_type TEXT NOT NULL,

    -- The current status of the document in the processing pipeline.
    -- Possible values: 'UPLOADED', 'PROCESSING', 'READY', 'ERROR'.
    processing_status TEXT NOT NULL DEFAULT 'UPLOADED',

    -- Timestamp for when the document was first uploaded.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Timestamp for the last time the document's metadata or status was updated.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional: Create indexes to speed up common queries.
CREATE INDEX idx_documents_user_id ON documents(user_id);

