import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, deleteCategory } from "../../https";
import { BiEdit, BiTrash } from "react-icons/bi";
import { enqueueSnackbar } from "notistack";

const CategoryTable = ({ onAdd, onEdit }) => {
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategories();
      return res.data?.data || [];
    },
  });

  // Delete Category
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => {
      enqueueSnackbar("Category deleted successfully", { variant: "success" });
      queryClient.invalidateQueries(["categories"]);
    },
    onError: () => {
      enqueueSnackbar("Failed to delete category", { variant: "error" });
    },
  });

  if (isLoading) return <p className="text-white px-6">Loading...</p>;

  return (
    <div className="mx-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-white text-2xl font-semibold">Categories</h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          onClick={onAdd}
        >
          Add Category
        </button>
      </div>

      <table className="min-w-full text-white border-collapse text-center">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="px-4 py-2">Icon</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Color</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id} className="border-b border-gray-700">
              {/* Icon */}
              <td className="px-4 py-2 text-xl">{cat.icon || "📦"}</td>

              {/* Name */}
              <td className="px-4 py-2">{cat.name}</td>

              {/* Description */}
              <td className="px-4 py-2">{cat.description || "-"}</td>

              {/* Color Preview */}
              <td className="px-4 py-2">
                <span
                  className="px-3 py-1 rounded text-black"
                  style={{ backgroundColor: cat.bgColor || "#f0f0f0" }}
                >
                  {cat.bgColor}
                </span>
              </td>

              {/* Actions */}
              <td className="px-4 py-2">
                <div className="inline-flex gap-2">
                  <button
                    className="bg-yellow-500 px-2 py-1 rounded hover:bg-yellow-600"
                    onClick={() => onEdit(cat)}
                  >
                    <BiEdit size={20} />
                  </button>

                  <button
                    className="bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                    onClick={() => {
                      if (window.confirm(`Delete "${cat.name}"?`)) {
                        deleteMutation.mutate(cat._id);
                      }
                    }}
                  >
                    <BiTrash size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
