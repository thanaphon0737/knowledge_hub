import { IDocumentRepository } from "../../../application/repositories/IDocumentRepository";
import { Document } from "../../../domain/entities/document.entity";
import { pool } from "../db"; // Import the connection pool

export class PostgresDocumentRepository implements IDocumentRepository {
  create(
    document: Omit<Document, "id" | "created_at" | "updated_at">
  ): Promise<Document> {
    const { user_id, name, description } = document;
    const query = `
            INSERT INTO documents (user_id, name, description)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
    const values = [user_id, name, description];

    return pool
      .query(query, values)
      .then((result) => result.rows[0])
      .catch((error) => {
        console.error("Error creating document:", error);
        throw new Error("Database error while creating document");
      });
  }
  findByIdAndUserId(id: string, userId: string): Promise<Document | null> {
    const query = "SELECT * FROM documents WHERE id = $1 and user_id = $2";
    const values = [id, userId];
    return pool
      .query(query, values)
      .then((result) => {
        if (result.rows.length === 0) {
          return null; // Document not found
        }
        return result.rows[0]; // Return the found document
      })
      .catch((error) => {
        console.error("Error finding document by ID and user ID:", error);
        throw new Error("Database error while finding document");
      });
  }

  findAllByUserId(user_id: string): Promise<Document[]> {
    const query = "SELECT * FROM documents WHERE user_id = $1";
    const values = [user_id];
    return pool
      .query(query, values)
      .then((result) => result.rows) // Return all documents found
      .catch((error) => {
        console.error("Error finding documents by user ID:", error);
        throw new Error("Database error while finding documents");
      });
  }

  update(document: Document): Promise<Document> {
    const query = `
            UPDATE documents
            SET name = $1, description = $2, updated_at = NOW()
            WHERE id = $3 AND user_id = $4`;
    const values = [
      document.name,
      document.description,
      document.id,
      document.user_id,
    ];
    return pool
      .query(query, values)
      .then((result) => {
        if (result.rowCount === 0) {
          throw new Error(
            "Document not found or user does not have permission"
          );
        }
        return document; // Return the updated document
      })
      .catch((error) => {
        console.error("Error updating document:", error);
        throw new Error("Database error while updating document");
      });
  }

  deleteByIdAndUserId(id: string, userId: string): Promise<void> {
    const query = "DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING *";
    const values = [id, userId];
    return pool
      .query(query, values)
      .then((result) => {
        if (result.rowCount === 0) {
          throw new Error(
            "Document not found or user does not have permission"
          );
        }
        return;
      })
      .catch((error) => {
        console.error("Error deleting document:", error);
        throw new Error("Database error while deleting document");
      });
  }
}
