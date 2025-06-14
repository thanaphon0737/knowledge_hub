import { IDocumentRepository } from "../../../application/repositories/IDocumentRepository"
import { Document } from "../../../domain/entities/document.entity";
import { pool } from "../db"; // Import the connection pool

export class PostgresDocumentRepository implements IDocumentRepository {
    create(document: Omit<Document, "id" | "created_at" | "updated_at">): Promise<Document> {
        const { user_id, name, description } = document;
        const query = `
            INSERT INTO documents (user_id, name, description)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [user_id, name, description];

        return pool.query(query, values)
            .then(result => result.rows[0])
            .catch(error => {
                console.error('Error creating document:', error);
                throw new Error('Database error while creating document');
            });
    }
    findByIdAndUserId(id: string,userId: string): Promise<Document | null> {
        const query = 'SELECT * FROM documents WHERE id = $1 and user_id = $2';
        const values = [id, userId];
        return pool.query(query, values)
            .then(result => {
                if (result.rows.length === 0) {
                    return null; // Document not found
                }
                return result.rows[0]; // Return the found document
            })
            .catch(error => {
                console.error('Error finding document by ID and user ID:', error);
                throw new Error('Database error while finding document');
            });
    }

    findAllByUserId(user_id: string): Promise<Document[]> {
        const query = 'SELECT * FROM documents WHERE user_id = $1';
        const values = [user_id];
        return pool.query(query, values)
            .then(result => result.rows) // Return all documents found
            .catch(error => {
                console.error('Error finding documents by user ID:', error);
                throw new Error('Database error while finding documents');
            });
    }

    update(document: Document): Promise<Document> {
        throw new Error("Method not implemented.");
    }

    deleteByIdAndUserId(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}