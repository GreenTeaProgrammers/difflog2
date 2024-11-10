import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8081";

const createApi = () => {
  const apiInstance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return apiInstance;
};

export default createApi;