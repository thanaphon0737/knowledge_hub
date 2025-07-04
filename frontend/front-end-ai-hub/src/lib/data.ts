
import { notFound } from "next/navigation";
import { apiGetDocumentById } from "@/services/api";
import axios from "axios";


export async function getDocumentById(id:string) {
    try{
        console.log('send id:',id)
        const response = await apiGetDocumentById(id);
        return response.data
    }catch(err){
        if(axios.isAxiosError(err)){
            if(err.response?.status === 404){
                notFound();
            }
        }
        console.log(err)
        throw new Error('Failed to fetch document data.');
    }
}