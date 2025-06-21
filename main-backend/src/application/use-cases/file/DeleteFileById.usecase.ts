import { File } from "../../../domain/entities/file.entity";
import { IFileRepository } from "../../repositories/IFileRepository";

export class DeletesFileByIdUsecase {
    private fileRepository: IFileRepository;

    constructor(fileRepository: IFileRepository){
        this.fileRepository = fileRepository
    }

    async execute(id: string): Promise<void>{
        if(!id){
            throw new Error("File id not found or not have files")
        }
        await this.fileRepository.deleteById(id);

        return;
    }
}