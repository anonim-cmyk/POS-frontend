import { useState, useRef } from "react";
import { enqueueSnackbar } from "notistack";
import { buildOrderPayload, calculateTax } from "../utils/order.utils";
import { addOrder } from "../api/order.api";
import { createOrderMidtrans } from "../api/payment.api";

// Constants
const PAYMENT_METHODS = {
  CASH: "cash",
  ONLINE: "online",
};

const SNACKBAR_MESSAGES = {
  ORDER_SUCCESS: "Order placed successfully",
  ORDER_FAILED: "Failed to place order",
  PAYMENT_SUCCESS: "Payment successful",
  PAYMENT_PENDING: "Waiting for payment",
  PAYMENT_FAILED: "Payment failed",
  INVALID_CART: "Cart is empty",
};

export const useOrder = ({ cartData, customerData, total }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState(null);
  const lockRef = useRef(false);

  const tax = calculateTax(total);
  const totalWithTax = total + tax;

  /**
   * Validates if order can be placed
   */
  const validateOrder = () => {
    if (!cartData?.length) {
      enqueueSnackbar(SNACKBAR_MESSAGES.INVALID_CART, { variant: "warning" });
      return false;
    }
    return true;
  };

  /**
   * Creates order in the system
   */
  const createOrder = async () => {
    const orderPayload = buildOrderPayload({
      customer: customerData,
      cart: cartData,
      total,
      tableId: customerData.table.tableId,
    });

    const response = await addOrder(orderPayload);
    return response?.data?.data;
  };

  /**
   * Handles cash payment flow
   */
  const handleCashPayment = async (orderId) => {
    const payment = await createOrderMidtrans({
      orderId,
      paymentMethod: PAYMENT_METHODS.CASH,
    });
    return payment;
  };

  /**
   * Handles online payment flow with Midtrans Snap
   */
  const handleOnlinePayment = async (orderId) => {
    const payment = await createOrderMidtrans({
      orderId,
      paymentMethod: PAYMENT_METHODS.ONLINE,
    });

    const snapToken = payment?.data?.snapToken;
    if (!snapToken) {
      throw new Error("Snap token not received from payment gateway");
    }

    // Open Midtrans payment popup
    return new Promise((resolve, reject) => {
      window.snap.pay(snapToken, {
        onSuccess: (result) => {
          enqueueSnackbar(SNACKBAR_MESSAGES.PAYMENT_SUCCESS, {
            variant: "success",
          });
          resolve({ ...payment, result });
        },
        onPending: (result) => {
          enqueueSnackbar(SNACKBAR_MESSAGES.PAYMENT_PENDING, {
            variant: "warning",
          });
          resolve({ ...payment, result });
        },
        onError: (error) => {
          enqueueSnackbar(SNACKBAR_MESSAGES.PAYMENT_FAILED, {
            variant: "error",
          });
          reject(error);
        },
        onClose: () => {
          // User closed the popup
          resolve(payment);
        },
      });
    });
  };

  /**
   * Processes payment based on selected method
   */
  const processPayment = async (orderId, paymentMethod) => {
    switch (paymentMethod) {
      case PAYMENT_METHODS.CASH:
        return await handleCashPayment(orderId);

      case PAYMENT_METHODS.ONLINE:
        return await handleOnlinePayment(orderId);

      default:
        throw new Error(`Invalid payment method: ${paymentMethod}`);
    }
  };

  /**
   * Main function to place order with payment
   */
  const placeOrder = async (paymentMethod) => {
    // Prevent concurrent requests
    if (lockRef.current) {
      console.warn("Order already in progress");
      return null;
    }

    // Validate before processing
    if (!validateOrder()) {
      return null;
    }

    lockRef.current = true;
    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create Order
      const order = await createOrder();
      setOrderInfo(order);

      // Step 2: Process Payment
      const payment = await processPayment(order._id, paymentMethod);
      setPaymentInfo(payment);

      enqueueSnackbar(SNACKBAR_MESSAGES.ORDER_SUCCESS, {
        variant: "success",
      });

      return { order, payment };
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        SNACKBAR_MESSAGES.ORDER_FAILED;

      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });

      // Log error for monitoring (Sentry, LogRocket, etc.)
      console.error("Order placement failed:", {
        error: err,
        paymentMethod,
        customerId: customerData?.id,
      });

      return null;
    } finally {
      setIsProcessing(false);
      lockRef.current = false;
    }
  };

  /**
   * Reset order state
   */
  const resetOrder = () => {
    setOrderInfo(null);
    setPaymentInfo(null);
    setError(null);
  };

  return {
    // Computed values
    tax,
    totalWithTax,

    // State
    isProcessing,
    orderInfo,
    paymentInfo,
    error,

    // Actions
    placeOrder,
    resetOrder,
  };
};
