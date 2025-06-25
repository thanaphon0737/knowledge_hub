import { RequestHandler } from "express";
import { PostgresFileRepository } from "../../database/postgres/PostgresFileRepository";
import { stat } from "fs";

const fileRepository = new PostgresFileRepository();

export const updateFileStatusWebhook: RequestHandler = async(req,res) => {
    const { fileId, status, errorMessage} = req.body;
    if(!fileId || !status){
        res.status(400).json({message: "fileId and status are required."})

    }
    try {
        console.log(`Webhook Received status update for file ${fileId} to ${status}`);

        const updatedFile = await fileRepository.update({
            id: fileId,
            processing_status: status,
        })
        if(!updatedFile){
            console.warn(`Webhook File with id ${fileId} not found for update status`)
        }
        res.status(200).json({success: true, message: "Status acknowledge"})
    }
    catch(error: any){
        res.status(500).json({success: false, message: error.message})
    }
}