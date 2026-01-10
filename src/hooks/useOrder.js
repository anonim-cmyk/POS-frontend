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
    onSuccess: ({ data }) => {
      enqueueSnackbar("Order placed successfully!", { variant: "success" });

      setOrderInfo(data.data);
      setShowInvoice(true);

      updatedTable({
        tableId: data.data.table,
        status: "Booked",
        orderId: data.data._id,
      });

      dispatch(removeCustomer());
      dispatch(removeAllItems());
      setIsProcessing(false);
      isLockedRef.current = false;
    },
    onError: (err) => {
      enqueueSnackbar(err.response?.data?.message || "Order failed", {
        variant: "error",
      });
      setIsProcessing(false);
      isLockedRef.current = false;
    },
  });

  const placeOrder = async (paymentMethod) => {
    if (isLockedRef.current || !cartData.length) return;

    isLockedRef.current = true;
    setIsProcessing(true);

    const orderCode = `ORDER-${crypto.randomUUID()}`;

    const payload = buildOrderPayload({
      orderCode,
      customer: customerData,
      cart: cartData,
      total,
      tableId: customerData.table.tableId,
      paymentMethod,
    });

    try {
      await processPayment({
        orderCode,
        amount: totalWithTax,
        customer: customerData,
        table: customerData.table,
        method: paymentMethod,
        onSuccess: () => orderMutation.mutate(payload),
        onError: () => {
          setIsProcessing(false);
          isLockedRef.current = false;
        },
      });
    } catch {
      enqueueSnackbar("Payment failed", { variant: "error" });
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
