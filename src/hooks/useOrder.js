import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { buildOrderPayload, calculateTax } from "../utils/order.utils";
import { processPayment } from "../service/payment.service";
import { addOrder } from "../api/order.api";
import { updatedTable } from "../api/table.api";

export const useOrder = ({ cartData, customerData, total }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const isLockedRef = useRef(false);
  const queryClient = useQueryClient();

  const tax = calculateTax(total);
  const totalWithTax = Math.round(total + tax);

  const orderMutation = useMutation({ mutationFn: addOrder });

  const placeOrder = async (paymentMethod) => {
    if (isLockedRef.current || !cartData.length) return;
    isLockedRef.current = true;
    setIsProcessing(true);

    const orderCode = `ORDER-${crypto.randomUUID()}`;

    try {
      // Payment (Midtrans / Cash)
      const paymentResult = await processPayment({
        orderCode,
        amount: totalWithTax,
        customer: customerData,
        table: customerData.table,
        method: paymentMethod,
      });

      // Create Order
      const res = await orderMutation.mutateAsync(
        buildOrderPayload({
          orderCode,
          customer: customerData,
          cart: cartData,
          total,
          tableId: customerData.table.tableId,
          paymentMethod,
          paymentStatus: paymentResult.status,
        })
      );

      const order = {
        ...res.data.data,
        customerDetails: {
          name: customerData.customerName,
          phone: customerData.customerPhone,
          guests: customerData.guests,
        },
        paymentStatus: paymentResult.status,
        paymentMethod,
        orderCode,
        items: cartData,
        bills: { total, tax, totalWithTax },
        paymentData: paymentResult,
      };

      // Update table
      await updatedTable({
        tableId: order.table,
        status: "Booked",
        orderId: order._id,
      });

      queryClient.invalidateQueries(["tables"]);
      queryClient.invalidateQueries(["orders"]);

      setOrderInfo(order);

      if (paymentMethod === "cash") setShowInvoice(true);

      enqueueSnackbar(
        paymentResult.status === "pending"
          ? "Order placed! Payment pending."
          : "Order placed successfully!",
        { variant: paymentResult.status === "pending" ? "warning" : "success" }
      );
    } catch (err) {
      enqueueSnackbar(err.message || "Order failed", { variant: "error" });
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
