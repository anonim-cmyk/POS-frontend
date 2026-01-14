import { FaCheckDouble, FaCircle, FaLongArrowAltRight } from "react-icons/fa";
import { getAvatarName } from "../../utils";
import { GrCompliance } from "react-icons/gr";
import { GrInProgress } from "react-icons/gr";

const STATUS_CONFIG = {
  "In Progress": {
    badge: "bg-[#4a452e] text-[#ababab]",
    icon: <GrInProgress className="inline mr-2 text-yellow-600" />,
    dot: "text-yellow-600",
    label: "Preparing your order",
  },
  Ready: {
    badge: "bg-[#2e4a40] text-green-600",
    icon: <FaCheckDouble className="inline mr-2" />,
    dot: "text-green-600",
    label: "Ready to serve",
  },
  Completed: {
    badge: "bg-[#2e3b4a] text-blue-600",
    icon: <GrCompliance className="inline mr-2 text-blue-600" />,
    dot: "text-blue-600",
    label: "Order Completed",
  },
};

const OrderList = ({ order }) => {
  const config = STATUS_CONFIG[order.orderStatus] || DEFAULT_STATUS;

  return (
    <div className="flex items-center gap-2 text-white px-8 mt-5">
      <button className="bg-[#f6b100] py-3 px-5 rounded-lg">
        {getAvatarName(order.customerDetails.name)}
      </button>

      <div className="flex justify-between w-full items-center">
        <div>
          <p>{order.customerDetails.name}</p>
          <p>{order.items.length} items</p>
        </div>

        <h1 className="text-[#f6b100] font-semibold border border-[#f6b100] rounded-lg p-1">
          Table <FaLongArrowAltRight className="inline ml-2" />
          {order.table.tableNo}
        </h1>

        <div className="flex flex-col items-end">
          <p
            className={`px-2 py-1 rounded-lg flex items-center gap-1 ${config.badge}`}
          >
            {config.icon}
            {order.orderStatus}
          </p>

          <p className="text-[#ababab] text-sm">
            <FaCircle className={`inline mr-2 ${config.dot}`} />
            {config.label}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
