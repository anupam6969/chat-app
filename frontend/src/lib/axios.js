 import axios from "axios";

 export const axiosInstance = axios.create({
   baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "https://chat-app-2515.onrender.com/api",
   withCredentials: true,
 });
