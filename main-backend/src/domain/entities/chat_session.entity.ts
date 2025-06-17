export interface chatSession {
    id: string; // Unique identifier for the chat session
    user_id: string; // ID of the user who owns the chat session
    title: string; // Title of the chat session
    created_at: Date; // Timestamp when the chat session was created
    updated_at: Date; // Timestamp when the chat session was last updated
}