export const TAX_RATE = 5.25;

export const calculateTax = (total) => (total * TAX_RATE) / 100;

export const buildOrderPayload = ({
  orderCode,
  customer,
  cart,
  total,
  tableId,
  paymentMethod,
}) => {
  const tax = calculateTax(total);

  return {
    orderCode,
    customerDetails: customer,
    orderStatus: "In Progress",
    bills: {
      total,
      tax,
      totalWithTax: total + tax,
    },
    items: cart,
    table: tableId,
    paymentMethod,
  };
};
