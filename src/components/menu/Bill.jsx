"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getTotalPrice } from "../../redux/slices/cartSlices";
import { removeCustomer } from "../../redux/slices/customerSlices";
import { removeAllItems } from "../../redux/slices/cartSlices";

import Invoice from "../invoice/Invoice";
import { useOrder } from "../../hooks/useOrder";

const Bill = () => {
  const dispatch = useDispatch();
  const cartData = useSelector((state) => state.cart);
  const customerData = useSelector((state) => state.customer);
  const total = useSelector(getTotalPrice);

  const [paymentMethod, setPaymentMethod] = useState("");

  const {
    tax,
    totalWithTax,
    isProcessing,
    orderInfo,
    showInvoice,
    setShowInvoice,
    placeOrder,
  } = useOrder({
    cartData,
    customerData,
    total,
    dispatch,
    removeCustomer,
    removeAllItems,
  });

  /* Load Midtrans */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.async = true;
    script.setAttribute(
      "data-client-key",
      import.meta.env.VITE_MIDTRANS_CLIENT_KEY
    );
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  return (
    <>
      {/* TOTAL */}
      <div className="px-5 mt-2 flex justify-between">
        <p>Items ({cartData.length})</p>
        <p>{total}</p>
      </div>

      <div className="px-5 mt-2 flex justify-between">
        <p>Tax</p>
        <p>{tax}</p>
      </div>

      <div className="px-5 mt-2 flex justify-between">
        <p>Total with Tax</p>
        <p>{totalWithTax}</p>
      </div>

      {/* PAYMENT */}
      <div className="flex gap-3 px-5 mt-4">
        {["Cash", "Online"].map((method) => (
          <button
            key={method}
            disabled={isProcessing}
            onClick={() => setPaymentMethod(method.toLowerCase())}
          >
            {method}
          </button>
        ))}
      </div>

      <div className="flex gap-3 px-5 mt-4">
        <button disabled={!orderInfo} onClick={() => setShowInvoice(true)}>
          Print Receipt
        </button>

        <button
          disabled={isProcessing}
          onClick={() => placeOrder(paymentMethod)}
        >
          {isProcessing ? "Processing..." : "Place Order"}
        </button>
      </div>

      {showInvoice && orderInfo && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}
    </>
  );
};

export default Bill;
