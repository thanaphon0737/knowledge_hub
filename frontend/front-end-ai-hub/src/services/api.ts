import axios, { AxiosResponse } from "axios";
import { deleteSession } from "@/lib/session";
import { idID } from "@mui/material/locale";
// const apiClient = axios.create({
//     baseURL: 'http://localhost:3000/api/v1',
//     withCredentials: true,
// })
export const apiLogin = (credentials: { email: string; password: string }) => {
  try {
    // return apiClient.post('/auth/login',credentials)
    const result = axios.post(
      "http://localhost:3000/api/v1/auth/login",
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
  const result = axios.get("http://localhost:3000/api/v1/user/me", {
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
      "http://localhost:3000/api/v1/auth/register",
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
  return axios.get("http://localhost:3000/api/v1/documents", {
    withCredentials: true,
  });
}

export function apiCreateDocuments(data: {
  name: string;
  description: string;
}) {
  return axios.post("http://localhost:3000/api/v1/documents", data, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
}

export function apiGetDocumentById(id: string) {
  return axios.get(`http://localhost:3000/api/v1/documents/${id}`, {
    withCredentials: true,
  });
}

export function apiGetFileByDocumentId(id: string) {
  return axios.get(
    `http://localhost:3000/api/v1/documents/${id}/files`,
    { withCredentials: true }
  );
}
