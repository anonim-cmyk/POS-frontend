import api from "./http";

export const createOrderMidtrans = (data) =>
  api.post("/api/payment/create-order", data);

export const verifyPaymentMidtrans = (data) =>
  api.post("/api/payment/verify-payment", data);

export const getPayments = async ({
  page = 1,
  limit = 10,
  status = "",
  period = "",
} = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.append("status", status);
  if (period) params.append("period", period);

  const res = await api.get(`/api/payment/filtered?${params.toString()}`);
  console.log("res payment: ", res.data);

  return {
    data: res.data?.data || [],
    totalPage: res.data?.totalPage || 1,
    totalAmount: res.data?.totalAmount || 0,
  };
};
