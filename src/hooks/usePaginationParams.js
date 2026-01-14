// hooks/usePaginationParams.js
import { useSearchParams } from "react-router-dom";

export const usePaginationParams = (defaultPage = 1) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || String(defaultPage), 10);

  const setPage = (newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", newPage.toString());
      return next;
    });
  };

  const getFilter = (key) => searchParams.get(key) || "";

  const setFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }

      // Reset page when filter changes
      next.set("page", "1");
      return next;
    });
  };

  const setMultipleFilters = (filters, resetPage = true) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      // Reset page jika diperlukan
      if (resetPage) {
        next.set("page", "1");
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          next.set(key, String(value));
        } else {
          next.delete(key);
        }
      });

      return next;
    });
  };

  // Helper untuk clear semua filters kecuali page
  const clearFilters = () => {
    setSearchParams({ page: "1" });
  };

  return {
    page,
    setPage,
    getFilter,
    setFilter,
    setMultipleFilters,
    clearFilters,
    searchParams, // Untuk akses langsung jika perlu
  };
};
