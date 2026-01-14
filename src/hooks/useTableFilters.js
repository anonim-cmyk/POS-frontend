import { usePaginationParams } from "./usePaginationParams";

export const useTableFilters = (keys = []) => {
  const { page, setPage, getFilter, setFilter, clearFilters } =
    usePaginationParams();

  const filters = Object.fromEntries(keys.map((k) => [k, getFilter(k)]));

  return {
    page,
    setPage,
    filters,
    setFilter,
    clearFilters,
  };
};
