import { useState } from "react";
import ProductHasPrice from "./ProductHasPrice";
import ProductNoPrice from "./ProductNoPrice";
import Service from "./Service";
import SamplePack from "./SamplePack";
import LoadingSpin from "../../../ui/LoadingSpin";

export default function ProductCreate() {
  const [activeTab, setActiveTab] = useState("productHasPrice");
  const [loading, setLoading] = useState(false);

  const data = [
    { label: "Sản phẩm có giá", value: "productHasPrice", content: <ProductHasPrice /> },
    { label: "Sản phẩm không có giá", value: "productNoPrice", content: <ProductNoPrice /> },
    { label: "Dịch vụ", value: "service", content: <Service /> },
    { label: "Sample packs", value: "samplePack", content: <SamplePack /> },
  ];

  const handleTabChange = (value) => {
    if (value === activeTab) return;

    setActiveTab(value); 
    setLoading(true); 
    setTimeout(() => setLoading(false), 300); 
  };

  return (
    <div className="w-full rounded-lg bg-white px-7 py-6 min-h-[calc(100vh-140px)] shadow-sm border border-gray-200">
      <h1 className="mb-4 text-2xl font-bold">Thêm mới sản phẩm</h1>

      <div className="bg-gray-200 p-1 rounded-lg flex">
        {data.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleTabChange(value)}
            className={`text-black font-medium py-3 grow transition-all cursor-pointer ${
              activeTab === value ? "bg-gray-800 text-white shadow-md rounded-lg" : "opacity-70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="text-md text-gray-500 flex justify-center flex-col items-center">
            <LoadingSpin />
            <span className="mt-3">Đang tải dữ liệu...</span>
          </div>
        ) : (
          data.find((item) => item.value === activeTab)?.content
        )}
      </div>
    </div>
  );
}
