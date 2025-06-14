export interface File {
    id: string; // Unique identifier for the file
    document_id: string; // ID of the document this file belongs to
    source_type: string; // Type of the source (e.g., 'local', 's3', etc.)
    file_name: string; // Name of the file
    source_location: string; // Location of the file in the source (e.g., path or URL)
    file_size: number; // Size of the file in bytes
    file_type: string; // MIME type of the file (e.g., 'image/png', 'application/pdf', etc.)
    processing_status: string; // Status of processing (e.g., 'pending', 'processing', 'completed', 'failed')
    created_at: Date; // Timestamp when the file was created
    updated_at: Date; // Timestamp when the file was last updated
}