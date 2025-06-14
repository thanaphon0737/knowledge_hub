import { Document } from "../../domain/entities/document.entity";

export interface IDocumentRepository {
    findById(id: string): Promise<Document | null>;
    findByUserId(userId: string): Promise<Document[]>;
    findByName(name: string): Promise<Document | null>;
    save(document: Document): Promise<Document>;
    delete(id: string): Promise<void>;
}