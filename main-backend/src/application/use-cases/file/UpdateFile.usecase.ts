import { File } from "../../../domain/entities/file.entity";
import { IFileRepository } from "../../repositories/IFileRepository";

export class UpdateFileUsecase {
    private fileRepository: IFileRepository;

    constructor(fileRepository: IFileRepository){
        this.fileRepository = fileRepository
    }

    async execute(file: Partial<File> & {id: string}): Promise<File | null>{
        if(!file.id) {
            throw new Error("File id is required.")

        }

        const updateFile = await this.fileRepository.update(file);

        if (!updateFile){
            throw new Error("File not found.")
        }

        return updateFile;
    }
}