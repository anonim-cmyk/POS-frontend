import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { IoMdClose } from "react-icons/io";
import { addCategory } from "../../https";

const CategoryModal = ({ setIsCategoryModalOpen }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    bgColor: "#1d2569",
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addCategory,
    onSuccess: () => {
      enqueueSnackbar("Category created successfully", { variant: "success" });
      queryClient.invalidateQueries(["categories"]);
      setIsCategoryModalOpen(false);
    },
    onError: () => {
      enqueueSnackbar("Failed to create category", { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] relative">
        <button
          onClick={() => setIsCategoryModalOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <IoMdClose size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Add Category</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Category name"
            className="border rounded-lg w-full p-2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <textarea
            placeholder="Description"
            className="border rounded-lg w-full p-2"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          {/* Icon input */}
          <input
            type="text"
            placeholder="Icon (ex: 🍔)"
            className="border rounded-lg w-full p-2"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            required
          />

          {/* Background color */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium w-24">Background:</label>
            <input
              type="color"
              value={formData.bgColor}
              onChange={(e) =>
                setFormData({ ...formData, bgColor: e.target.value })
              }
              className="w-12 h-10 rounded cursor-pointer"
            />
            <span className="text-gray-700">{formData.bgColor}</span>
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full"
          >
            Add Category
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
