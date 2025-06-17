import { Document } from "../../../domain/entities/document.entity";
import { IDocumentRepository } from "../../repositories/IDocumentRepository";

export class GetDocuments {
  private documentRepository: IDocumentRepository;

  constructor(documentRepository: IDocumentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute(userId: string): Promise<Document[] | null> {
    // Fetch the document by ID and user ID
    const documents = await this.documentRepository.findAllByUserId(userId);
    if (!documents || documents.length === 0) {
      throw new Error("Document not found for the user");
    }
    // Return the found document or null if not found
    return documents;
  }
}
