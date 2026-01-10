import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { buildOrderPayload, calculateTax } from "../utils/order.utils";
import { processPayment } from "../service/payment.service";
import { addOrder } from "../api/order.api";
import { updatedTable } from "../api/table.api";

export const useOrder = ({
  cartData,
  customerData,
  total,
  dispatch,
  removeCustomer,
  removeAllItems,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const isLockedRef = useRef(false);

  const tax = calculateTax(total);
  const totalWithTax = Math.round(total + tax);

  const orderMutation = useMutation({
    mutationFn: addOrder,
  });

  const placeOrder = async (paymentMethod) => {
    if (isLockedRef.current || !cartData.length) return;

    isLockedRef.current = true;
    setIsProcessing(true);

    const orderCode = `ORDER-${crypto.randomUUID()}`;

    try {
      // 1️⃣ Payment
      await processPayment({
        orderCode,
        amount: totalWithTax,
        customer: customerData,
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

      const order = {
        ...res.data.data,
        customerDetails: customerData,
      };

      // 3️⃣ Update table (jangan sampai gagal silent)
      try {
        await updatedTable({
          tableId: order.table,
          status: "Booked",
          orderId: order._id,
        });
      } catch (err) {
        console.error("Update table failed", err);
      }

      enqueueSnackbar("Order placed successfully!", { variant: "success" });

      setOrderInfo(order);
      setShowInvoice(true);
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
    orderInfo,
    showInvoice,
    setShowInvoice,
    placeOrder,
  };
};
