import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BACKEND_LOCAL,
    withCredentials: true,

})

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status == 401){
            if(typeof window !== 'undefined'){
                window.location.href = '/login'
            }

        }
        return Promise.reject(error);
    }
)

export default apiClient;