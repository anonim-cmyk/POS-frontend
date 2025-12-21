import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { formatDateAndTime } from "../../utils";
import { enqueueSnackbar } from "notistack";
import { getOrders, updateOrderStatus, updateTableStatus } from "../../https";

const RecentOrders = () => {
  const queryClient = useQueryClient();

  // ✅ Mutation untuk update order status
  const orderStatusUpdateMutation = useMutation({
    mutationFn: async ({ orderId, orderStatus }) => {
      // ✅ hanya update order, table sudah diupdate otomatis di backend
      await updateOrderStatus({ orderId, orderStatus });
    },
    onSuccess: () => {
      console.log("✅ Order status updated successfully");
      enqueueSnackbar("Order status updated successfully", {
        variant: "success",
      });
      // Invalidate queries untuk refresh data
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
    onError: (error) => {
      console.error("❌ Failed to update order status:", error);
      enqueueSnackbar(
        error.response?.data?.message || "Failed to update order status",
        { variant: "error" }
      );
    },
  });

  // ✅ Fetch orders
  const {
    data: resData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await getOrders();
      console.log("📦 Raw orders response:", response);
      return response;
    },
    placeholderData: keepPreviousData,
    refetchInterval: 30000, // Refresh setiap 30 detik
  });

  // ✅ Parse orders dengan fallback multiple structure
  const orders = (() => {
    // Try different response structures
    if (Array.isArray(resData?.data?.data)) {
      console.log("✅ Using resData.data.data structure");
      return resData.data.data;
    }
    if (Array.isArray(resData?.data)) {
      console.log("✅ Using resData.data structure");
      return resData.data;
    }
    if (Array.isArray(resData)) {
      console.log("✅ Using resData structure");
      return resData;
    }
    console.warn("⚠️ Orders structure tidak dikenali:", resData);
    return [];
  })();

  console.log("📋 Parsed orders:", orders);

  // ✅ Handle error
  if (isError) {
    console.error("❌ Error fetching orders:", error);
    return (
      <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
        <div className="bg-red-900/20 border border-red-600 rounded p-4">
          <p className="text-red-400 font-semibold">Failed to load orders</p>
          <p className="text-red-300/70 text-sm mt-1">
            {error?.message || "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
        <h2 className="text-[#f5f5f5] text-xl font-semibold mb-4">
          Recent Orders
        </h2>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#333] rounded" />
          ))}
        </div>
      </div>
    );
  }

  // ✅ Handle status change
  const handleStatusChange = ({ orderId, orderStatus, tableId }) => {
    if (!orderId || !orderStatus) {
      console.error("❌ Missing required fields:", { orderId, orderStatus });
      enqueueSnackbar("Invalid order data", { variant: "error" });
      return;
    }

    console.log("🎯 Changing status:", { orderId, orderStatus, tableId });
    orderStatusUpdateMutation.mutate({ orderId, orderStatus, tableId });
  };

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
      <h2 className="text-[#f5f5f5] text-xl font-semibold mb-4">
        Recent Orders ({orders.length})
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[#f5f5f5]">
          <thead className="bg-[#333] text-[#ababab]">
            <tr>
              <th className="p-3">Order Code</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Items</th>
              <th className="p-3">Table No</th>
              <th className="p-3">Total</th>
              <th className="p-3 text-center">Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-gray-600 hover:bg-[#333] transition-colors"
                >
                  <td className="p-4 font-mono text-sm">
                    {order.orderCode || `#${order._id.slice(-6)}`}
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-semibold">
                        {order.customerDetails?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {order.customerDetails?.phone || "-"}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      className={`bg-[#1a1a1a] text-[#f5f5f5] border border-gray-500 p-2 rounded-lg focus:outline-none cursor-pointer transition-colors ${
                        order.orderStatus === "Completed"
                          ? "text-blue-400 border-blue-400"
                          : order.orderStatus === "Ready"
                          ? "text-green-500 border-green-500"
                          : "text-yellow-500 border-yellow-500"
                      }`}
                      value={order.orderStatus}
                      onChange={(e) => {
                        console.log("📝 Status dropdown changed:", {
                          from: order.orderStatus,
                          to: e.target.value,
                          orderId: order._id,
                        });
                        handleStatusChange({
                          orderId: order._id,
                          orderStatus: e.target.value,
                          tableId: order.table?._id || order.table,
                        });
                      }}
                      disabled={orderStatusUpdateMutation.isPending}
                    >
                      <option className="text-yellow-500" value="In Progress">
                        In Progress
                      </option>
                      <option className="text-green-500" value="Ready">
                        Ready
                      </option>
                      <option className="text-blue-400" value="Completed">
                        Completed
                      </option>
                    </select>
                  </td>
                  <td className="p-4 text-sm">
                    {formatDateAndTime(order.orderDate || order.createdAt)}
                  </td>
                  <td className="p-4">
                    <span className="bg-[#1a1a1a] px-3 py-1 rounded-full text-sm">
                      {order.items?.length || 0} Items
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="bg-purple-900/30 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
                      Table {order.table?.tableNo || "-"}
                    </span>
                  </td>
                  <td className="p-4 font-semibold">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(order.bills?.totalWithTax || 0)}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        order.paymentMethod === "cash"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-blue-900/30 text-blue-400"
                      }`}
                    >
                      {order.paymentMethod?.toUpperCase() || "N/A"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center text-white/60 py-8 font-semibold"
                >
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Loading Overlay */}
      {orderStatusUpdateMutation.isPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#262626] p-6 rounded-lg shadow-xl">
            <div className="flex items-center gap-3">
              <svg
                className="animate-spin h-6 w-6 text-blue-400"
                viewBox="0 0 24 24"
              >
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
              <span className="text-white font-semibold">
                Updating order status...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
