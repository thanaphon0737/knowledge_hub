import { Document } from "../../../domain/entities/document.entity";
import { IDocumentRepository } from "../../repositories/IDocumentRepository";

export class DeleteDocumentByIdUseCase {
  private documentRepository: IDocumentRepository;

  constructor(documentRepository: IDocumentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute(documentId: string, userId: string): Promise<void> {
    // Validate input
    if (!documentId || !userId) {
      throw new Error("Document ID and User ID are required");
    }

    // Delete the document
    await this.documentRepository.deleteByIdAndUserId(documentId, userId);
    // If no error is thrown, return success (could be void or a message)
    return;

    
  }
}