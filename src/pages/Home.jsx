import Greetings from "../components/home/Greetings";
import MiniCard from "../components/home/MiniCard";
import PopularDishes from "../components/home/PopularDishes";
import RecentOrders from "../components/home/RecentOrders";
import BottomNav from "../components/shared/BottomNav";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import { useOrderDetail } from "../hooks/useOrderDetail";
import { formatRupiah } from "../utils";

const Home = () => {
  const { orders, isLoading } = useOrderDetail({ page: 1, limit: 1000 });

  // ✅ Hitung Total Earnings berdasarkan totalWithTax dari order completed
  const totalEarnings = orders
    .filter((o) => o.orderStatus === "Completed")
    .reduce((sum, o) => sum + (o.bills?.totalWithTax || 0), 0);

  // ✅ Hitung order sedang diproses
  const inProgress = orders.filter((o) => o.orderStatus !== "Completed").length;

  return (
    <>
      <section className="bg-[#1f1f1f] min-h-screen flex gap-3 pb-20">
        <div className="flex-[3] h-full overflow-y-auto scrollbar-hide">
          <Greetings />
          <div className="flex items-center w-full gap-3 px-8 mt-8">
            <MiniCard
              title="Total Earnings"
              icon={<BsCashCoin />}
              number={formatRupiah(totalEarnings)}
              footerNum={1.6}
            />
            <MiniCard
              title="In Progress"
              icon={<GrInProgress />}
              number={inProgress}
              footerNum={2.4}
            />
          </div>
          <RecentOrders />
        </div>
        <div className="flex-[2] h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide">
          <PopularDishes />
        </div>
      </section>
      <BottomNav />
    </>
  );
};

export default Home;
