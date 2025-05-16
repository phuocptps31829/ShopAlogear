import { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import ProductCard from "../../ui/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { ProductApi } from "../../../services/productApi";
import { categoryApi } from "../../../services/categoryApi";
import { brandApi } from "../../../services/brandApi";
import ReactPaginate from "react-paginate";
import ProductSkeleton from "../../ui/ProductSkeleton";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { ChevronDownIcon, FunnelIcon, MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import empty from "../../../assets/images/empty.png";
import Skeleton from "react-loading-skeleton";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ProductCategory() {
  const { data: categoriesFilter, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories", { type: 1 }],
    queryFn: () => categoryApi.getAllCategories({ type: 1 }),
    keepPreviousData: true,
  });
  const { data: dataBrands, isLoading: loadingBranchs } = useQuery({
    queryKey: ["brandAll", { all: 1 }],
    queryFn: () => brandApi.getAllBrands({ all: 1 }),
    keepPreviousData: true,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const [firstLoad, setFirstLoad] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [filtersObject, setFiltersObject] = useState({
    type: 1,
    search: null,
    categoryID: null,
    startPrice: null,
    endPrice: null,
    sort: null,
    page: 1,
    brandID: null,
  });

  const priceRanges = {
    "0-1": { startPrice: null, endPrice: 1000000 },
    "1-3": { startPrice: 1000000, endPrice: 3000000 },
    "3-5": { startPrice: 3000000, endPrice: 5000000 },
    "5-7": { startPrice: 5000000, endPrice: 7000000 },
    "7-n": { startPrice: 7000000, endPrice: null },
  };

  const sortOptions = [
    { name: "Mặc định", params: null, current: filtersObject.sort === null },
    { name: "Từ A đến Z", params: "1", current: filtersObject.sort === "1" },
    { name: "Giá tăng dần", params: "3", current: filtersObject.sort === "3" },
    { name: "Giá giảm dần", params: "4", current: filtersObject.sort === "4" },
    { name: "Xem nhiều", params: "8", current: filtersObject.sort === "8" },
  ];

  const filters = [
    {
      id: "category",
      name: "Danh mục",
      options: (() => {
        if (!filtersObject.categoryID) {
          return (
            categoriesFilter?.flatMap((item) => {
              const parentOption = {
                value: item.slug,
                label: item.name,
                checked: filtersObject.categoryID == item.id,
                id: item.id,
                indent: 0,
              };

              const childOptions =
                item.children?.map((child) => ({
                  value: child.slug,
                  label: child.name,
                  checked: filtersObject.categoryID == child.id,
                  id: child.id,
                  indent: 1,
                })) || [];

              return [parentOption, ...childOptions];
            }) || []
          );
        }

        let filteredOptions = [];
        const selectedCategory = categoriesFilter?.find(
          (item) =>
            item.id == filtersObject.categoryID ||
            item.children?.some((child) => child.id == filtersObject.categoryID)
        );

        if (selectedCategory) {
          filteredOptions.push({
            value: selectedCategory.slug,
            label: selectedCategory.name,
            checked: filtersObject.categoryID == selectedCategory.id,
            id: selectedCategory.id,
            indent: 0,
          });

          const childOptions =
            selectedCategory.children?.map((child) => ({
              value: child.slug,
              label: child.name,
              checked: filtersObject.categoryID == child.id,
              id: child.id,
              indent: 1,
            })) || [];

          filteredOptions = [...filteredOptions, ...childOptions];
        }

        return filteredOptions;
      })(),
    },
    {
      id: "brand",
      name: "Thương hiệu",
      options:
        dataBrands?.products?.map((item) => ({
          value: item.id,
          label: item.name,
          checked: filtersObject.brandID == item.id,
        })) || [],
    },
    {
      id: "price",
      name: "Giá tiền",
      options: [
        { value: "0-1", label: "Dưới 1 triệu" },
        { value: "1-3", label: "1 triệu - 3 triệu" },
        { value: "3-5", label: "3 triệu - 5 triệu" },
        { value: "5-7", label: "5 triệu - 7 triệu" },
        { value: "7-n", label: "Trên 7 triệu" },
      ].map((option) => ({
        ...option,
        checked:
          filtersObject.startPrice == priceRanges[option.value].startPrice &&
          filtersObject.endPrice == priceRanges[option.value].endPrice,
      })),
    },
  ];

  // Kiểm tra xem categoryID có thuộc "SAMPLE PACKS" hoặc con của nó không
  const isSamplePackCategory = () => {
    const categoryId = Number(filtersObject.categoryID);
    if (!categoryId) return false; // Nếu không có categoryID thì không ẩn

    // Là chính "SAMPLE PACKS" (id = 6)
    if (categoryId === 6) return true;

    // Tìm xem có phải con của "SAMPLE PACKS" không
    const parentCategory = categoriesFilter?.find((item) =>
      item.children?.some((child) => child.id === categoryId)
    );
    return parentCategory?.id === 6;
  };

  // Lọc filters: nếu là "SAMPLE PACKS" hoặc con của nó, chỉ giữ "category"
  const filteredFilters = isSamplePackCategory()
    ? filters.filter((section) => section.id === "category")
    : filters;

  const queryParams = new URLSearchParams(location.search);
  const initialCategoryID = queryParams.get("categoryID");
  const initialStartPrice = queryParams.get("startPrice");
  const initialEndPrice = queryParams.get("endPrice");

  const getDefaultOpen = (sectionId) => {
    if (sectionId === "category" && initialCategoryID) return true;
    if (sectionId === "brand") return true;
    if (sectionId === "price" && (initialStartPrice || initialEndPrice)) return true;
    return false;
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["allProducts", filtersObject],
    queryFn: () => ProductApi.getAllProducts(filtersObject),
    keepPreviousData: true,
    enabled: !firstLoad,
  });

  useEffect(() => {
    if (!data) return;
    setPageCount(data?.page);
  }, [data]);

  const updateFilters = (newFilters) => {
    setIsUpdating(true);
    const params = new URLSearchParams();

    if (newFilters.categoryID) params.set("categoryID", newFilters.categoryID);
    if (newFilters.startPrice) params.set("startPrice", newFilters.startPrice);
    if (newFilters.endPrice) params.set("endPrice", newFilters.endPrice);
    if (newFilters.sort) params.set("sort", newFilters.sort);
    if (newFilters.page !== undefined) params.set("page", newFilters.page);
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.brandID) params.set("brandID", newFilters.brandID);

    setTimeout(() => {
      setIsUpdating(false);
    }, 500);

    navigate(`?${params.toString()}`, { replace: true });
    setFiltersObject(newFilters);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  const handleFilterBrand = (brandId) => {
    if (filtersObject.brandID == brandId) {
      updateFilters({
        ...filtersObject,
        brandID: null,
        page: 1,
      });
    } else {
      updateFilters({
        ...filtersObject,
        brandID: brandId,
        page: 1,
      });
    }
  };

  const handleFilterPrice = (option) => {
    if (
      filtersObject.startPrice == priceRanges[option]?.startPrice &&
      filtersObject.endPrice == priceRanges[option]?.endPrice
    ) {
      updateFilters({
        ...filtersObject,
        startPrice: null,
        endPrice: null,
        page: 1,
      });
      return;
    }

    if (priceRanges[option]) {
      updateFilters({
        ...filtersObject,
        ...priceRanges[option],
        page: 1,
      });
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const search = queryParams.get("search") || null;
    const categoryID = queryParams.get("categoryID") || null;
    const startPrice = queryParams.get("startPrice") || null;
    const endPrice = queryParams.get("endPrice") || null;
    const sort = queryParams.get("sort") || null;
    const page = queryParams.get("page");
    const brandID = queryParams.get("brandID") || null;

    setFiltersObject({
      ...filtersObject,
      search: search,
      categoryID: categoryID,
      startPrice: startPrice,
      endPrice: endPrice,
      sort: sort,
      page: page || 1,
      brandID: brandID,
    });

    if (firstLoad) {
      setFirstLoad(false);
    }
  }, [location.search, firstLoad]);

  const handleSort = (option) => {
    updateFilters({
      ...filtersObject,
      sort: option.params,
      page: 1,
    });
  };

  if (error) return <Navigate to="/not-found" />;

  return (
    <div className="bg-white my-10">
      <div>
        <Dialog open={mobileFiltersOpen} onClose={setMobileFiltersOpen} className="relative z-40 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
          />

          <div className="fixed inset-0 z-50 flex">
            <DialogPanel
              transition
              className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl transition duration-300 ease-in-out data-closed:translate-x-full"
            >
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium text-gray-900">Bộ lọc</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="-mr-2 flex size-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon aria-hidden="true" className="size-6" />
                </button>
              </div>

              <form className="mt-4 border-t border-gray-200">
                {filteredFilters.map((section) => (
                  <Disclosure
                    key={section.id}
                    as="div"
                    className="border-t border-gray-200 px-4 py-6"
                    defaultOpen={getDefaultOpen(section.id)}
                  >
                    <h3 className="-mx-2 -my-3 flow-root">
                      <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                        <span className="font-medium text-gray-900">{section.name}</span>
                        <span className="ml-6 flex items-center">
                          <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                          <MinusIcon aria-hidden="true" className="size-5 group-not-data-open:hidden" />
                        </span>
                      </DisclosureButton>
                    </h3>
                    <DisclosurePanel className="pt-6">
                      {!isLoadingCategories || !loadingBranchs ? (
                        <div className="space-y-6">
                          {section.options.map((option, optionIdx) => (
                            <div
                              key={option.value}
                              className={`${option.indent === 1 && "ml-5"} flex gap-3 cursor-pointer`}
                            >
                              <div className="flex h-5 shrink-0 items-center">
                                <div className="group grid size-4 grid-cols-1">
                                  <input
                                    defaultValue={option.value}
                                    checked={option.checked}
                                    onChange={() => {
                                      if (section.id === "category") {
                                        updateFilters({
                                          ...filtersObject,
                                          categoryID:
                                            filtersObject.categoryID == option.id ? null : option.id,
                                          page: 1,
                                        });
                                      } else if (section.id === "price") {
                                        handleFilterPrice(option.value);
                                      } else if (section.id === "brand") {
                                        handleFilterBrand(option.value);
                                      }
                                    }}
                                    id={`filter-${section.id}-${optionIdx}`}
                                    name={`${section.id}[]`}
                                    type="checkbox"
                                    className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-yellow-600 checked:bg-yellow-600 indeterminate:border-yellow-600 indeterminate:bg-yellow-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                                  />
                                  <svg
                                    fill="none"
                                    viewBox="0 0 14 14"
                                    className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                                  >
                                    <path
                                      d="M3 8L6 11L11 3.5"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="opacity-0 group-has-checked:opacity-100"
                                    />
                                    <path
                                      d="M3 7H11"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="opacity-0 group-has-indeterminate:opacity-100"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <label
                                htmlFor={`filter-${section.id}-${optionIdx}`}
                                className="min-w-0 flex-1 text-gray-500"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="flex gap-3 items-center">
                              <Skeleton height={20} width={20} />
                              <Skeleton height={20} width={150} />
                            </div>
                          ))}
                        </div>
                      )}
                    </DisclosurePanel>
                  </Disclosure>
                ))}
              </form>
            </DialogPanel>
          </div>
        </Dialog>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-gray-300 pb-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Danh mục sản phẩm </h1>

            <div className="flex items-center">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <MenuButton className="group cursor-pointer inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sắp xếp
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="-mr-1 ml-1 size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
                    />
                  </MenuButton>
                </div>

                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-30 origin-top-right rounded-md bg-white ring-1 shadow-2xl ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  <div className="overflow-hidden rounded-md">
                    {sortOptions.map((option) => (
                      <MenuItem key={option.name}>
                        <button
                          className={classNames(
                            option.current ? "font-medium text-gray-900" : "text-gray-500",
                            "block px-4 py-2 text-sm w-full cursor-pointer data-focus:bg-gray-100 data-focus:outline-hidden"
                          )}
                          onClick={() => handleSort(option)}
                        >
                          {option.name}
                        </button>
                      </MenuItem>
                    ))}
                  </div>
                </MenuItems>
              </Menu>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
              >
                <FunnelIcon aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>

          <section className="pt-6 pb-24">
            <div className="grid grid-cols-1 gap-x-4 gap-y-10 lg:grid-cols-4">
              <form className="hidden lg:block">
                {filteredFilters.map((section) => (
                  <Disclosure
                    key={section.id}
                    as="div"
                    className="border-b border-gray-200 py-6"
                    defaultOpen={getDefaultOpen(section.id)}
                  >
                    <h3 className="-my-3 flow-root">
                      <DisclosureButton className="group cursor-pointer flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                        <span className="font-medium text-gray-900">{section.name}</span>
                        <span className="ml-6 flex items-center">
                          <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                          <MinusIcon aria-hidden="true" className="size-5 group-not-data-open:hidden" />
                        </span>
                      </DisclosureButton>
                    </h3>
                    <DisclosurePanel className="pt-6">
                      {!isLoadingCategories ? (
                        <div className="space-y-4">
                          {section.options.map((option, optionIdx) => (
                            <div
                              key={option.value}
                              className={`${option.indent === 1 && "ml-5"} flex gap-3 cursor-pointer`}
                            >
                              <div className="flex h-5 shrink-0 items-center">
                                <div className="group grid size-4 grid-cols-1">
                                  <input
                                    defaultValue={option.value}
                                    checked={option.checked}
                                    onChange={() => {
                                      if (section.id === "category") {
                                        updateFilters({
                                          ...filtersObject,
                                          categoryID:
                                            filtersObject.categoryID == option.id ? null : option.id,
                                          page: 1,
                                        });
                                      } else if (section.id === "price") {
                                        handleFilterPrice(option.value);
                                      } else if (section.id === "brand") {
                                        handleFilterBrand(option.value);
                                      }
                                    }}
                                    id={`filter-${section.id}-${optionIdx}`}
                                    name={`${section.id}[]`}
                                    type="checkbox"
                                    className="col-start-1 cursor-pointer row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-yellow-600 checked:bg-yellow-600 indeterminate:border-yellow-600 indeterminate:bg-yellow-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                                  />
                                  <svg
                                    fill="none"
                                    viewBox="0 0 14 14"
                                    className="pointer-events-none mb-[1px] col-start-1 row-start-1 size-3 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                                  >
                                    <path
                                      d="M3 8L6 11L11 3.5"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="opacity-0 group-has-checked:opacity-100"
                                    />
                                    <path
                                      d="M3 7H11"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="opacity-0 group-has-indeterminate:opacity-100"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <label
                                htmlFor={`filter-${section.id}-${optionIdx}`}
                                className="text-sm cursor-pointer text-gray-600"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="flex gap-3 items-center">
                              <Skeleton height={20} width={20} />
                              <Skeleton height={20} width={150} />
                            </div>
                          ))}
                        </div>
                      )}
                    </DisclosurePanel>
                  </Disclosure>
                ))}
              </form>

              <div className="lg:col-span-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:ml-16">
                  {(isLoading || isUpdating) ? (
                    Array.from({ length: 6 }).map((_, index) => <ProductSkeleton key={index} />)
                  ) : data?.products.length > 0 ? (
                    data?.products?.map((product) => <ProductCard key={product.id} data={product} />)
                  ) : (
                    <div className="text-center text-gray-500 col-span-3">
                      <img src={empty} alt="empty" className="mx-auto w-20 opacity-70 mb-5" />
                      Không có sản phẩm nào được tìm thấy.
                    </div>
                  )}
                </div>
                {data?.page > 1 && (
                  <ReactPaginate
                    pageCount={pageCount}
                    forcePage={Number(filtersObject.page) - 1}
                    containerClassName="flex justify-center mt-8 space-x-2 items-center"
                    pageLinkClassName="text-gray-700 w-8 h-8 flex items-center cursor-pointer justify-center rounded-full"
                    activeLinkClassName="bg-gray-700 text-white"
                    nextLabel={<GrFormNext className="cursor-pointer text-3xl" />}
                    previousLabel={<GrFormPrevious className="cursor-pointer text-3xl" />}
                    onPageChange={(page) => {
                      updateFilters({
                        ...filtersObject,
                        page: page.selected + 1,
                      });
                    }}
                  />
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}