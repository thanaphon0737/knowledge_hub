import axios from "axios";
import { deleteSession } from "@/lib/session";
// const apiClient = axios.create({
//     baseURL: 'http://localhost:3000/api/v1',
//     withCredentials: true,
// })
export const apiLogin = (credentials: {email: string, password: string}) => {
  try {
    // return apiClient.post('/auth/login',credentials)
    const result = axios.post('http://localhost:3000/api/v1/auth/login',credentials,{
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true
    })
    
    return result
  } catch (err: any) {
    console.log(err);
  }
};

export const apiLogout = async () => {
    await deleteSession()
    console.log('logout')
}

export const apiGetProfile = () => {
    const result = axios.get('http://localhost:3000/api/v1/user/me',{withCredentials: true})
    return result
    // return apiClient.get('/users/me')
}
