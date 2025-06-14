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
    findByIdAndUserId(id: string): Promise<Document | null> {
        throw new Error("Method not implemented.");
    }

    findAllByUserId(user_id: string): Promise<Document[]> {
        throw new Error("Method not implemented.");
    }

    update(document: Document): Promise<Document> {
        throw new Error("Method not implemented.");
    }

    deleteByIdAndUserId(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}