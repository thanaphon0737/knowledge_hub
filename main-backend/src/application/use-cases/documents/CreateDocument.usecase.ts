import { Document } from "../../../domain/entities/document.entity";
import { IDocumentRepository } from "../../repositories/IDocumentRepository";

export class CreateDocumentUseCase {
  private documentRepository: IDocumentRepository;

  constructor(documentRepository: IDocumentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute(
    userId: string,
    name: string,
    description: string
  ): Promise<Document> {
    // 1. Input Validation
    if (!userId || !name) {
      throw new Error("User ID and name are required");
    }

    // 2. Create Document
    const document = await this.documentRepository.create({
      user_id: userId,
      name,
      description,
    });

    // 3. Return Created Document
    return document;
  }
}