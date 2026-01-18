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

  const queryClient = useQueryClient();
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
      const paymentResult = await processPayment({
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
          paymentStatus: paymentResult.status, // ✅ simpan status payment
        })
      );

      const order = {
        ...res.data.data,
        customerDetails: {
          name: customerData.customerName,
          phone: customerData.customerPhone,
          guests: customerData.guests,
        },
        paymentStatus: paymentResult.status, // ✅ untuk ditampilkan di invoice
      };

      // 3️⃣ Update table
      try {
        await updatedTable({
          tableId: order.table,
          status: "Booked",
          orderId: order._id,
        });

        queryClient.invalidateQueries({ queryKey: ["tables"] });
        queryClient.invalidateQueries({ queryKey: ["dishes"] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      } catch (err) {
        console.error("Update table failed", err);
      }

      // ✅ Notifikasi sesuai status
      if (paymentResult.status === "pending") {
        enqueueSnackbar("Order placed! Payment is pending.", {
          variant: "warning",
        });
      } else {
        enqueueSnackbar("Order placed successfully!", {
          variant: "success",
        });
      }

      setOrderInfo(order);
      setShowInvoice(true); // ✅ Invoice tetap muncul
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
