import { IFileRepository } from "../../../application/repositories/IFileRepository";
import { File } from "../../../domain/entities/file.entity";
import { pool } from "../db"; // Import the connection pool

export class PostgresFileRepository implements IFileRepository {
  findById(id: string): Promise<File | null> {
    const query = "SELECT * FROM files WHERE id = $1";
    const values = [id];
    return pool
      .query(query, values)
      .then((result) => {
        if (result.rows.length === 0) {
          return null; // File not found
        }
        return result.rows[0]; // Return the found file
      })
      .catch((error) => {
        console.error("Error finding file by ID:", error);
        throw new Error("Database error while finding file");
      });
  }

  findByDocumentId(documentId: string): Promise<File[]> {
    const query = "SELECT * FROM files WHERE document_id = $1";
    const values = [documentId];
    return pool
      .query(query, values)
      .then((result) => result.rows) // Return all files found
      .catch((error) => {
        console.error("Error finding files by document ID:", error);
        throw new Error("Database error while finding files");
      });
  }

  create(file: Omit<File, "id" | "created_at" | "updated_at">): Promise<File> {
    const {
      document_id,
      source_type,
      source_location,
      file_size,
      file_type,
      processing_status,
      file_name
    } = file;
    const query = `
            INSERT INTO files (document_id, source_type, source_location, file_size, file_type, processing_status, file_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
    const values = [
      document_id,
      source_type,
      source_location,
      file_size,
      file_type,
      processing_status,
      file_name
    ];

    return pool
      .query(query, values)
      .then((result) => result.rows[0])
      .catch((error) => {
        console.error("Error creating file:", error);
        throw new Error("Database error while creating file");
      });
  }
  update(file: Partial<File> & { id: string }): Promise<File | null> {
    if (!file.id) {
      throw new Error("File ID is required for update");
    }

    const {
      id,
      document_id,
      source_type,
      file_name,
      source_location,
      file_size,
      file_type,
      processing_status,
    } = file;
    const query = `
            UPDATE files
            SET document_id = $1,
                source_type = $2,
                file_name = $3,
                source_location = $4,
                file_size = $5,
                file_type = $6,
                processing_status = $7,
            WHERE id = $8
            RETURNING *;
        `;
    const values = [
      document_id,
      source_type,
      file_name,
      source_location,
      file_size,
      file_type,
      processing_status,
      id, // Ensure the ID is the last parameter
    ];

    return pool
      .query(query, values)
      .then((result) => {
        if (result.rows.length === 0) {
          return null; // File not found
        }
        return result.rows[0]; // Return the updated file
      })
      .catch((error) => {
        console.error("Error updating file:", error);
        throw new Error("Database error while updating file");
      });
  }
  deleteAllByUserId(userId: string): Promise<void> {
    const query = "DELETE FROM files WHERE user_id = $1";
    const values = [userId];
    return pool
      .query(query, values)
      .then(() => {})
      .catch((error) => {
        console.error("Error deleting files by user ID:", error);
        throw new Error("Database error while deleting files");
      });
  }
  deleteByDocumentId(documentId: string): Promise<void> {
    const query = "DELETE FROM files WHERE document_id = $1";
    const values = [documentId];
    return pool
      .query(query, values)
      .then(() => {})
      .catch((error) => {
        console.error("Error deleting files by document ID:", error);
        throw new Error("Database error while deleting files");
      });
  }
  deleteById(id: string): Promise<void> {
    const query = "DELETE FROM files WHERE id = $1";
    const values = [id];
    return pool
      .query(query, values)
      .then(() => {})
      .catch((error) => {
        console.error("Error deleting file by ID:", error);
        throw new Error("Database error while deleting file");
      });
  }
}
