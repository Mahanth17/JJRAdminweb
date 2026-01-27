import axios from "axios";

// --- Helper to clone FormData (for retrying requests) ---
function cloneFormData(formData) {
  const newFormData = new FormData();
  for (let [key, value] of formData.entries()) {
    newFormData.append(key, value);
  }
  return newFormData;
}

// --- Token Refresh Logic (Optional - if you have refresh token endpoint) ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- Main Axios Instance Factory ---
export const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
  });

  // Request: Attach Bearer token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response: Handle 401 (unauthorized)
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If 401 and not already retried
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Clear token and redirect to login
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        
        return Promise.reject(error);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// --- Export API instances ---
export const rootApi = createAxiosInstance("http://192.168.0.144:8082");
export const categoryApi = createAxiosInstance("http://192.168.0.144:8082");
export const orderApi = createAxiosInstance("http://192.168.0.144:8082");