import { useEffect, useState } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTables } from "../https";
import TablesCard from "../components/tables/TablesCard";
import { useNavigate } from "react-router-dom";
import { useTables } from "../hooks/useTables";
import FullScreenLoader from "../components/shared/FullScreenLoader";
const Tables = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (
      params.has("order_id") ||
      params.has("status_code") ||
      params.has("transaction_status")
    ) {
      console.log("🧹 Cleaning up Midtrans redirect URL...");
      navigate("/tables", { replace: true });
    }
  }, [navigate]);

  const [status, setStatus] = useState("all");
  const { tables, isLoading } = useTables();

  // useEffect(() => {
  //   document.title = "POS | Tables";
  // }, []);

  if (isLoading) return <FullScreenLoader />;
  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Tables
          </h1>
        </div>
        <div className="flex items-center justify-around gap-4">
          <button
            onClick={() => setStatus("all")}
            className={`text-[#ababab] text-lg ${
              status === "all" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            All
          </button>
          <button
            onClick={() => setStatus("booked")}
            className={`text-[#ababab] text-lg ${
              status === "booked" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            Booked
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 px-16 py-4 pb-24 h-[450px] overflow-y-scroll scrollbar-hide">
        {tables.map((table) => {
          return (
            <TablesCard
              key={table._id}
              id={table._id}
              name={table.tableNo}
              status={table.status}
              initials={table?.currentOrder?.customerDetails.name}
              seats={table.seats}
            />
          );
        })}
      </div>

      <BottomNav />
    </section>
  );
};

export default Tables;
