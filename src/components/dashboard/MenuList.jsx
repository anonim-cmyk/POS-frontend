import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenus, deleteMenu, deleteDishFromMenu } from "../../https";
import { enqueueSnackbar } from "notistack";

const MenuList = ({ onAddDish }) => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["menus"],
    queryFn: getMenus,
  });

  const menus = data?.data?.data || [];

  const deleteMenuMutation = useMutation({
    mutationFn: deleteMenu,
    onSuccess: () => {
      enqueueSnackbar("Menu deleted!", { variant: "success" });
      queryClient.invalidateQueries(["menus"]);
    },
  });

  const deleteDishMutation = useMutation({
    mutationFn: deleteDishFromMenu,
    onSuccess: () => {
      enqueueSnackbar("Dish deleted!", { variant: "success" });
      queryClient.invalidateQueries(["menus"]);
    },
  });

  if (isLoading) return <p className="text-white">Loading...</p>;

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {menus.map((menu) => (
        <div
          key={menu._id}
          className="rounded-xl p-6 text-white"
          style={{ backgroundColor: menu.bgColor }}
        >
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">
              {menu.icon} {menu.name}
            </h2>
            <button
              onClick={() => deleteMenuMutation.mutate(menu._id)}
              className="text-red-500"
            >
              🗑️
            </button>
          </div>
          <ul className="mt-2">
            {menu.items.map((dish) => (
              <li key={dish._id} className="flex justify-between">
                <span>{dish.name}</span>
                <div>
                  <span>Rp {dish.price.toLocaleString()}</span>
                  <button
                    onClick={() =>
                      deleteDishMutation.mutate({
                        menuId: menu._id,
                        dishId: dish._id,
                      })
                    }
                    className="text-red-400 ml-2"
                  >
                    ❌
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={() => onAddDish(menu._id)}
            className="mt-3 bg-black px-3 py-2 rounded"
          >
            ➕ Add Dish
          </button>
        </div>
      ))}
    </div>
  );
};

export default MenuList;
