import { Document } from "../../../domain/entities/document.entity";
import { IDocumentRepository } from "../../repositories/IDocumentRepository";
import { IUserRepository } from "../../repositories/IUserRepository";

export class GetDocumentByUserUseCase {
  private documentRepository: IDocumentRepository;
  private userRepository: IUserRepository;

  constructor(documentRepository: IDocumentRepository, userRepository: IUserRepository) {
    this.documentRepository = documentRepository;
    this.userRepository = userRepository;
  }

  async execute(userId: string, documentId: string): Promise<Document | null> {
    // Validate user existence
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Fetch the document by ID and user ID
    const document = await this.documentRepository.findByIdAndUserId(documentId, userId);
    
    // Return the found document or null if not found
    return document;
  }
}