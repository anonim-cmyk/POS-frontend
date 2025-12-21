import React, { useState, useEffect } from "react";
import { getTotalPrice, removeAllItems } from "../../redux/slices/cartSlices";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { addOrder, updatedTable } from "../../https";
import { removeCustomer } from "../../redux/slices/customerSlices";
import Invoice from "../invoice/Invoice";

const Bill = () => {
  const dispatch = useDispatch();
  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);

  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

  const [paymentMethod, setPaymentMethod] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // ✅ prevent double submit

  // ✅ Load Midtrans Snap.js
  useEffect(() => {
    const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const midtransClientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

    const scriptTag = document.createElement("script");
    scriptTag.src = midtransScriptUrl;
    scriptTag.setAttribute("data-client-key", midtransClientKey);
    scriptTag.async = true;
    document.body.appendChild(scriptTag);

    return () => {
      document.body.removeChild(scriptTag);
    };
  }, []);

  // ✅ Mutasi Tambah Order
  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (res) => {
      console.log("✅ Order created:", res.data.data);
      const { data } = res.data;
      enqueueSnackbar("Order placed successfully!", { variant: "success" });

      setOrderInfo(data);
      setShowInvoice(true);

      // Update table status
      const tableData = {
        status: "Booked",
        orderId: data._id,
        tableId: data.table,
      };
      tableUpdateMutation.mutate(tableData);
    },
    onError: (err) => {
      console.error("❌ addOrder Error:", err.response?.data || err.message);
      enqueueSnackbar(err.response?.data?.message || "Failed to place order", {
        variant: "error",
      });
      setIsProcessing(false);
    },
  });

  // ✅ Mutasi Update Table
  const tableUpdateMutation = useMutation({
    mutationFn: (reqData) => updatedTable(reqData),
    onSuccess: () => {
      console.log("✅ Table updated, cleaning up state");
      dispatch(removeCustomer());
      dispatch(removeAllItems());
      setIsProcessing(false);
    },
    onError: (err) => {
      console.error("❌ tableUpdate Error:", err.response?.data || err.message);
      setIsProcessing(false);
    },
  });

  // ✅ Handle Place Order
  const handlePlaceOrder = async () => {
    if (isProcessing) {
      console.log("⚠️ Already processing order...");
      return;
    }

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

    // ✅ GENERATE orderCode HANYA SEKALI DI SINI
    const orderCode = `ORDER-${Date.now()}`;
    console.log("🔑 Generated orderCode:", orderCode);

    const orderPayload = {
      orderCode: orderCode, // ✅ kirim ke addOrder
      customerDetails: {
        name: customerData.customerName,
        phone: customerData.customerPhone,
        guests: customerData.guests,
      },
      orderStatus: "In Progress",
      bills: {
        total,
        tax,
        totalWithTax: totalPriceWithTax,
      },
      items: cartData,
      table: customerData.table.tableId,
      paymentMethod,
    };

    console.log("🚀 Order payload:", orderPayload);

    try {
      // 💵 CASH FLOW
      if (paymentMethod === "cash") {
        console.log("💵 Processing CASH payment...");

        // 1. Record payment
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/payment/create-order`,
          {
            order_id: orderCode, // ✅ sama dengan orderPayload.orderCode
            gross_amount: totalPriceWithTax,
            customer_name: customerData.customerName,
            customer_phone: customerData.customerPhone,
            tableNo: customerData.table.tableNo,
            tableId: customerData.table.tableId,
            method: "cash",
          },
          { withCredentials: true }
        );

        console.log("✅ Payment recorded");

        // 2. Create order (pakai orderCode yang SAMA)
        orderMutation.mutate(orderPayload);
      }

      // 💳 ONLINE FLOW
      if (paymentMethod === "online") {
        console.log("💳 Processing ONLINE payment...");

        // 1. Create payment & get snap token
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/payment/create-order`,
          {
            order_id: orderCode, // ✅ sama dengan orderPayload.orderCode
            gross_amount: totalPriceWithTax,
            customer_name: customerData.customerName,
            customer_phone: customerData.customerPhone,
            tableNo: customerData.table.tableNo,
            tableId: customerData.table.tableId,
            method: "online",
          },
          { withCredentials: true }
        );

        const snapToken = response.data.token;
        console.log("✅ Snap token received:", snapToken);

        // 2. Open Midtrans popup
        window.snap.pay(snapToken, {
          onSuccess: (result) => {
            console.log("✅ Payment success:", result);
            enqueueSnackbar("Payment successful!", { variant: "success" });

            // 3. Create order (pakai orderCode yang SAMA)
            orderMutation.mutate(orderPayload);
          },
          onPending: (result) => {
            console.log("⏳ Payment pending:", result);
            enqueueSnackbar("Payment pending...", { variant: "info" });
            setIsProcessing(false);
          },
          onError: (result) => {
            console.error("❌ Payment error:", result);
            enqueueSnackbar("Payment failed!", { variant: "error" });
            setIsProcessing(false);
          },
          onClose: () => {
            console.log("🚪 Payment popup closed");
            enqueueSnackbar("Payment cancelled", { variant: "warning" });
            setIsProcessing(false);
          },
        });
      }
    } catch (err) {
      console.error("❌ handlePlaceOrder error:", err);
      enqueueSnackbar(
        err.response?.data?.message || "Failed to process order",
        { variant: "error" }
      );
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Total Items */}
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">
          Items ({cartData.length})
        </p>
        <h1 className="text-[#f5f5f5] text-md font-bold">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(total)}
        </h1>
      </div>

      {/* Tax */}
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">Tax (5.25%)</p>
        <h1 className="text-[#f5f5f5] text-md font-bold">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(tax)}
        </h1>
      </div>

      {/* Total with Tax */}
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">
          Total with Tax
        </p>
        <h1 className="text-[#f5f5f5] text-md font-bold">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(totalPriceWithTax)}
        </h1>
      </div>

      {/* Payment Buttons */}
      <div className="flex items-center gap-3 px-5 mt-4">
        {["Cash", "Online"].map((method) => (
          <button
            key={method}
            onClick={() => setPaymentMethod(method.toLowerCase())}
            disabled={isProcessing}
            className={`px-4 py-3 w-full rounded-lg font-semibold transition-colors ${
              paymentMethod === method.toLowerCase()
                ? "bg-[#383737] text-white"
                : "bg-[#1f1f1f] text-[#ababab]"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {method}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 px-5 mt-4">
        <button
          onClick={() => setShowInvoice(true)}
          disabled={!orderInfo || isProcessing}
          className="bg-[#025cca] px-4 py-3 w-full rounded-lg text-[#f5f5f5] font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Print Receipt
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className="bg-[#f6b100] px-4 py-3 w-full rounded-lg text-[#1f1f1f] font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            "Place Order"
          )}
        </button>
      </div>

      {/* Invoice Modal */}
      {showInvoice && orderInfo && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}
    </>
  );
};

export default Bill;
