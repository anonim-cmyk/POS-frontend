import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { useTables } from "../hooks/useTables";
import TablesCard from "../components/tables/TablesCard";
import FullScreenLoader from "../components/shared/FullScreenLoader";

const TABLE_STATUS = {
  ALL: "all",
  BOOKED: "Booked",
};

const Tables = () => {
  const { tables, isLoading } = useTables();
  const [paymentInfo, setPaymentInfo] = useState(null);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "all";

  const handleStatusChange = (value) => {
    if (value === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ status: value });
    }
  };

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    const transactionStatus = searchParams.get("transaction_status");

    if (orderId && transactionStatus) {
      setPaymentInfo({ orderId, transactionStatus });
      navigate("/tables", { replace: true });
    }
  }, [searchParams, navigate]);

  if (isLoading) return <FullScreenLoader />;

  const filteredTables =
    status === "all"
      ? tables
      : tables.filter((table) => table.status === status);

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold">Tables</h1>
        </div>

        <div className="flex gap-4">
          {Object.values(TABLE_STATUS).map((value) => (
            <button
              key={value}
              onClick={() => handleStatusChange(value)}
              className={`text-[#ababab] text-lg px-5 py-2 font-semibold rounded-lg ${
                status === value ? "bg-[#383838]" : ""
              }`}
            >
              {value === "all" ? "All" : value}
            </button>
          ))}
        </div>
      </div>

      {paymentInfo?.transactionStatus === "settlement" && (
        <div className="text-green-500 text-center py-2 font-semibold">
          Payment Successful! Order ID: {paymentInfo.orderId}
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 px-16 py-4 pb-24 h-[450px] overflow-y-scroll scrollbar-hide">
        {filteredTables.map((table) => (
          <TablesCard
            key={table._id}
            id={table._id}
            name={table.tableNo}
            status={table.status}
            initials={table?.currentOrder?.customerDetails?.name || "-"}
            seats={table.seats}
          />
        ))}
      </div>

      <BottomNav />
    </section>
  );
};

export default Tables;
