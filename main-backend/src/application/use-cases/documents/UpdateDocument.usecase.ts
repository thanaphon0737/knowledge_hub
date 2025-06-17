import { Document } from "../../../domain/entities/document.entity";
import { IDocumentRepository } from "../../repositories/IDocumentRepository";

export class UpdateDocumentUseCase {
  private documentRepository: IDocumentRepository;

  constructor(documentRepository: IDocumentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute(document: Partial<Document> & { id: string; user_id: string }): Promise<Document | null> {
    // Validate input
    if (!document.id || !document.user_id) {
      throw new Error("Document ID and User ID are required");
    }

    // Update the document
    const updatedDocument = await this.documentRepository.update(document);
    
    if (!updatedDocument) {
      throw new Error("Document not found or user does not have permission");
    }

    return updatedDocument;
  }
}