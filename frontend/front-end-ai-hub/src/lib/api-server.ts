import axios from "axios";
import { cookies } from "next/headers";

// We create a new, separate Axios instance for server-side calls.
const serverApiClient = axios.create({
  // When running inside Docker, we use the internal service name.
  // When running locally, you might use http://localhost:3000
  // baseURL: "http://localhost:3000/api/v1",
  baseURL: process.env.NEXT_PUBLIC_API_BACKEND_LOCAL,
});

/**
 * A server-side function to get a specific document.
 * It reads the auth cookie and forwards it in the Authorization header.
 */
export async function apiGetDocumentServer(id: string) {
  // 1. Read the cookie from the incoming browser request.
  //    The `cookies()` function from `next/headers` gives us server-side access to the request cookies.
  const tokenCookie = (await cookies()).get("access_token");

  if (!tokenCookie) {
    // If there's no cookie, we know the user isn't logged in.
    console.log("No auth token cookie found on server.");
    throw new Error("Not authenticated");
  }

  // 2. Prepare the authorization header in the standard "Bearer" format.
  //    This is how we will pass the token to our backend.
  const headers = {
    Authorization: `Bearer ${tokenCookie.value}`,
  };

  // 3. Make the API call, passing the custom headers.
  try {
    const response = await serverApiClient.get(`/documents/${id}`, { headers });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Log more specific details on the server for easier debugging.
      
      if (error.response?.status === 401) {
        // The token might be invalid or expired
        console.error("Server-side auth error: Invalid token");
      }else if (error.response?.status == 404) {
        console.log("File not created yet, which is okay.");
      } else {
        console.error("Server-side API call failed:", {
          status: error.response?.status,
          data: error.response?.data,
        });
      }
    }
    // Re-throw the error to be caught by error.tsx or notFound()
    throw new Error("Failed to fetch document data from server.");
  }
}

export async function apiGetFilesServer(id: string) {
  const tokenCookie = (await cookies()).get("access_token");

  if (!tokenCookie) {
    // If there's no cookie, we know the user isn't logged in.
    console.log("No auth token cookie found on server.");
    throw new Error("Not authenticated");
  }

  // 2. Prepare the authorization header in the standard "Bearer" format.
  //    This is how we will pass the token to our backend.
  const headers = {
    Authorization: `Bearer ${tokenCookie.value}`,
  };

  // 3. Make the API call, passing the custom headers.
  try {
    const response = await serverApiClient.get(`/documents/${id}/files`, {
      headers,
    });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Log more specific details on the server for easier debugging.
      if (error.response?.status === 401) {
        // The token might be invalid or expired
        console.error("Server-side auth error: Invalid token");
      } else if (error.response?.status == 404) {
        console.log("File not created yet, which is okay.");
      } else {
        console.error("Server-side API call failed:", {
          status: error.response?.status,
          data: error.response?.data,
        });
      }
    }
    // Re-throw the error to be caught by error.tsx or notFound()
    throw new Error("Failed to fetch files data from server.");
  }
}
