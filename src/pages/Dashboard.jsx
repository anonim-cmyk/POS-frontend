import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import DishTable from "../components/dashboard/DishTable";
import { useState } from "react";
import Modal from "../components/dashboard/Modal";
import DishModal from "../components/dashboard/DishModal";
import CategoryModal from "../components/dashboard/CategoryModal";
import CategoryTable from "../components/dashboard/CategoryTable";
import TableTable from "../components/dashboard/TableTable";
import PaymentTable from "../components/dashboard/PaymentTable";
import { useSearchParams } from "react-router-dom";

const buttons = [
  // { label: "Add Table", icon: <GrTableAdd />, action: "table" },
  // { label: "Add Category", icon: <TbCategoryPlus />, action: "category" },
  // { label: "Add Dishes", icon: <BiSolidDish />, action: "dishes" },
];
const tabs = [
  "Metrics",
  "Orders",
  "Payments",
  "Dishes",
  "Categories",
  "Tables",
];

const Dashboard = () => {
  // const [activeTab, setActiveTab] = useState("Metrics");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "metrics";

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDishesModalOpen, setIsDishesModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  // const handleOpenModal = (action) => {
  //   if (action === "table") setIsTableModalOpen(true);
  //   if (action === "category") setIsCategoryModalOpen(true);
  //   if (action === "dishes") setIsDishesModalOpen(true);
  // };

  const TAB_WITH_PAGINATION = ["orders", "payments", "dishes"];
  const handleTabChange = (tab) => {
    const lowerTab = tab.toLowerCase();
    const params = { tab: lowerTab };
    if (TAB_WITH_PAGINATION.includes(lowerTab)) {
      params.page = "1";
    }

    setSearchParams(params);
  };

  return (
    <div className="bg-[#1f1f1f] min-h-screen">
      <div className="mx-auto flex items-center justify-between py-14 px-6 md:px-4">
        <div className="flex items-center gap-3">
          {buttons.map(({ label, icon, action }) => (
            <button
              key={label}
              className="bg-[#1a1a1a] hover:bg-[#262626] px-8 py-3 rounded-lg text-white font-semibold text-xl flex items-center gap-4"
              onClick={() => handleOpenModal(action)}
            >
              {label} {icon}
            </button>
          ))}
        </div>
        <div className="w-full flex items-center gap-3 justify-between">
          <div className="flex gap-3">
            {tabs.slice(0, 3).map((item) => (
              <button
                key={item}
                onClick={() => handleTabChange(item)}
                className={`px-6 py-2 rounded-lg text-white font-semibold text-lg ${
                  activeTab === item.toLowerCase()
                    ? "bg-[#262626]"
                    : "bg-[#1a1a1a] hover:bg-[#262626]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            {tabs.slice(3, 6).map((item) => (
              <button
                key={item}
                onClick={() => handleTabChange(item)}
                className={`px-6 py-2 rounded-lg text-white font-semibold text-lg ${
                  activeTab === item.toLowerCase()
                    ? "bg-[#262626]"
                    : "bg-[#1a1a1a] hover:bg-[#262626]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      {activeTab === "metrics" && <Metrics />}
      {activeTab === "orders" && <RecentOrders />}
      {activeTab === "payments" && <PaymentTable />}
      {activeTab === "dishes" && (
        <DishTable
          onAdd={() => setIsDishesModalOpen(true)}
          onEdit={(dish) => {
            setEditingDish(dish);
            setIsDishesModalOpen(true);
          }}
        />
      )}
      {activeTab === "categories" && (
        <CategoryTable
          onAdd={() => setIsCategoryModalOpen(true)}
          onEdit={(category) => {
            setEditingCategory(category);
            setIsCategoryModalOpen(true);
          }}
        />
      )}
      {activeTab === "tables" && (
        <TableTable
          onAdd={() => setIsTableModalOpen(true)}
          onEdit={(table) => {
            setEditingTable(table);
            setIsTableModalOpen(true);
          }}
        />
      )}

      {/* Modals */}
      {isTableModalOpen && (
        <Modal
          setIsTableModalOpen={setIsTableModalOpen}
          editingTable={editingTable}
          setEditingTable={setEditingTable}
        />
      )}
      {isCategoryModalOpen && (
        <CategoryModal
          setIsCategoryModalOpen={setIsCategoryModalOpen}
          editingCategory={editingCategory}
          setEditingCategory={setEditingCategory}
        />
      )}
      {isDishesModalOpen && (
        <DishModal
          setIsDishesModalOpen={setIsDishesModalOpen}
          editingDish={editingDish}
          setEditingDish={setEditingDish}
        />
      )}
    </div>
  );
};

export default Dashboard;
