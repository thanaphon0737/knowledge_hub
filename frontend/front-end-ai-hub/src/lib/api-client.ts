import axios from "axios";
import { createClient } from "@/lib/supabase/client";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});
// request interceptor to add Authorization header
apiClient.interceptors.request.use(
  async (config) => {
    // This function runs BEFORE each request is sent
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // If a session exists, add the Authorization header
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    // IMPORTANT: return the config object to continue the request
    return config;
  },
  (error) => {
    // This function handles errors in the request setup
    return Promise.reject(error);
  }
);

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
