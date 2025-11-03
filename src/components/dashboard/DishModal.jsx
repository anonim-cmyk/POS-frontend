import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { IoMdClose } from "react-icons/io";
import { addDish, updateDish, getCategories } from "../../https";

const DishModal = ({ setIsDishesModalOpen, editingDish, setEditingDish }) => {
  const [dishData, setDishData] = useState({
    name: "",
    price: "",
    category: "",
    stock: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await getCategories();
      return Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
    },
  });

  // Prefill jika editing
  useEffect(() => {
    if (editingDish) {
      setDishData({
        name: editingDish.name,
        price: editingDish.price,
        category: editingDish.category?._id || editingDish.category || "",
        stock: editingDish.stock || 0,
      });
      setPreview(editingDish.imageUrl || null);
    }
  }, [editingDish]);

  // Mutation Add/Update
  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (editingDish?._id) {
        // Update Dish
        return updateDish({ dishId: editingDish._id, ...formData });
      }
      // Add Dish
      return addDish(formData);
    },
    onSuccess: () => {
      enqueueSnackbar(
        editingDish ? "Dish updated successfully" : "Dish added successfully",
        { variant: "success" }
      );
      queryClient.invalidateQueries(["dishes"]);
      setIsDishesModalOpen(false);
      setEditingDish(null);
    },
    onError: () => {
      enqueueSnackbar("Failed to save dish", { variant: "error" });
    },
  });

  // Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dishData.name || !dishData.price || !dishData.category) {
      enqueueSnackbar("Name, price, and category are required", {
        variant: "warning",
      });
      return;
    }

    try {
      let imageUrl = preview; // default ke existing

      if (imageFile) {
        // Upload ke Cloudinary
        const formDataCloud = new FormData();
        formDataCloud.append("file", imageFile);
        formDataCloud.append("upload_preset", "dishes");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dsszoqt88/image/upload",
          { method: "POST", body: formDataCloud }
        );
        const data = await res.json();
        imageUrl = data.secure_url;
      }

      // Pastikan category hanya ID string
      const payload = {
        name: dishData.name,
        price: Number(dishData.price),
        stock: Number(dishData.stock),
        category:
          typeof dishData.category === "object"
            ? dishData.category._id
            : dishData.category,
        imageUrl,
      };

      mutation.mutate(payload, {
        onSuccess: () => {
          console.log("Dish saved", payload);
        },
      });
    } catch (err) {
      enqueueSnackbar("Image upload failed", { variant: "error" });
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            setIsDishesModalOpen(false);
            setEditingDish(null);
          }}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <IoMdClose size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {editingDish ? "Edit Dish" : "Add Dish"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Dish name"
            className="border rounded-lg w-full p-2"
            value={dishData.name}
            onChange={(e) => setDishData({ ...dishData, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Price"
            className="border rounded-lg w-full p-2"
            value={dishData.price}
            onChange={(e) =>
              setDishData({ ...dishData, price: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Stock"
            className="border rounded-lg w-full p-2"
            value={dishData.stock}
            onChange={(e) =>
              setDishData({ ...dishData, stock: Number(e.target.value) })
            }
            required
          />

          <div>
            <label className="block mb-1 text-gray-600">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              className="border rounded-lg w-full p-2"
              onChange={handleImageChange}
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-3 rounded-lg w-full h-40 object-cover border"
              />
            )}
          </div>

          <select
            className="border rounded-lg w-full p-2"
            value={dishData.category}
            onChange={(e) =>
              setDishData({ ...dishData, category: e.target.value })
            }
            required
          >
            <option value="">Select Category</option>
            {categories?.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full"
          >
            {editingDish ? "Update Dish" : "Add Dish"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DishModal;
