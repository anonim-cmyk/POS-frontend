import { createOrderMidtrans } from "../api/payment.api";

export const processPayment = ({
  orderCode,
  amount,
  customer,
  table,
  method,
}) => {
  // CASH = langsung resolve
  if (method === "cash") {
    return Promise.resolve();
  }

  return new Promise(async (resolve, reject) => {
    try {
      const res = await createOrderMidtrans({
        order_id: orderCode,
        gross_amount: amount,
        customer_name: customer.name,
        customer_phone: customer.phone,
        tableNo: table.tableNo,
        tableId: table.tableId,
        method,
      });

      if (!window.snap) {
        return reject(new Error("Midtrans Snap not loaded"));
      }

      window.snap.pay(res.data.token, {
        onSuccess: () => resolve(),
        onPending: () => reject(new Error("Payment pending")),
        onError: (err) => reject(err),
        onClose: () => reject(new Error("Payment cancelled")),
      });
    } catch (err) {
      reject(err);
    }
  });
};
