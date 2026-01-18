import { createOrderMidtrans } from "../api/payment.api";

export const processPayment = async ({
  orderCode,
  amount,
  customer,
  table,
  method,
}) => {
  const res = await createOrderMidtrans({
    order_id: orderCode,
    gross_amount: amount,
    method,
    customer_name: customer.name,
    customer_phone: customer.phone,
    tableNo: table.tableNo,
    tableId: table.tableId,
  });

  if (method === "online") {
    const token = res.data.data.snapToken;

    if (!token) throw new Error("Snap token is missing!");

    return new Promise((resolve, reject) => {
      window.snap.pay(token, {
        onSuccess: resolve,
        onPending: resolve, // pending = tetap lanjut
        onError: reject,
        onClose: () => reject(new Error("Payment cancelled")),
      });
    });
  }

  return res.data.data;
};
