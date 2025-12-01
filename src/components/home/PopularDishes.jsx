import { useQuery } from "@tanstack/react-query";

const PopularDishes = () => {
  // ✅ Fetch dishes
  const fetchDishes = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dishes`, {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch dishes: ${res.status}`);
    }

    const json = await res.json();
    console.log("RAW DISH API:", json);
    return Array.isArray(json.data) ? json.data : [];
  };

  // ✅ Fetch orders - biarkan throw error, jangan catch di sini
  const fetchOrders = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order`, {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch orders: ${res.status}`);
    }

    const json = await res.json();
    console.log("✅ RAW ORDER API:", json);

    const ordersArray = json.data?.data || json.data || [];
    console.log("✅ ORDERS ARRAY:", ordersArray);

    return Array.isArray(ordersArray) ? ordersArray : [];
  };

  // ✅ Query dishes
  const {
    data: dishes = [],
    isLoading: loadingDishes,
    error: dishesError,
  } = useQuery({
    queryKey: ["dishes"],
    queryFn: fetchDishes,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  // ✅ Query orders - tampilkan dishes dulu meski orders loading
  const {
    data: orders = [],
    isLoading: loadingOrders,
    error: ordersError,
  } = useQuery({
    queryKey: ["orders-fetch"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: 2, // Coba 2x kalau gagal
  });

  // ✅ Loading state hanya untuk dishes (yang penting)
  if (loadingDishes) {
    return (
      <div className="mt-5 pr-6">
        <div className="bg-[#1a1a1a] w-full rounded-lg p-6">
          <p className="text-white opacity-60 animate-pulse">
            Loading dishes...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Error handling dishes
  if (dishesError) {
    return (
      <div className="mt-5 pr-6">
        <div className="bg-[#1a1a1a] w-full rounded-lg p-6">
          <p className="text-red-400">
            Error loading dishes: {dishesError.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ Hitung order count (skip kalau orders masih loading/error)
  const dishOrdersCount = {};

  if (!loadingOrders && !ordersError && Array.isArray(orders)) {
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const id = item.dishId;
        if (!dishOrdersCount[id]) dishOrdersCount[id] = 0;
        dishOrdersCount[id] += item.quantity;
      });
    });
  }

  // ✅ Gabungkan data
  const combinedDishes = dishes.map((dish) => ({
    ...dish,
    numberOfOrders: dishOrdersCount[dish._id] || 0,
  }));

  return (
    <div className="mt-5 pr-6">
      <div className="bg-[#1a1a1a] w-full rounded-lg">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
            Popular Dishes
          </h1>
          <a href="#" className="text-[#025cca] text-sm font-semibold">
            View all
          </a>
        </div>

        {/* ✅ Warning kalau orders gagal load */}
        {ordersError && (
          <div className="mx-6 mb-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
            <p className="text-yellow-400 text-sm">
              ⚠️ Order counts unavailable
            </p>
          </div>
        )}

        {/* ✅ Indicator kalau orders masih loading */}
        {loadingOrders && (
          <div className="mx-6 mb-4 p-3 bg-blue-900/30 border border-blue-600 rounded">
            <p className="text-blue-400 text-sm animate-pulse">
              📊 Loading order statistics...
            </p>
          </div>
        )}

        <div className="overflow-y-scroll h-[680px] scrollbar-hide">
          {combinedDishes.length === 0 ? (
            <p className="text-white/60 text-center py-8">
              No dishes available
            </p>
          ) : (
            combinedDishes.map((dish, index) => (
              <div
                key={dish._id}
                className="flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-6 py-4 mt-4 mx-6"
              >
                <h1 className="text-[#f5f5f5] font-bold text-xl mr-4">
                  {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </h1>

                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="w-[50px] h-[50px] rounded-full object-cover"
                />

                <div>
                  <h1 className="text-[#f5f5f5] font-semibold tracking-wide">
                    {dish.name}
                  </h1>
                  <p className="text-[#f5f5f5] text-sm font-semibold mt-1">
                    <span className="text-[#ababab]">Orders: </span>
                    {loadingOrders ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      dish.numberOfOrders
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PopularDishes;
