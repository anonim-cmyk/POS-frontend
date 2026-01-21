import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatRupiah } from "../../utils";
import { getSalesReport } from "../../api/report.api";
import FullScreenLoader from "../shared/FullScreenLoader";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState("30d");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["sales-report", period],
    queryFn: () => getSalesReport(period),
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "sales", label: "Sales Analysis", icon: "💰" },
    { id: "products", label: "Products", icon: "🍱" },
    { id: "payments", label: "Payments", icon: "💳" },
  ];

  const periods = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "ytd", label: "Year to Date" },
  ];

  if (isLoading) return <FullScreenLoader />;

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
          <p className="text-red-500 mb-4">Failed to load report</p>
          <button
            onClick={() => refetch()}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, revenueByMethod, topItems } = data.data.data;
  const totalRevenue = summary.totalRevenue || 0;

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Sales Report</h2>
          <p className="text-gray-400 text-sm">
            Pepes Hj. IKA - Performance Analytics
          </p>
        </div>

        <div className="flex gap-3">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-[#262626] px-4 py-2 rounded border border-gray-700 focus:outline-none focus:border-orange-500"
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <button
            onClick={() => handleExport(data.data.data)}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center gap-2"
          >
            <span>📥</span>
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 flex items-center gap-2 font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-orange-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"></div>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <OverviewTab summary={summary} totalRevenue={totalRevenue} />
        )}

        {activeTab === "sales" && (
          <SalesTab summary={summary} totalRevenue={totalRevenue} />
        )}

        {activeTab === "products" && (
          <ProductsTab topItems={topItems} totalRevenue={totalRevenue} />
        )}

        {activeTab === "payments" && (
          <PaymentsTab
            revenueByMethod={revenueByMethod}
            totalRevenue={totalRevenue}
          />
        )}
      </div>
    </div>
  );
};

// ============= TAB COMPONENTS =============

const OverviewTab = ({ summary, totalRevenue }) => {
  const completionRate =
    summary.totalOrders > 0
      ? ((summary.completedOrders / summary.totalOrders) * 100).toFixed(1)
      : 0;

  const avgOrderValue =
    summary.completedOrders > 0 ? totalRevenue / summary.completedOrders : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={formatRupiah(totalRevenue)}
          icon="💰"
          trend="+12.5%"
          trendUp={true}
        />
        <KPICard
          title="Total Orders"
          value={summary.totalOrders}
          icon="📦"
          trend="+8.3%"
          trendUp={true}
        />
        <KPICard
          title="Completed Orders"
          value={summary.completedOrders}
          icon="✅"
          subtitle={`${completionRate}% completion rate`}
        />
        <KPICard
          title="Avg Order Value"
          value={formatRupiah(avgOrderValue)}
          icon="📊"
          subtitle="Per completed order"
        />
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span>💡</span>
          Quick Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <InsightItem
            label="Success Rate"
            value={`${completionRate}%`}
            description="Orders completed successfully"
          />
          <InsightItem
            label="Avg Transaction"
            value={formatRupiah(avgOrderValue)}
            description="Per order revenue"
          />
          <InsightItem
            label="Total Transactions"
            value={summary.totalOrders}
            description="All orders processed"
          />
        </div>
      </div>
    </div>
  );
};

const SalesTab = ({ summary, totalRevenue }) => {
  const cancelledOrders = summary.totalOrders - summary.completedOrders;
  const cancelRate =
    summary.totalOrders > 0
      ? ((cancelledOrders / summary.totalOrders) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      {/* Sales Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Completed Sales"
          value={summary.completedOrders}
          total={summary.totalOrders}
          color="green"
        />
        <MetricCard
          title="Cancelled Orders"
          value={cancelledOrders}
          total={summary.totalOrders}
          color="red"
        />
        <MetricCard
          title="Success Rate"
          value={`${(100 - parseFloat(cancelRate)).toFixed(1)}%`}
          subtitle="Order completion"
          color="blue"
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-[#1f1f1f] rounded-lg p-6">
        <h3 className="font-semibold mb-4">Revenue Analysis</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-700">
            <span className="text-gray-400">Gross Revenue</span>
            <span className="font-semibold text-lg">
              {formatRupiah(totalRevenue)}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-700">
            <span className="text-gray-400">Average per Day</span>
            <span className="font-semibold">
              {formatRupiah(totalRevenue / 30)}
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-400">Average per Order</span>
            <span className="font-semibold">
              {formatRupiah(
                summary.completedOrders > 0
                  ? totalRevenue / summary.completedOrders
                  : 0
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductsTab = ({ topItems }) => {
  const totalQty = topItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="space-y-6">
      <div className="bg-[#1f1f1f] rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold">Top Selling Products</h3>
          <span className="text-sm text-gray-400">
            Total: {totalQty} pcs sold
          </span>
        </div>

        <div className="space-y-3">
          {topItems.map((item, index) => {
            const percentage = ((item.qty / totalQty) * 100).toFixed(1);
            return (
              <div key={item._id} className="bg-[#262626] rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center font-bold ${
                        index === 0
                          ? "bg-yellow-500 text-black"
                          : index === 1
                          ? "bg-gray-400 text-black"
                          : index === 2
                          ? "bg-orange-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item._id}</p>
                      <p className="text-sm text-gray-400">
                        {item.qty} pcs sold
                      </p>
                    </div>
                  </div>
                  <span className="text-orange-500 font-semibold">
                    {percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Insights */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
        <h3 className="font-semibold mb-3">Product Performance</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>
              Best seller:{" "}
              <strong className="text-white">{topItems[0]?._id || "-"}</strong>{" "}
              with {topItems[0]?.qty || 0} units
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">📈</span>
            <span>
              Top 3 products account for{" "}
              <strong className="text-white">
                {topItems.slice(0, 3).reduce((sum, item) => sum + item.qty, 0)}{" "}
                units
              </strong>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-500 mt-1">⭐</span>
            <span>
              Total product varieties sold:{" "}
              <strong className="text-white">{topItems.length}</strong>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

const PaymentsTab = ({ revenueByMethod, totalRevenue }) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#1f1f1f] rounded-lg p-6">
        <h3 className="font-semibold mb-6">Payment Method Distribution</h3>

        <div className="space-y-4">
          {revenueByMethod.map((method, index) => {
            const percentage =
              totalRevenue > 0
                ? ((method.total / totalRevenue) * 100).toFixed(1)
                : 0;

            const icon =
              method._id === "cash"
                ? "💵"
                : method._id === "qris"
                ? "📱"
                : method._id === "card"
                ? "💳"
                : "💰";

            return (
              <div key={method._id} className="bg-[#262626] rounded-lg p-5">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="font-medium capitalize">{method._id}</p>
                      <p className="text-sm text-gray-400">
                        {percentage}% of total revenue
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {formatRupiah(method.total)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      index === 0
                        ? "bg-green-500"
                        : index === 1
                        ? "bg-blue-500"
                        : "bg-purple-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-lg p-6">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <span>🏆</span>
            Most Popular
          </h4>
          <p className="text-2xl font-bold text-green-500 capitalize mb-1">
            {revenueByMethod[0]?._id || "-"}
          </p>
          <p className="text-sm text-gray-400">
            {revenueByMethod[0] && totalRevenue > 0
              ? `${((revenueByMethod[0].total / totalRevenue) * 100).toFixed(
                  1
                )}% of transactions`
              : "No data"}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-lg p-6">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <span>💳</span>
            Payment Methods
          </h4>
          <p className="text-2xl font-bold text-blue-500 mb-1">
            {revenueByMethod.length}
          </p>
          <p className="text-sm text-gray-400">Active payment options</p>
        </div>
      </div>
    </div>
  );
};

// ============= SHARED COMPONENTS =============

const KPICard = ({ title, value, icon, trend, trendUp, subtitle }) => (
  <div className="bg-[#262626] rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-colors">
    <div className="flex justify-between items-start mb-3">
      <p className="text-gray-400 text-sm">{title}</p>
      <span className="text-2xl">{icon}</span>
    </div>
    <h3 className="text-2xl font-bold mb-2">{value}</h3>
    {trend && (
      <p
        className={`text-sm flex items-center gap-1 ${
          trendUp ? "text-green-500" : "text-red-500"
        }`}
      >
        <span>{trendUp ? "↗" : "↘"}</span>
        {trend}
      </p>
    )}
    {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
  </div>
);

const MetricCard = ({ title, value, total, subtitle, color }) => {
  const colorClasses = {
    green:
      "from-green-500/10 to-emerald-500/5 border-green-500/20 text-green-500",
    red: "from-red-500/10 to-rose-500/5 border-red-500/20 text-red-500",
    blue: "from-blue-500/10 to-cyan-500/5 border-blue-500/20 text-blue-500",
  };

  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-lg p-5`}
    >
      <p className="text-gray-400 text-sm mb-2">{title}</p>
      <h3 className="text-3xl font-bold mb-1">
        {typeof value === "string" ? value : value.toLocaleString()}
      </h3>
      {total && <p className="text-sm text-gray-400">{percentage}% of total</p>}
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
    </div>
  );
};

const InsightItem = ({ label, value, description }) => (
  <div>
    <p className="text-gray-400 text-xs mb-1">{label}</p>
    <p className="text-xl font-bold mb-1">{value}</p>
    <p className="text-gray-500 text-xs">{description}</p>
  </div>
);

// ============= UTILITY FUNCTIONS =============

const handleExport = (reportData) => {
  // Convert to CSV format
  const csv = generateCSV(reportData);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sales-report-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
};

const generateCSV = (data) => {
  const { summary, revenueByMethod, topItems } = data;

  let csv = "SALES REPORT - Pepes Hj. IKA\n\n";
  csv += "SUMMARY\n";
  csv += "Metric,Value\n";
  csv += `Total Revenue,${summary.totalRevenue}\n`;
  csv += `Total Orders,${summary.totalOrders}\n`;
  csv += `Completed Orders,${summary.completedOrders}\n\n`;

  csv += "PAYMENT METHODS\n";
  csv += "Method,Revenue,Count\n";
  revenueByMethod.forEach((m) => {
    csv += `${m._id},${m.total},${m.count || 0}\n`;
  });

  csv += "\nTOP PRODUCTS\n";
  csv += "Rank,Product,Quantity\n";
  topItems.forEach((item, i) => {
    csv += `${i + 1},${item._id},${item.qty}\n`;
  });

  return csv;
};

export default Reports;
