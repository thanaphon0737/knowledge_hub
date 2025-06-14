export interface chatMessage {
    id: string; // Unique identifier for the chat message
    session_id: string; // ID of the chat session this message belongs to
    sender: string; // Sender of the message (e.g., 'user', 'assistant')
    content: string; // Content of the chat message
    created_at: Date; // Timestamp when the message was created
}