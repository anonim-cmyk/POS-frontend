import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Invoice from "../components/invoice/Invoice";
import { getOrderByCode } from "../api/order.api";

const PaymentResult = () => {
  const [order, setOrder] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("order_id");
  const status = searchParams.get("transaction_status");

  useEffect(() => {
    if (!orderId || !status) return navigate("/tables");

    const fetchOrder = async () => {
      try {
        const res = await getOrderByCode(orderId);
        setOrder({
          ...res.data,
          paymentStatus: status, // update status dari Midtrans
        });
      } catch {
        navigate("/tables");
      }
    };
    fetchOrder();
  }, [orderId, status, navigate]);

  if (!order) return <p>Loading receipt...</p>;

  return <Invoice orderInfo={order} />;
};

export default PaymentResult;
