import axios, { AxiosResponse } from "axios";
import { deleteSession } from "@/lib/session";
// const apiClient = axios.create({
//     baseURL: 'http://localhost:3000/api/v1',
//     withCredentials: true,
// })
const baseURL = process.env.NEXT_PUBLIC_API_BACKEND_LOCAL
export const apiLogin = (credentials: { email: string; password: string }) => {
  try {
    // return apiClient.post('/auth/login',credentials)
    const result = axios.post(
      `${baseURL}/auth/login`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    return result;
  } catch (err: any) {
    console.log(err);
  }
};

export const apiLogout = async () => {
  await deleteSession();
  console.log("logout");
};

export const apiGetProfile = () => {
  const result = axios.get(`${baseURL}/user/me`, {
    withCredentials: true,
  });
  return result;
  // return apiClient.get('/users/me')
};

export async function apiRegister(credentials: {
  email: string;
  password: string;
}): Promise<AxiosResponse | null> {
  try {
    const result = axios.post(
      `${baseURL}/auth/register`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function apiGetDocuments() {
  return axios.get(`${baseURL}/documents`, {
    withCredentials: true,
  });
}

export function apiCreateDocuments(data: {
  name: string;
  description: string;
}) {
  return axios.post(`${baseURL}/documents`, data, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
}

export function apiGetDocumentById(id: string) {
  return axios.get(`${baseURL}/documents/${id}`, {
    withCredentials: true,
  });
}

export function apiGetFileByDocumentId(id: string) {
  return axios.get(
    `${baseURL}/documents/${id}/files`,
    { withCredentials: true }
  );
}

export function apiCreateFilewithPdf(documentId:string, file:File){
  const formData = new FormData();
  formData.append('file',file);
  return axios.post(`${baseURL}/documents/${documentId}/files/upload`,formData,{
    headers: {

      'Content-Type': 'multipart/form-data'
    },
    withCredentials:true
  })
}

export function apiCreateFileWithUrl(documentId: string, sourceUrl:string){
  const payload = {sourceUrl:sourceUrl}
  return axios.post(`${baseURL}/documents/${documentId}/files/url`,payload,{withCredentials:true})
}

export function apiQueryQuestion(question: string){
  return axios.post(`${baseURL}/query`,{question:question},{withCredentials:true})
}