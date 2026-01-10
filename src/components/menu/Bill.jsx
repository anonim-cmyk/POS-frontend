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
          }).format(totalWithTax)}
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
          onClick={() => placeOrder(paymentMethod)}
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

      {/* Invoice */}
      {showInvoice && orderInfo && (
        <Invoice
          orderInfo={orderInfo}
          setShowInvoice={(val) => {
            setShowInvoice(val);
            if (!val) {
              dispatch(removeCustomer());
              dispatch(removeAllItems());
            }
          }}
        />
      )}
    </>
  );
};

export default Bill;
