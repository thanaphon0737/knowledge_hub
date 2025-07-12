import axios, { AxiosResponse } from "axios";
import { deleteSession } from "@/lib/session";
import apiClient from '../lib/api-client';
export const apiLogin = (credentials: { email: string; password: string }) => {
  return apiClient.post('/auth/login',credentials);
};


export const apiLogout = async () => {
  await deleteSession();
  console.log("logout");
};

export const apiGetProfile = () => {
  return apiClient.get('/user/me')
};

export async function apiRegister(credentials: {
  email: string;
  password: string;
}) {
  return apiClient.post('/auth/register',credentials)
}

export function apiGetDocuments() {
  return apiClient.get(`/documents`)
}

export function apiCreateDocuments(data: {
  name: string;
  description: string;
}) {
  
  return apiClient.post(`/documents`,data)
}

export function apiGetDocumentById(id: string) {
  return apiClient.get(`/documents/${id}`)
}

export function apiGetFileByDocumentId(id: string) {
  return apiClient.get(`/documents/${id}/files`)
}

export function apiCreateFilewithPdf(documentId:string, file:File){
  const formData = new FormData();
  formData.append('file',file);
  return apiClient.post(`/documents/${documentId}/files/upload`,formData)
  
}

export function apiCreateFileWithUrl(documentId: string, sourceUrl:string){
  const payload = {sourceUrl:sourceUrl}
  return apiClient.post(`/documents/${documentId}/files/url`,payload)
}

export function apiQueryQuestion(question: string){
  return apiClient.post(`/query`,{question:question})
}