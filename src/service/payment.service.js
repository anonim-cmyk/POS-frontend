import { createOrderMidtrans } from "../api/payment.api";

export const processPayment = async ({
  orderCode,
  amount,
  customer,
  table,
  method,
  onSuccess,
  onError,
}) => {
  if (method === "cash") {
    onSuccess();
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

  window.snap.pay(res.data.token, {
    onSuccess,
    onPending: onError,
    onError,
    onclose: onError,
  });
};
