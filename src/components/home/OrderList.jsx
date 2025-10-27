import { BiCheckDouble } from "react-icons/bi";
import { FaCheckDouble, FaCircle, FaLongArrowAltRight } from "react-icons/fa";
import { getAvatarName } from "../../utils";

const OrderList = ({ order, key }) => {
  return (
    <div className="flex items-center gap-2 text-white px-8 mt-5">
      <button className="bg-[#f6b100] py-3 px-5 rounded-lg">
        {" "}
        {getAvatarName(order.customerDetails.name)}
      </button>
      <div className="flex justify-between w-[100%] items-center">
        <div className="flex flex-col items-start">
          <p>{order.customerDetails.name}</p>
          <p>{order.items.length} items</p>
        </div>
        <h1 className="text-[#f6b100] font-semibold border border-[#f6b100] rounded-lg p-1">
          Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" />{" "}
          {order.table.tableNo}
        </h1>
        <div className="flex flex-col items-end">
          {order.orderStatus === "Ready" ? (
            <>
              <p className="text-green-600 bg-[#2e4a40] px-2 py-1 rounded-lg">
                <FaCheckDouble className="inline mr-2" /> {order.orderStatus}
              </p>
              <p className="text-[#ababab] text-sm">
                <FaCircle className="inline mr-2 text-green-600" /> Ready to
                serve
              </p>
            </>
          ) : (
            <>
              <p className="text-yellow-600 bg-[#4a452e] px-2 py-1 rounded-lg">
                <FaCircle className="inline mr-2" /> {order.orderStatus}
              </p>
              <p className="text-[#ababab] text-sm">
                <FaCircle className="inline mr-2 text-yellow-600" /> Preparing
                your order
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderList;
