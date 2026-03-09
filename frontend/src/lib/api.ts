import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  // config.headers?.set("Authorization", `Bearer`);

  return config;
});

api.interceptors.response.use(
  (response) => {
    const data = response.data;

    if (
      data &&
      typeof data === "object" &&
      "success" in data &&
      !data.success
    ) {
      return Promise.reject(new Error(data.error || data.message));
    }

    return response;
  },
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  },
);

export default api;
