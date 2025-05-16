import { useState } from "react";
import PropTypes from "prop-types";
import { IoSearch } from "react-icons/io5";
import { CgClose } from "react-icons/cg";
import { useQuery } from "@tanstack/react-query";
import { ProductApi } from "../../services/productApi";
import empty from "../../assets/images/empty.png";
import ProductSkeleton from "./ProductSkeleton";
import ProductCard from "./ProductCard";
import useDebounce from "../../hooks/useDebounce";

export default function PopupProducts({
  dataPopupProductBag,
  closePopup,
  dataPopup,
  handleChooseProduct,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data, isLoading } = useQuery({
    queryKey: ["allProducts", dataPopup.categoryID],
    queryFn: () =>
      ProductApi.getAllProducts({
        all: 1,
        categoryID: dataPopup.categoryID,
      }),
    keepPreviousData: true,
    enabled: !!dataPopup.categoryID,
  });

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredProducts = data?.products?.filter((product) =>
    product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-[#00000080] flex justify-center items-center z-50 m-0">
      <div className="bg-white relative w-full max-w-3xl mx-3 md:mx-0 rounded min-h-[350px] overflow-hidden">
        <div className="flex items-center justify-between w-full border-b border-gray-400 py-4 px-3 bg-gray-200">
          <div className="flex items-center gap-3 px-2">
            <div className="font-bold text-xl">{dataPopup?.title}</div>
          </div>
          <CgClose
            size={25}
            className="text-gray-500 cursor-pointer"
            onClick={closePopup}
          />
        </div>
        <div className="px-3 py-2">
          <div className="w-full flex justify-between items-center relative mt-2">
            <div className="w-3/5">
              <input
                type="text"
                className="pl-9 w-full border-2 bg-gray-200 outline-0 focus:bg-transparent text-gray-700 border-gray-300 p-1 px-3 rounded-full font-medium"
                placeholder="Bạn cần tìm gì"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <IoSearch
                size={20}
                className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 px-3 py-2 max-h-[450px] custom-scrollbar">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                data={product}
                productInPopup={true}
                handleChooseProduct={handleChooseProduct}
                dataPopupProductBag={dataPopupProductBag}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 col-span-3">
              <img
                src={empty}
                alt="empty"
                className="mx-auto w-20 opacity-70 mb-5"
              />
              Không có sản phẩm nào được tìm thấy.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

PopupProducts.propTypes = {
  handleChooseProduct: PropTypes.func,
  closePopup: PropTypes.func,
  dataPopup: PropTypes.object,
  dataPopupProductBag: PropTypes.array,
};
