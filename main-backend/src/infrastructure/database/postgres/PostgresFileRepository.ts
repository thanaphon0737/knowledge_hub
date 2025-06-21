import { IFileRepository } from "../../../application/repositories/IFileRepository";
import { File } from "../../../domain/entities/file.entity";
import { pool } from "../db"; // Import the connection pool

export class PostgresFileRepository implements IFileRepository {
  private static readonly updatableColumns: (keyof Omit<
    File,
    "id" | "created_at" | "updated_at" | "user_id"
  >)[] = [
    "document_id",
    "source_type",
    "file_name",
    "source_location",
    "file_size",
    "file_type",
    "processing_status",
  ];

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
      file_name,
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
      file_name,
    ];

    return pool
      .query(query, values)
      .then((result) => result.rows[0])
      .catch((error) => {
        console.error("Error creating file:", error);
        throw new Error("Database error while creating file");
      });
  }
  async update(file: Partial<File> & { id: string }): Promise<File | null> {
    if (!file.id) {
      throw new Error("File ID is required for update");
    }

    const { id, ...fieldsToUpdate } = file;

    const validFields = Object.keys(fieldsToUpdate).filter(
      (key) =>
        PostgresFileRepository.updatableColumns.includes(key as any) &&
        fieldsToUpdate[key as keyof typeof fieldsToUpdate] !== undefined
    );

    // --- Dynamic Query Building ---

    // 1. Build the SET part of the query.
    // e.g., "file_name" = $1, "processing_status" = $2
    const setClause = validFields
      .map((key, index) => `"${key}" = $${index + 1}`)
      .join(", ");

    // 2. Prepare the array of values for the query.
    // The order must match the order of fields in the setClause.
    const values = validFields.map(
      (key) => fieldsToUpdate[key as keyof typeof fieldsToUpdate]
    );

    // 3. Add the file ID to the end of the values array for the WHERE clause.
    values.push(id);

    // 4. Construct the final SQL query.
    // We also update the 'updated_at' column automatically.
    const query = `
        UPDATE files
        SET ${setClause}, "updated_at" = NOW()
        WHERE id = $${values.length}
        RETURNING *;
    `;

    try {
      const result = await pool.query(query, values);
      if (result.rows.length == 0) {
        return null;
      }
      return result.rows[0];
    } catch (error: any) {
      throw new Error("Database error while updating file");
    }
  }
  deleteAllByUserId(userId: string): Promise<void> {
    const query = `
    DELETE FROM files            
    USING documents         
    WHERE files.document_id = documents.id AND documents.user_id = $1;               
    `;
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
