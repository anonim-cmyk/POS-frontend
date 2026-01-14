import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const usePaymentRedirect = () => {
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    const status = searchParams.get("transaction_status");

    if (!orderId || !status) return;

    setPaymentInfo({ orderId, transactionStatus: status });
    navigate("/tables", { replace: true });
  }, [searchParams, navigate]);

  return paymentInfo;
};
