import { format } from "date-fns";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export const exportPaymentsToExcel = (payments) => {
  const exportData = payments.map((p) => ({
    "Order ID": p._id,
    Amount: p.grossAmount,
    Status: p.status,
    Method: p.paymentMethod,
    "Customer Name": p.customerName || "-",
    Phone: p.customerPhone || "-",
    "Created At": p.createdAt
      ? format(new Date(p.createdAt), "dd MMM yyyy HH:mm")
      : "-",
  }));

  const workSheet = XLSX.utils.json_to_sheet(exportData);
  const workBook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workBook, workSheet, "Payments");

  const excelBuffer = XLSX.write(workBook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `Payments_${new Date().toISOString()}.xlsx`);
};
