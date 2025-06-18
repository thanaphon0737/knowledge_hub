import { File } from "../../domain/entities/file.entity";

export interface IFileRepository {
    findById(id: string): Promise<File | null>;
    findByDocumentId(documentId: string): Promise<File[]>;
    create(file: Omit<File, 'id' | 'created_at' | 'updated_at'>): Promise<File>;
    update(file: Partial<File> & { id: string }): Promise<File | null>;
    deleteById(id: string): Promise<void>;
    deleteByDocumentId(documentId: string): Promise<void>;
    deleteAllByUserId(userId: string): Promise<void>;
    findAllByUserId(userId: string): Promise<File[]>;
    findAllByDocumentId(documentId: string): Promise<File[]>;
    findAllByUserIdAndDocumentId(userId: string, documentId: string): Promise<File[]>;
    findAllByUserIdAndDocumentIdAndFileType(
        userId: string,
        documentId: string,
        fileType: string
    ): Promise<File[]>;
}