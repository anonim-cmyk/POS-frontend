import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrderByCode } from "../api/order.api";
import FullScreenLoader from "../components/shared/FullScreenLoader";
import Invoice from "../components/invoice/Invoice";

const InvoicePage = () => {
  const [params] = useSearchParams();
  const orderCode = params.get("orderCode");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["order", orderCode],
    queryFn: () => getOrderByCode(orderCode),
    enabled: !!orderCode,
  });

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <p>Order tidak ditemukan</p>;

  return <Invoice order={data.data.data} />;
};

export default InvoicePage;
