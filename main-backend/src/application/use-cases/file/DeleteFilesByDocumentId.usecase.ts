import { File } from "../../../domain/entities/file.entity";
import { IFileRepository } from "../../repositories/IFileRepository";

export class DeleteFilesByDocumentIdUsecase {
    private fileRepository: IFileRepository;

    constructor(fileRepository: IFileRepository){
        this.fileRepository = fileRepository
    }

    async execute(documentId: string): Promise<void>{
        if(!documentId){
            throw new Error("documentId not found or not have files")
        }
        await this.fileRepository.deleteByDocumentId(documentId);

        return;
    }
}