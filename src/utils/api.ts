import axios from "axios";

// 1. Create the Axios instance with your base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Request Interceptor: Automatically attach the token
api.interceptors.request.use(
  (config) => {
    // Grab the token securely from local storage
    const token = localStorage.getItem("token");

    // If the token exists, attach it to the Authorization header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. Response Interceptor: Handle global errors (like expired tokens)
api.interceptors.response.use(
  (response) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx causes this function to trigger
    if (error.response && error.response.status === 401) {
      // If the backend says "Unauthorized", the token is likely expired or invalid.
      // Clear the dead token and optionally kick the user back to the login screen.
      console.warn("Unauthorized access. Token might be expired.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Uncomment the line below if you want to force redirect to login
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
