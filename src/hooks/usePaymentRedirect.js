import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getOrderByCode } from "../api/order.api";
import { useEffect } from "react";

export const usePaymentRedirect = () => {
  const [order, setOrder] = useState(null);
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("order_id");
  const status = searchParams.get("transaction_status");

  useEffect(() => {
    if (!orderId || !status) return;

    const fetchOrder = async () => {
      const res = await getOrderByCode(orderId);
      setOrder({
        ...res.data,
        paymentStatus: status,
      });
    };

    fetchOrder();
  }, [orderId, status]);

  return order;
};
