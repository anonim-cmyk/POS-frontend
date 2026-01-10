import api from "./http";

export const login = (data) => api.post("/api/user/login", data);
export const register = (data) => api.post("/api/user/register", data);
export const getApiData = () => api.get("/api/user");
export const logout = () => api.post("/api/user/logout");
