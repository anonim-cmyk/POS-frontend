import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

import { addOrder, updatedTable, createOrderMidtrans } from "../https";

const TAX_RATE = 5.25;

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

  const tax = (total * TAX_RATE) / 100;
  const totalWithTax = total + tax;

  /* =========================
     Mutations
  ========================== */
  const tableUpdateMutation = useMutation({
    mutationFn: updatedTable,
    onSuccess: () => {
      dispatch(removeCustomer());
      dispatch(removeAllItems());
      setIsProcessing(false);
    },
    onError: () => setIsProcessing(false),
  });

  const orderMutation = useMutation({
    mutationFn: addOrder,
    onSuccess: (res) => {
      const { data } = res.data;

      enqueueSnackbar("Order placed successfully!", {
        variant: "success",
      });

      setOrderInfo(data);
      setShowInvoice(true);

      tableUpdateMutation.mutate({
        status: "Booked",
        orderId: data._id,
        tableId: data.table,
      });
    },
    onError: (err) => {
      enqueueSnackbar(err.response?.data?.message || "Failed to place order", {
        variant: "error",
      });
      setIsProcessing(false);
    },
  });

  /* =========================
     Helpers
  ========================== */
  const buildOrderPayload = (orderCode, paymentMethod) => ({
    orderCode,
    customerDetails: {
      name: customerData.customerName,
      phone: customerData.customerPhone,
      guests: customerData.guests,
    },
    orderStatus: "In Progress",
    bills: {
      total,
      tax,
      totalWithTax,
    },
    items: cartData,
    table: customerData.table.tableId,
    paymentMethod,
  });

  /* =========================
     Main Handler
  ========================== */
  const placeOrder = useCallback(
    async (paymentMethod) => {
      if (isProcessing) return;

      if (!paymentMethod) {
        enqueueSnackbar("Please select a payment method!", {
          variant: "warning",
        });
        return;
      }

      if (cartData.length === 0) {
        enqueueSnackbar("Cart is empty!", { variant: "warning" });
        return;
      }

      setIsProcessing(true);

      const orderCode = `ORDER-${Date.now()}`;
      const payload = buildOrderPayload(orderCode, paymentMethod);

      try {
        // 🔹 CREATE PAYMENT (BACKEND)
        const paymentRes = await createOrderMidtrans({
          order_id: orderCode,
          gross_amount: totalWithTax,
          customer_name: customerData.customerName,
          customer_phone: customerData.customerPhone,
          tableNo: customerData.table.tableNo,
          tableId: customerData.table.tableId,
          method: paymentMethod,
        });

        // 🔹 CASH
        if (paymentMethod === "cash") {
          orderMutation.mutate(payload);
        }

        // 🔹 ONLINE
        if (paymentMethod === "online") {
          window.snap.pay(paymentRes.data.token, {
            onSuccess: () => orderMutation.mutate(payload),
            onPending: () => setIsProcessing(false),
            onError: () => setIsProcessing(false),
            onClose: () => setIsProcessing(false),
          });
        }
      } catch (err) {
        enqueueSnackbar(
          err.response?.data?.message || "Failed to process order",
          { variant: "error" }
        );
        setIsProcessing(false);
      }
    },
    [cartData, customerData, total, isProcessing]
  );

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
