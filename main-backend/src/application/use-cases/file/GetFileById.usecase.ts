import { File } from "../../../domain/entities/file.entity";
import { IFileRepository } from "../../repositories/IFileRepository";

export class GetFileByIdUseCase{
    private fileRepository: IFileRepository;
    constructor(fileRepository: IFileRepository){
        this.fileRepository = fileRepository;
    }

    async execute(id: string): Promise<File | null> {
        const file = await this.fileRepository.findById(id);
        if(!file){
            throw new Error("File not found")
        }

        return file;
    }
}