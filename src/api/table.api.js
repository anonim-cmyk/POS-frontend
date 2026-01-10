import api from "./http";

export const addTable = (data) => api.post("/api/table", data);
export const getTables = () => api.get("/api/table");
export const updatedTable = ({ tableId, ...tableData }) =>
  api.put(`/api/table/${tableId}`, tableData);
export const updateTableStatus = ({ tableId, status }) =>
  api.patch(`/api/table/${tableId}/status`, { status });
export const deleteTable = (tableId) => api.delete(`/api/table/${tableId}`);
