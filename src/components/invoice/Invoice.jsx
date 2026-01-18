import React, { useRef } from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa6";
import { FaPrint, FaTimes } from "react-icons/fa";

const Invoice = ({ orderInfo, setShowInvoice }) => {
  console.log("order info", orderInfo);

  const invoiceRef = useRef(null);

  const handlePrint = () => {
    const printContent = invoiceRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");

    WinPrint.document.write(`
      <html>
        <head>
          <title>Order Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt-container { width: 300px; border: 1px solid #ddd; padding: 10px; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 1000);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  console.log(orderInfo.items);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-[500px] max-h-[90vh] flex flex-col border border-gray-200">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-green-500 rounded-full flex items-center justify-center bg-green-500 shadow-lg">
              <FaCheck className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Order Receipt
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Thank you for your order!
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInvoice(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500 text-lg sm:text-xl" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div ref={invoiceRef}>
            {/* Order Info */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded"></span>
                Order Information
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice ID:</span>
                  <span className="font-semibold text-gray-800">
                    {orderInfo._id || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(orderInfo.orderDate || Date.now()).toLocaleString(
                      "id-ID"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold text-gray-800">
                    {orderInfo.customerDetails?.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold text-gray-800">
                    {orderInfo.customerDetails?.phone || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-semibold text-gray-800">
                    {orderInfo.customerDetails?.guests || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-green-500 rounded"></span>
                Items Ordered
              </h3>
              <div className="space-y-3">
                {orderInfo.items?.map((item, index) => (
                  <div
                    key={index}
                    className="pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <span className="text-xs sm:text-sm font-medium text-gray-800">
                          {item.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          × {item.quantity}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-800 ml-2">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500 italic">
                      @{formatCurrency(item.pricePerQuantity)} per item
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bills */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-purple-500 rounded"></span>
                Payment Summary
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(orderInfo.bills?.total || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(orderInfo.bills?.tax || 0)}
                  </span>
                </div>
                <div className="pt-2 border-t-2 border-gray-200 flex justify-between">
                  <span className="font-bold text-gray-800">Grand Total:</span>
                  <span className="text-base sm:text-lg font-bold text-green-600">
                    {formatCurrency(orderInfo.bills?.totalWithTax || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-orange-500 rounded"></span>
                Payment Details
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-semibold text-gray-800">
                    {orderInfo.paymentMethod || "-"}
                  </span>
                </div>

                {orderInfo.paymentMethod === "Online" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono text-xs text-gray-800">
                        {orderInfo.paymentData?.order_id || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-xs text-gray-800">
                        {orderInfo.paymentData?.transaction_id || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        {orderInfo.paymentData?.transaction_status || "Pending"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Type:</span>
                      <span className="font-semibold text-gray-800 uppercase">
                        {orderInfo.paymentData?.payment_type || "-"}
                      </span>
                    </div>
                  </>
                )}

                {orderInfo.paymentMethod === "Cash" && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        orderInfo.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {orderInfo.paymentStatus === "Paid" ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-200 bg-white rounded-b-2xl">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            <FaPrint className="text-sm sm:text-base" />
            Print Receipt
          </button>
          <button
            onClick={() => setShowInvoice(false)}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
          >
            <FaTimes className="text-sm sm:text-base" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
