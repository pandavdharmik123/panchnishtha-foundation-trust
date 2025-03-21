import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie for accessing cookies

// Create an instance of Axios with default configuration
const axiosInstance = axios.create({
  baseURL:  '/api',//`${process.env.NEXT_PUBLIC_API_URL}/api` || "http://localhost:3000/api", // Change to your API base URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Ensures cookies are sent with requests
});

// Add an interceptor to attach the token from cookies if available
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined" && document.cookie) {
      const token = Cookies.get("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
