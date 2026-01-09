import { useQuery } from "@tanstack/react-query";

export const usePopularDishes = () => {
  const fetchPopularDishes = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/dishes/popular/list`,
      {
        credentials: "include",
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch popular dishes (${res.status})`);
    }

    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  };

  return useQuery({
    queryKey: ["popular-dishes"],
    queryFn: fetchPopularDishes,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
