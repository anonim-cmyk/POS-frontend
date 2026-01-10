import React, { useState, useEffect, useMemo } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { GrRadialSelected } from "react-icons/gr";
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlices";
import { useCategories } from "../../hooks/useCategories";
import { useDishes } from "../../hooks/useDishes";

const MenuContainer = () => {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState({});

  const { categories, isLoading: catLoad, isError: catError } = useCategories();
  const {
    dishes,
    isLoading: dishLoad,
    isError: dishError,
  } = useDishes({ all: true });

  // ✅ Log hasil parsing
  useEffect(() => {
    console.log("✅ PARSED CATEGORIES:", categories);
    console.log("✅ PARSED DISHES:", dishes);
  }, [categories, dishes]);

  // ✅ Merge dengan useMemo (supaya tidak recreate terus)
  const menus = useMemo(() => {
    if (categories.length === 0) return [];

    return categories.map((cat) => ({
      ...cat,
      items: dishes.filter((dish) => dish?.category?._id === cat._id),
    }));
  }, [categories, dishes]);

  console.log("menus: ", menus);

  // ✅ Auto select first category (hanya sekali)
  useEffect(() => {
    if (menus.length > 0 && !selected) {
      console.log("🎯 Auto selecting first menu:", menus[0]);
      setSelected(menus[0]);
    }
  }, [menus.length]); // ❗ dependency hanya length, bukan menus

  // Quantity Logic
  const increment = (id) => {
    setQty((prev) => ({
      ...prev,
      [id]: Math.min((prev[id] || 0) + 1, 4),
    }));
  };

  const decrement = (id) => {
    setQty((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0),
    }));
  };

  const handleAddToCart = (item) => {
    const dishQty = qty[item._id] || 0;
    if (dishQty === 0) return;

    dispatch(
      addItems({
        dishId: item._id,
        name: item.name,
        pricePerQuantity: item.price,
        quantity: dishQty,
        price: item.price * dishQty,
      })
    );

    setQty((prev) => ({ ...prev, [item._id]: 0 }));
  };

  // ✅ Loading State
  if (catLoad || dishLoad) {
    return (
      <div className="px-10 py-4">
        <div className="grid grid-cols-4 gap-4 w-full mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#2a2a2a] animate-pulse h-[100px] rounded-lg"
            />
          ))}
        </div>
        <p className="text-white/60 text-center">Loading menu...</p>
      </div>
    );
  }

  // ✅ Error State
  if (catError || dishError) {
    return (
      <div className="px-10 py-4">
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-6">
          <p className="text-red-400 font-semibold mb-2">Failed to load menu</p>
          <p className="text-red-300/70 text-sm">
            {catError?.message || dishError?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ Empty State
  if (categories.length === 0) {
    return (
      <div className="px-10 py-4">
        <p className="text-white/60 text-center">No categories available</p>
      </div>
    );
  }

  return (
    <>
      {/* Category Grid */}
      <div className="grid grid-cols-4 gap-4 px-10 py-4 w-full">
        {menus.map((menu) => (
          <div
            key={menu._id}
            className="flex flex-col items-start justify-between p-4 rounded-lg h-[100px] cursor-pointer transition-all"
            style={{ backgroundColor: menu.bgColor || "#222" }}
            onClick={() => {
              setSelected(menu);
            }}
          >
            <div className="flex items-center justify-between w-full">
              <h1 className="text-[#f5f5f5] text-lg font-semibold">
                {menu.icon} {menu.name}
              </h1>
              {selected?._id === menu._id && (
                <GrRadialSelected className="text-white" size={20} />
              )}
            </div>
            <p className="text-[#ababab] text-sm font-semibold">
              {dishLoad ? "Loading..." : `${menu.items.length} Items`}
            </p>
          </div>
        ))}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      {/* Items Grid */}
      <div className="grid grid-cols-4 gap-4 px-10 py-4 w-full">
        {!selected ? (
          <p className="text-white/60 col-span-4 text-center">
            Select a category
          </p>
        ) : selected.items.length === 0 ? (
          <p className="text-white/60 col-span-4 text-center">
            No items in this category
          </p>
        ) : (
          selected.items.map((item) => (
            <div
              key={item._id}
              className="flex flex-col items-start justify-between p-4 rounded-lg h-[150px] bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors"
            >
              <div className="flex items-start justify-between w-full">
                <h1 className="text-[#f5f5f5] text-lg font-semibold">
                  {item.name}
                </h1>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="bg-[#2e4a40] text-[#02ca3a] p-2 rounded-lg hover:bg-[#3e5a50] transition-colors disabled:opacity-50"
                  disabled={!qty[item._id] || qty[item._id] === 0}
                >
                  <FaShoppingCart size={20} />
                </button>
              </div>

              <div className="flex items-center justify-between w-full">
                <p className="text-[#f5f5f5] text-xl font-bold">
                  Rp. {item.price.toLocaleString("id-ID")}
                </p>

                <div className="flex items-center bg-[#1f1f1f] px-4 py-3 rounded-lg gap-6 w-[50%]">
                  <button
                    onClick={() => decrement(item._id)}
                    className="text-yellow-500 text-2xl hover:text-yellow-400 disabled:opacity-30"
                    disabled={!qty[item._id] || qty[item._id] === 0}
                  >
                    &minus;
                  </button>
                  <span className="text-white font-semibold">
                    {qty[item._id] || 0}
                  </span>
                  <button
                    onClick={() => increment(item._id)}
                    className="text-yellow-500 text-2xl hover:text-yellow-400 disabled:opacity-30"
                    disabled={qty[item._id] >= 4}
                  >
                    &#43;
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default MenuContainer;
