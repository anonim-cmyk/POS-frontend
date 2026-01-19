import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Invoice from "../components/invoice/Invoice";
import { getOrderByCode } from "../api/order.api";

const PaymentResult = () => {
  const [order, setOrder] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    if (!orderId) return navigate("/tables");

    getOrderByCode(orderId)
      .then((res) => setOrder(res.data))
      .catch(() => navigate("/tables"));
  }, [searchParams, navigate]);

  if (!order) return <p>Loading receipt...</p>;

  return <Invoice orderInfo={order} />;
};

export default PaymentResult;
