import { createCashPayment, createOrderMidtrans } from "../api/payment.api";

export const processPayment = async ({
  orderCode,
  amount,
  customer,
  table,
  method,
}) => {
  // CASH = langsung resolve
  if (method === "cash") {
    await createCashPayment({
      orderCode,
      grossAmount: amount,
      customerName: customer.name,
      customerPhone: customer.phone,
      tableId: table.tableId,
      tableNo: table.tableNo,
    });

    return;
  }

  const res = await createOrderMidtrans({
    order_id: orderCode,
    gross_amount: amount,
    customer_name: customer.name,
    customer_phone: customer.phone,
    tableNo: table.tableNo,
    tableId: table.tableId,
    method,
  });

  return new Promise((resolve, reject) => {
    if (!window.snap) {
      reject(new Error("Midtrans Snap not loaded"));
      return;
    }

    window.snap.pay(res.data.token, {
      onSuccess: resolve,
      onPending: () => reject(new Error("Payment pending")),
      onError: reject,
      onClose: () => reject(new Error("Payment cancelled")),
    });
  });
};
