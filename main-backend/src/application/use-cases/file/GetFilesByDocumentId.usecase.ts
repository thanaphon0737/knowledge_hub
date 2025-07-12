import { File } from "../../../domain/entities/file.entity";
import { IFileRepository } from "../../repositories/IFileRepository";

export class GetFileByDocumentIdUseCase{
    private fileRepository: IFileRepository;
    constructor(fileRepository: IFileRepository){
        this.fileRepository = fileRepository;
    }

    async execute(document_id: string): Promise<File[]> {
        const file = await this.fileRepository.findByDocumentId(document_id);
        

        return file;
    }
}