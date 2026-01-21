import api from "./http";

export const getSalesReport = (params = {}) => api.get(`/api/sales/`, params);
