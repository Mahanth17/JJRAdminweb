import axios from "axios";

// --- Helper to clone FormData (for retrying requests) ---
function cloneFormData(formData) {
  const newFormData = new FormData();
  for (let [key, value] of formData.entries()) {
    newFormData.append(key, value);
  }
  return newFormData;
}

// --- Token Refresh Logic ---
const AUTH_API_URL = "https://hrms.anasolconsultancyservices.com/api/auth/refresh-token";
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

  // Request: Attach token
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

  // Response: Handle 401 and refresh token
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              return instance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshResponse = await axios.post(
            AUTH_API_URL,
            {},
            { withCredentials: true }
          );
          const { accessToken } = refreshResponse.data;
          localStorage.setItem("accessToken", accessToken);

          if (originalRequest.data instanceof FormData) {
            originalRequest.data = cloneFormData(originalRequest.data);
          }

          processQueue(null, accessToken);

          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = "/login";
          processQueue(refreshError);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// --- Example usage: export your main API instance ---
export const rootApi = createAxiosInstance("http://192.168.0.216:8080");