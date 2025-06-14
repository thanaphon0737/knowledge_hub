import { IDocumentRepository } from "../../../application/repositories/IDocumentRepository"
import { Document } from "../../../domain/entities/document.entity";
import { pool } from "../db"; // Import the connection pool

export class PostgresDocumentRepository implements IDocumentRepository {
    async findById(id: string): Promise<Document | null> {
        const query = `SELECT * FROM documents WHERE id = $1 LIMIT 1;`;
        try {
            const result = await pool.query(query, [id]);
            if (result.rows.length === 0) return null;
            return result.rows[0] as Document;
        } catch (error) {
            console.error('Error finding document by id:', error);
            throw new Error('Database error while finding document by id');
        }
    }

    async findByUserId(userId: string): Promise<Document[]> {
        const query = `SELECT * FROM documents WHERE user_id = $1;`;
        try {
            const result = await pool.query(query, [userId]);
            return result.rows as Document[];
        } catch (error) {
            console.error('Error finding documents by userId:', error);
            throw new Error('Database error while finding documents by userId');
        }
    }

    async findByName(name: string): Promise<Document | null> {
        const query = `SELECT * FROM documents WHERE name = $1 LIMIT 1;`;
        try {
            const result = await pool.query(query, [name]);
            if (result.rows.length === 0) return null;
            return result.rows[0] as Document;
        } catch (error) {
            console.error('Error finding document by name:', error);
            throw new Error('Database error while finding document by name');
        }
    }

    async delete(id: string): Promise<void> {
        const query = `DELETE FROM documents WHERE id = $1;`;
        try {
            await pool.query(query, [id]);
        } catch (error) {
            console.error('Error deleting document:', error);
            throw new Error('Database error while deleting document');
        }
    }

    async save(document: Document): Promise<Document> {
        const { id, user_id, name, description, created_at, updated_at } = document;
        const query = `
            INSERT INTO documents (id, user_id, name, description, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
                user_id = EXCLUDED.user_id,
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                -- created_at is NOT updated on conflict
                updated_at = EXCLUDED.updated_at
            RETURNING *;
        `;
        const values = [id, user_id, name, description, created_at, updated_at];

        try {
            const result = await pool.query(query, values);
            return result.rows[0] as Document;
        } catch (error) {
            console.error('Error saving document:', error);
            throw new Error('Database error while saving document');
        }
    }
}