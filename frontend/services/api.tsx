import axios from "axios";

const createApi = (baseURL: string) => {
  const apiInstance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return apiInstance;
};

export default createApi;