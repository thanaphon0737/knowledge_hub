import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BACKEND_LOCAL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    if (status === 404) {
      // Just pass the error along silently.
      return Promise.reject(error);
    }

    // Handle other global errors here. For example:
    if (status === 401) {
      console.log("User is not authorized. Redirecting to login.");
      // window.location.href = '/login';
    } else {
      // For any other error, it's unexpected, so we can log it.
      console.error("An unexpected API error occurred:", error);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
