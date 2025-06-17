import { Document } from "../../domain/entities/document.entity";

export interface IDocumentRepository {
    /**
     * create new document
     * @param document - Document entity to be saved
     *  @returns Promise<Document> - The saved document entity
     */
    create(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document>; // Document without id, created_at, and updated_at

    /**
     * update an existing document
     *  @param document - Document entity to be updated
     *  @returns Promise<Document> - The updated document entity
     */
    update(document: Partial<Document> & {id: string,user_id: string }): Promise<Document | null>; // Document with id, but partial for other fields

    /**
     * find document by id and user id
     * @param id - Document id
     *  @param userId - User id who owns the document
    *  @returns Promise<Document | null> - The found document entity or null if not found
     */
    findByIdAndUserId(id: string, userId: string): Promise<Document | null>;

    /**
     * find all documents by user id
     * @param userId - User id to find documents for
     *  @returns Promise<Document[]> - Array of documents owned by the user
     */
    findAllByUserId(userId: string): Promise<Document[]>;

    /**
     * delete document by id and user id
     *  @param id - Document id
     *  @param userId - User id who owns the document
     *  @returns Promise<void> - Resolves when the document is deleted
     */
    deleteByIdAndUserId(id: string, userId: string): Promise<void>;
}