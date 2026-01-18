import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getPayments } from "../api";

export const usePayments = ({
  page,
  statusFilter,
  periodFilter,
  itemsPerPage = 10,
}) => {
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["payments", page, statusFilter, periodFilter, itemsPerPage],
    queryFn: () =>
      getPayments({
        page,
        limit: itemsPerPage,
        status: statusFilter,
        period: periodFilter,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });

  return {
    payments: data?.data || [],
    totalPages: data?.totalPages || 1,
    totalAmount: data?.totalAmount || 0,
    isLoading,
    isFetching,
    error,
  };
};
