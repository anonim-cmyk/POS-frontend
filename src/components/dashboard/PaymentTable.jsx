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
      return res.data?.data || [];
    },
  });

  if (isLoading) return <p>Loading payments...</p>;
  if (error) return <p>Error loading payments: {error.message}</p>;

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
            <th className="p-3">Customer Name</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Created At</th>
          </tr>
        </thead>
        <tbody>
          {safePayments.length > 0 ? (
            safePayments.map((p) => console.log(p))
          ) : (
            <tr>
              <td colSpan="7">
                <p className="text-center text-white py-4 font-semibold">
                  No payments found.
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;
