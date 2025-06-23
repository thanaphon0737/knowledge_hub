export interface IProcessingService {
startProcessing(fileInfo: {fileId: string; userId: string}): Promise<void>;
}