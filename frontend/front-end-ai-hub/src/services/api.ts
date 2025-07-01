import axios from "axios";
import { createSession,deleteSession } from "@/lib/session";
// const apiClient = axios.create({
//     baseURL: 'http://localhost:3000/api/v1',
//     withCredentials: true,
// })
export const apiLogin = async (credentials: {email: string, password: string}) => {
  try {
    // return apiClient.post('/auth/login',credentials)
    const result = await axios.post('http://localhost:3000/api/v1/auth/login',credentials,{
        headers: {
            'Content-Type': 'application/json'
        }
    })
    if(!result){
        console.log('cant login')
    }
    await createSession(result.data.token)
    
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
    const result = axios.get('http://localhost:3000/api/v1/user/me')
    return result
    // return apiClient.get('/users/me')
}
