import { CiSearch } from "react-icons/ci";
import OrderList from "./OrderList";
import { useOrderDetail } from "../../hooks/useOrderDetail";
import { useDispatch, useSelector } from "react-redux";
import { setSearchTerm } from "../../redux/slices/searchSlice";
import { useDebounce } from "../../hooks/useDebounce";
import { useSearchParams } from "react-router-dom";

const RecentOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";

  const debouncedSearchTerm = useDebounce(search, 400);

  const { orders, meta, isLoading } = useOrderDetail({
    search: debouncedSearchTerm,
  });

  return (
    <div className="px-8 mt-8">
      <div className=" bg-[#1a1a1a] w-full h-[450px] rounded-lg">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-poppins font-bold text-white tracking-wide">
            Recent Orders
          </h1>
          {/* <a href="" className="font-semibold text-[#025cca]">
            View All
          </a> */}
        </div>
        <div className="flex items-center gap-2 bg-[#1f1f1f] rounded-md mx-6 px-5 py-2 text-white">
          <CiSearch size={32} />
          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearchParams((prev) => {
                const params = new URLSearchParams(prev);
                params.set("search", e.target.value);
                return params;
              })
            }
            placeholder="Search..."
            className="bg-[#1f1f1f] text-[#f5f5f5] px-2 py-1 rounded-md outline-none"
          />
        </div>

        {/* Order List */}
        <div className="overflow-y-scroll h-[350px] scrollbar-hide pb-12">
          {orders.length > 0 ? (
            orders.map((order) => <OrderList key={order._id} order={order} />)
          ) : (
            <p className="col-span-3 text-gray-500 flex items-center justify-center h-full">
              No order available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
