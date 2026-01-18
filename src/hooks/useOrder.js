import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { buildOrderPayload, calculateTax } from "../utils/order.utils";
import { processPayment } from "../service/payment.service";
import { addOrder } from "../api/order.api";
import { updatedTable } from "../api/table.api";
import { useNavigate } from "react-router-dom";

export const useOrder = ({ cartData, customerData, total }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const isLockedRef = useRef(false);

  const tax = calculateTax(total);
  const totalWithTax = Math.round(total + tax);

  const orderMutation = useMutation({
    mutationFn: addOrder,
  });

  const placeOrder = async (paymentMethod) => {
    if (isLockedRef.current || !cartData.length) return;
    if (!paymentMethod) {
      enqueueSnackbar("Select payment method first", { variant: "warning" });
    }

    isLockedRef.current = true;
    setIsProcessing(true);

    const orderCode = `ORDER-${crypto.randomUUID()}`;

    try {
      // 1️⃣ Payment
      await processPayment({
        orderCode,
        amount: totalWithTax,
        customer: {
          name: customerData.customerName,
          phone: customerData.customerPhone,
          guests: customerData.guests,
        },
        table: customerData.table,
        method: paymentMethod,
      });

      // 2️⃣ Create order
      const res = await orderMutation.mutateAsync(
        buildOrderPayload({
          orderCode,
          customer: customerData,
          cart: cartData,
          total,
          tableId: customerData.table.tableId,
          paymentMethod,
        })
      );

      const orderData = res.data.data;
      navigate(`/invoice?orderCode=${orderCode}`);

      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["dishes"] });

      enqueueSnackbar("Order placed successfully!", { variant: "success" });
    } catch (err) {
      console.error("ORDER FLOW ERROR:", err);

      enqueueSnackbar(
        err?.response?.data?.message || err?.message || "Order failed",
        { variant: "error" }
      );
    } finally {
      setIsProcessing(false);
      isLockedRef.current = false;
    }
  };

  return {
    tax,
    totalWithTax,
    isProcessing,
    placeOrder,
  };
};
