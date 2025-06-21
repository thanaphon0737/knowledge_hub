import { File } from "../../../domain/entities/file.entity";
import { IFileRepository } from "../../repositories/IFileRepository";

export class DeleteFilesByUserIdUsecase {
    private fileRepository: IFileRepository;

    constructor(fileRepository: IFileRepository){
        this.fileRepository = fileRepository
    }

    async execute(userId: string): Promise<void>{
        if(!userId){
            throw new Error("userId not found or not have files")
        }
        await this.fileRepository.deleteAllByUserId(userId);

        return;
    }
}