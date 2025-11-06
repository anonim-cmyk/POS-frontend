import { useQuery } from "@tanstack/react-query";
import { getPayments } from "../../https";
import { format } from "date-fns";

const PaymentTable = () => {
  const {
    data: payments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await getPayments();
      return res.data?.data || []; // ambil array di dalam res.data.data
    },
  });

  if (isLoading) return <p>Loading payments...</p>;
  if (error) return <p>Error loading payments: {error.message}</p>;

  console.log("Payments data:", payments);

  // ✅ Pastikan payments adalah array agar tidak error
  const safePayments = Array.isArray(payments) ? payments : [];

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-semibold mb-4">Payments</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#2a2a2a] text-left">
            <th className="p-3">Order ID</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Status</th>
            <th className="p-3">Method</th>
            <th className="p-3">Email</th>
            <th className="p-3">Created At</th>
          </tr>
        </thead>
        <tbody>
          {safePayments.map((p) => (
            <tr
              key={p._id}
              className="border-b border-[#333] hover:bg-[#1e1e1e]"
            >
              <td className="p-3">{p.orderId}</td>
              <td className="p-3">Rp {p.amount.toLocaleString()}</td>
              <td className="p-3">{p.status}</td>
              <td className="p-3">{p.method}</td>
              <td className="p-3">{p.email}</td>
              <td className="p-3">
                {format(new Date(p.createdAt), "dd MMM yyyy HH:mm")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;
