import React, { useState, useEffect } from "react";
import { getTotalPrice, removeAllItems } from "../../redux/slices/cartSlices";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { addOrder, updatedTable } from "../../https";
import { removeCustomer } from "../../redux/slices/customerSlices";
import { useNavigate } from "react-router-dom";
import Invoice from "../invoice/Invoice";

const Bill = () => {
  const dispatch = useDispatch();
  // const navigate = useNavigate();
  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);

  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

  const [paymentMethod, setPaymentMethod] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null); // 🧾 Simpan data order

  // ===============================
  // 🔹 Load Midtrans Snap.js
  // ===============================
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

  // ===============================
  // 🔸 Mutasi Tambah Order
  // ===============================
  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (res) => {
      console.log("✅ Order created:", res.data.data);
      const { data } = res.data;
      enqueueSnackbar("Order placed successfully!", { variant: "success" });

      // simpan ke invoice
      setOrderInfo(data);
      setShowInvoice(true);

      // Update status meja
      const tableData = {
        status: "Booked",
        orderId: data._id,
        tableId: data.table,
      };
      tableUpdateMutation.mutate(tableData);
    },
    onError: (err) => {
      console.error("❌ addOrder Error:", err.response?.data || err.message);
      enqueueSnackbar("Failed to place order", { variant: "error" });
    },
  });

  // ===============================
  // 🔸 Mutasi Update Table
  // ===============================
  const tableUpdateMutation = useMutation({
    mutationFn: (reqData) => updatedTable(reqData),
    onSuccess: () => {
      dispatch(removeCustomer());
      dispatch(removeAllItems());
    },
    onError: (err) => {
      console.error("❌ tableUpdate Error:", err.response?.data || err.message);
    },
  });

  // ===============================
  // 🔸 Handle Place Order
  // ===============================
  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      enqueueSnackbar("Please select a payment method!", {
        variant: "warning",
      });
      return;
    }

    const orderPayload = {
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

    console.log("🚀 Sending order to backend:", orderPayload);

    // 💵 CASH FLOW
    if (paymentMethod === "cash") {
      try {
        const orderCode = "ORDER-" + Date.now();

        await axios.post(
          "http://localhost:8000/api/payment/create-order",
          {
            order_id: orderCode,
            gross_amount: totalPriceWithTax,
            customer_name: customerData.customerName,
            customer_phone: customerData.customerPhone,
            tableNo: customerData.table.tableNo,
            tableId: customerData.table.tableId,
            method: "cash", // ✅ pasti kebaca backend
          },
          { withCredentials: true }
        );

        orderMutation.mutate({ ...orderPayload, orderCode });
      } catch (err) {
        enqueueSnackbar("Failed to record cash payment", { variant: "error" });
      }
    }

    // 💳 ONLINE FLOW (MIDTRANS SNAP)
    if (paymentMethod === "online") {
      try {
        const orderCode = "ORDER-" + Date.now();

        const response = await axios.post(
          "http://localhost:8000/api/payment/create-order",
          {
            order_id: orderCode,
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

        window.snap.pay(snapToken, {
          onSuccess: () => {
            enqueueSnackbar("Payment successful!", { variant: "success" });

            // ✅ ORDER CODE DIPAKSA SAMA DARI PAYMENT
            orderMutation.mutate({ ...orderPayload, orderCode: orderCode });
          },
          onError: () => {
            enqueueSnackbar("Payment failed!", { variant: "error" });
          },
        });
      } catch (err) {
        console.error("❌ Midtrans Error:", err);
        enqueueSnackbar("Failed to create Midtrans transaction", {
          variant: "error",
        });
      }
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
            className={`px-4 py-3 w-full rounded-lg font-semibold ${
              paymentMethod === method.toLowerCase()
                ? "bg-[#383737] text-white"
                : "bg-[#1f1f1f] text-[#ababab]"
            }`}
          >
            {method}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 px-5 mt-4">
        <button
          onClick={() => setShowInvoice(true)}
          className="bg-[#025cca] px-4 py-3 w-full rounded-lg text-[#f5f5f5] font-semibold text-lg"
        >
          Print Receipt
        </button>
        <button
          onClick={handlePlaceOrder}
          className="bg-[#f6b100] px-4 py-3 w-full rounded-lg text-[#1f1f1f] font-semibold text-lg"
        >
          Place Order
        </button>
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}
    </>
  );
};

export default Bill;
