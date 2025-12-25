import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/admin",
});

export const registerAdmin = (data) => API.post("/register", data);
export const loginAdmin = (data) => API.post("/login", data);
