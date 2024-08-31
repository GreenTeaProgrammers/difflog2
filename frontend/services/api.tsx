import axios from "axios";

const createApi = (baseURL: string) => {
  const apiInstance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return apiInstance;
};

export default createApi;