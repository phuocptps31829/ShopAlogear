<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Color;
use App\Models\Coupon;
use App\Models\Image;
use App\Models\ImageUpload;
use App\Models\Option;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductCoupon;
use App\Models\ProductOrder;
use App\Models\ProductSale;
use App\Models\Sale;
use App\Models\ViewCount;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use function Laravel\Prompts\select;

class ProductController extends Controller
{
    public function delete($id)
    {
        try {
            if (!$id) {
                return createError(400, 'ID Không được trống!');
            }

            $product = Product::find($id);

            if (!$product) {
                return createError(404, 'Không tìm thấy sản phẩm!');
            }

            $order = ProductOrder::where('productID', $id)->join('order','order.id','product_order.orderID')->where('order.success',1) ->first();

            if ($order) {
                return createError(409, "Sản phẩm đã có đơn hàng!");
            }

            $product->delete();
//
            $sale = ProductSale::where('productID', $id)->get();
            if ($sale->isNotEmpty()) {
                $sale->each(function ($item) {
                    $item->delete();
                });
            }

            $coupon = ProductCoupon::where('productID', $id)->get();
            if ($coupon->isNotEmpty()) {
                $coupon->each(function ($item) {
                    $item->delete();
                });
            }

            $categories = ProductCategory::where('productID', $id)->get();
            if ($categories->isNotEmpty()) {
                $categories->each(function ($item) {
                    $item->delete();
                });
            }

            $images = Image::where('productID', $id)->get();

            if ($images->isNotEmpty()) {
                $color = Color::whereIn('id', $images->pluck('colorID'))->get();
                if ($color) {
                    $color->each->delete();
                }
            }

            $images->each->delete();


            return response()->json([
                'status' => 'success',
                'message' => 'Xóa thành công!',
                'data' => $product,
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function update(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string',
                'description' => 'nullable|string',
                'detail' => 'nullable|string',
                'price' => 'nullable|integer',
                'discount' => 'nullable|integer',
                'status' => 'required|integer|in:0,1',
                'quantity' => 'required|integer',
                'code' => 'nullable|string',
                'iframe' => 'nullable|string',
                'type' => 'required|integer',
                'images' => 'nullable|array',
                'categories' => 'nullable|array',
                'options' => 'nullable|array',
                'brandID'=>'nullable|integer',
            ], [
                'name.required' => 'Tên danh mục không được để trống!',
                'name.string' => 'Tên danh mục phải là chuỗi!',

                'description.string' => 'Mô tả phải là kiểu chuỗi!',

                'detail.string' => 'Chi tiết phải là kiểu chuỗi!',

                'price.required' => 'Giá sản phẩm không được để trống!',
                'price.integer' => 'Giá sản phẩm phải là số nguyên!',

                'discount.nullable' => 'Giảm giá không được để trống!',
                'discount.integer' => 'Giảm giá phải là số nguyên!',

                'status.integer' => 'Trạng thái phải là số nguyên!',
                'status.in' => 'Trạng thái chỉ được nhập 0 hoặc 1!',

                'quantity.required' => 'Số lượng không được để trống!',
                'quantity.integer' => 'Số lượng phải là số nguyên!',

                'code.string' => 'Mã sản phẩm phải là chuỗi!',

                'iframe.string' => 'Iframe phải là chuỗi!',

                'type.integer' => 'Loại sản phẩm phải là số nguyên!',

                'images.array' => 'Hình ảnh phải là một mảng!',

                'categories.array' => 'Danh mục phải là một mảng!',

                'options.array' => 'Danh mục lựa chọn phải là một mảng!',
            ]);
            $id = $request->id;
            $product = Product::find($id);
            if (!$product) {
                return createError(404, "Không tìm thấy sản phẩm!");
            }

            if ($request->code && $request->code != $product->code) {
                $checkCode = Product::where("code", $request->code)->first();

                if ($checkCode) {
                    return createError(409, "Mã sản phẩm đã tồn tại!");
                }
                $product->code = $request->code;

            }
            if ($request->name && $request->name != $product->name) {
                $product->name = $request->name;
                $product->slug = checkSlug($request->name, 'product');
            }
            if (isset($request->quantity) && $request->quantity != $product->quantity) {
                $product->quantity = $request->quantity;
            }
            if (isset($request->status)) {
                $product->status = $request->status;
            }
            if (isset($request->brandID)) {
                $product->brandID = $request->brandID;
            }
            if ($request->type) {
                if ($product->type == 2 && $request->type == 1) {
                    $product->type = $request->type;
                    $product->price = $request->price;
                    $product->discount = $request->discount;
                } else if ($product->type == 1 && $request->type == 2) {
                    $product->type = $request->type;
                } else if ($product->type == 4) {
                    $product->price = $request->price;
                    $product->discount = $request->discount;
                } else {
                    if (isset($request->price)) {
                        $product->price = $request->price;
                    }

                    if (isset($request->discount)) {
                        $product->discount = $request->discount;
                    }
                }
            } else {
                if (isset($request->price)) {
                    $product->price = $request->price;
                }

                if (isset($request->discount)) {
                    $product->discount = $request->discount;
                }
            }
            if ($request->iframe) {
                $product->iframe = $request->iframe;
            }
            if ($request->description) {
                $product->description = $request->description;
            }
            if ($request->detail) {
                $product->detail = $request->detail;
            }

            $product->save();

            $imageList = [];
            $colorList = [];
            $colorMap = [];
            $categoryList = [];
            $categoryListID = [];
            $optionList = [];
            $optionListID = [];
            $colorListID = [];
            $imageListID = [];

            if ($request->images && is_array($request->images)) {
//                Duyệt qua các màu và cập nhật trạng thái
                if (is_array($request->colors)) {

                    foreach ($request->colors as $color) {
                        if (isset($color['id'])) {
                            $newColor = Color::where('id', $color['id'])->first();
                            $newColor->update([
                                "name" => $color['name'],
                                "code" => $color['code'],
                                "status" => $color['status'],
                            ]);
                            $colorMap[$color['key']] = $newColor->id;
                            $colorList[] = $color;
                            $colorListID[] = $newColor->id;
                        } else {
//                Nếu không có id thì tạo màu mới
                            $newColor = Color::create([
                                "name" => $color['name'],
                                "code" => $color['code'],
                                "status" => $color['status'],
                            ]);

                            $colorMap[$color['key']] = $newColor->id;
                            $colorList[] = $newColor;
                            $colorListID[] = $newColor->id;
                        }
                    }

                }
                foreach ($request->images as $image) {
                    if (isset($image['id'])) {
                        $colorID = null;

                        if (!empty($image['key']) && isset($colorMap[$image['key']])) {
                            $colorID = $colorMap[$image['key']];
                        }
                        $newImage = Image::where('id', $image['id'])->first();
                        if ($newImage->image != $image['image']) {
                            checkImage($newImage->image);
                        }
                        $newImage->update([
                            "image" => $image['image'],
                            "number" => $image['number'],
                            "colorID" => $colorID,
                            "status" => $image['status'],
                        ]);
                        $imageList[] = $newImage;
                        $imageListID[] = $newImage->id;
                    } else {
                        $colorID = null;

                        if (!empty($image['key']) && isset($colorMap[$image['key']])) {
                            $colorID = $colorMap[$image['key']];
                        }

                        $newImage = Image::create([
                            "productID" => $product->id,
                            "image" => $image['image'],
                            "number" => $image['number'],
                            "colorID" => $colorID,
                            "status" => $image['status'],
                        ]);
                        $imageList[] = $newImage;
                        $imageListID[] = $newImage->id;
                    }
                }
                if (!empty($imageList)) {
                    $imageDelete = Image::whereNotIn('id', $imageListID)->where('productID', $product->id)->get();
                    $imageDelete->each(function ($imageDelete) {
                        checkImage($imageDelete->image);
                    });
                    $imageDelete->each->delete();
                }
                if (!empty($colorListID)) {
                    Color::leftJoin("image", "image.colorID", "=", "color.id")
                        ->whereNotIn("color.id", $colorListID)
                        ->where("image.productID", $product->id)
                        ->whereNull("image.id")
                        ->delete();
                }
            }
            if ($request->categories && is_array($request->categories)) {
                foreach ($request->categories as $category) {
                    if (isset($category['id'])) {
                        $newCategory = Category::find($category['id']);
                        $newCategory->update([
                            "categoryID" => $category['categoryID']
                        ]);
                        $categoryList[] = $category;
                        $categoryListID[] = $category->id;
                    } else {
                        $category = ProductCategory::create([
                            "productID" => $product->id,
                            "categoryID" => $category['categoryID']
                        ]);
                        $categoryList[] = $category;
                        $categoryListID[] = $category->id;
                    }
                }
                if (!empty($categoryListID)) {
                    ProductCategory::whereNotIn('id', $categoryListID)->where('productID', $product->id)->delete();
                }
            }

            if ($request->options && is_array($request->options)) {
                foreach ($request->options as $option) {
                    if (isset($option['id'])) {
                        $newOption = Option::find($option['id']);
                        $newOption->update([
                            "name" => $option['name'],
                            "categoryID" => $option['categoryID'],
                            "image" => $option['image'],
                            "number" => $option['number'],
                        ]);
                        $optionList[] = $option;
                        $optionListID[] = $newOption->id;
                    } else {
                        $newOption = Option::create([
                            "productID" => $product->id,
                            "categoryID" => $option['categoryID'],
                            "name" => $option['name'],
                            "image" => $option['image'],
                            "number" => $option['number'],
                        ]);
                        $optionList[] = $newOption;
                        $optionListID[] = $newOption->id;
                    }
                }
                if (!empty($optionListID)) {
                    Option::whereNotIn('id', $optionListID)->where('productID', $product->id)->delete();
                }
            }


            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật thành công!',
                'data' => [
                    "product" => $product,
                    "category" => $categoryList ? $categoryList : null,
                    "images" => $imageList ? $imageList : null,
                    "colors" => $colorList ? $colorList : null,
                    "options" => $optionList ? $optionList : null,
                ],
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }

    }

    public
    function create(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string',
                'description' => 'nullable|string',
                'detail' => 'nullable|string',
                'price' => 'nullable|integer',
                'discount' => 'nullable|integer',
                'status' => 'required|integer|in:0,1',
                'quantity' => 'required|integer',
                'code' => 'nullable|string',
                'brandID' => 'nullable|integer',
                'iframe' => 'nullable|string',
                'type' => 'required|integer',
                'images' => 'nullable|array',
                'categories' => 'nullable|array',
                'options' => 'nullable|array',
            ], [
                'name.required' => 'Tên danh mục không được để trống!',
                'name.string' => 'Tên danh mục phải là chuỗi!',

                'description.string' => 'Mô tả phải là kiểu chuỗi!',

                'detail.string' => 'Chi tiết phải là kiểu chuỗi!',

                'price.required' => 'Giá sản phẩm không được để trống!',
                'price.integer' => 'Giá sản phẩm phải là số nguyên!',

                'discount.nullable' => 'Giảm giá không được để trống!',
                'discount.integer' => 'Giảm giá phải là số nguyên!',

                'status.integer' => 'Trạng thái phải là số nguyên!',
                'status.in' => 'Trạng thái chỉ được nhập 0 hoặc 1!',

                'quantity.required' => 'Số lượng không được để trống!',
                'quantity.integer' => 'Số lượng phải là số nguyên!',

                'code.string' => 'Mã sản phẩm phải là chuỗi!',

                'iframe.string' => 'Iframe phải là chuỗi!',

                'type.integer' => 'Loại sản phẩm phải là số nguyên!',

                'images.array' => 'Hình ảnh phải là một mảng!',

                'categories.array' => 'Danh mục phải là một mảng!',

                'options.array' => 'Danh mục lựa chọn phải là một mảng!',
            ]);

            if ($request->code) {
                $checkCode = Product::where("code", $request->code)->first();

                if ($checkCode) {
                    return createError(409, "Mã sản phẩm đã tồn tại!");
                }

            }

            $product = Product::create([
                "name" => $request->name,
                "description" => $request->description,
                "detail" => $request->detail,
                "price" => $request->price,
                "discount" => $request->discount,
                "type" => $request->type,
                "status" => $request->status,
                "code" => $request->code ? $request->code : null,
                "slug" => checkSlug($request->name, 'product'),
                "iframe" => $request->iframe,
                "quantity" => $request->quantity,
                "viewCount" => 0,
                "brandID"=>$request->brandID
            ]);

            if ($product->code == null) {
                $product->code = "SP" . $product->id;
                $product->save();
            }

            $imagelist = [];
            $colorList = [];
            $colorMap = [];
            $categoryList = [];
            $optionList = [];

            if ($request->images && is_array($request->images)) {

                if (is_array($request->colors)) {
                    foreach ($request->colors as $color) {
                        $newColor = Color::create([
                            "name" => $color['name'],
                            "code" => $color['code'],
                            "status" => $color['status'],
                        ]);

                        $colorMap[$color['key']] = $newColor->id;
                        $colorList[] = $newColor;
                    }
                }

                foreach ($request->images as $image) {
                    $colorID = null;

                    if (!empty($image['key']) && isset($colorMap[$image['key']])) {
                        $colorID = $colorMap[$image['key']];
                    }

                    $newImage = Image::create([
                        "productID" => $product->id,
                        "image" => $image['image'],
                        "number" => $image['number'],
                        "colorID" => $colorID,
                        "status" => $image['status'],
                    ]);
                    $imagelist[] = $newImage;
                }
            }
            if ($request->categories && is_array($request->categories)) {
                foreach ($request->categories as $category) {
                    $category = ProductCategory::create([
                        "productID" => $product->id,
                        "categoryID" => $category['categoryID']
                    ]);
                    $categoryList[] = $category;
                }
            }

            if ($request->options && is_array($request->options)) {
                foreach ($request->options as $option) {
                    $option = Option::create([
                        "productID" => $product->id,
                        "categoryID" => $option['categoryID'],
                        "name" => $option['name'],
                        "image" => $option['image'],
                        "number" => $option['number'],
                    ]);
                    $optionList[] = $option;
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => [
                    "product" => $product,
                    "category" => $categoryList ? $categoryList : null,
                    "images" => $imagelist ? $imagelist : null,
                    "colors" => $colorList ? $colorList : null,
                    "options" => $optionList ? $optionList : null,
                ],
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public
    function getOne(Request $request)
    {
        try {
            $id = $request->id;

            $products = Product::select([
                'product.id',
                'product.name',
                'product.price',
                'product.slug',
                'product.type',
                'product.status',
                'product.code',
                'product.quantity',
                'product.viewCount',
                'product.detail',
                'product.brandID',
                'product.description',
                'product.iframe',
                'product.discount',
            ])
                ->where('product.id', $id)
                ->with(['brand' => function ($query) {
                    $query
                        ->select(['id', 'name']);
                }])
                ->with(['images' => function ($query) {
                    $query->orderBy("number", "ASC")
                        ->select(['id', 'productID', 'colorID', 'image', 'number', 'status']);
                }])
                ->with(['options' => function ($query) {
                    $query->orderBy("number", "ASC")
                        ->select(['id', 'productID', 'categoryID', 'name', 'number', 'image']);
                }]);
            $products = $products->first();

            if ($products) {
                $color = Color::whereIn("id", $products->images->pluck('colorID')->unique()->values())->get(['id', 'name', 'code']);
                $products->colors = $color;

                $categories = Category::
                select([
                    "category.id",
                    "category.name",
                    "category.slug",
                    "category.parent",
                ])
                    ->join('product_category as pc', "pc.categoryID", "=", "category.id")
                    ->where('pc.productID', $products->id)
                    ->where('category.status', 1)
                    ->get();
                $products->categories = $categories;
            } else {
                return createError(404, "Không tìm thấy sản phẩm");
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => $products ? $products : null,
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public
    function getList(Request $request)
    {
        try {
            $startTime = $request->startTime;
            $endTime = $request->endTime;
            $option = $request->option; // 1 là flash sale  2 là giảm giá bình thường
            $categoryID = $request->categoryID;
            $limit = $request->limit ?? 6;
            $skip = $request->skip;
            $sort = $request->sort;
            $startPrice = $request->startPrice;
            $endPrice = $request->endPrice;
            $search = $request->search;
            $productIDs = $request->productIDs;
            $exclude = $request->exclude;
            $all = $request->all;
            $type = $request->type;
            $page = $request->page ?? 1;
            $brandID = $request->brandID;

            $sale = DB::table('sale')
                ->where('sale.startTime', '<=', Carbon::now())
                ->where('sale.endTime', '>=', Carbon::now())
                ->where('sale.status', 1)
                ->join('product_sale as ps', 'sale.id', '=', 'ps.saleID')
                ->select([
                    "ps.saleID",
                    "ps.productID",
                    "ps.discount",
                    "ps.percent",
                    "ps.number",
                ]);

            $color = DB::table('image as i')
                ->join('color as c', 'c.id', '=', 'i.colorID')
                ->select(
                    'i.productID',
                    DB::raw("JSON_ARRAYAGG(DISTINCT JSON_OBJECT('colorID', c.id, 'colorName', c.name, 'code', c.code)) as colors")
                )
                ->groupBy('i.productID');

            $products = Product::select([
                'product.id',
                'product.name',
                'product.price',
                'product.slug',
                'product.type',
                'product.status',
                'product.discount',
                'product.code',
                'product.brandID',
                'product.quantity',
                'product.viewCount',
                'product_sale.number',
                'i.image',
                'color.colors',
                "product_sale.saleID"
            ])
                ->with(['brand' => function ($query) {
                    $query
                        ->select(['id', 'name']);
                }])
                ->leftJoinSub($sale, 'product_sale', function ($join) {
                    $join->on('product.id', '=', 'product_sale.productID');
                })
                ->leftJoin('image as i', function ($join) {
                    $join->on('product.id', '=', 'i.productID')
                        ->whereRaw('i.id = (SELECT id FROM image WHERE image.productID = product.id AND image.status = 1 ORDER BY number ASC LIMIT 1)');
                })
                ->leftJoinSub($color, 'color', function ($join) {
                    $join->on('product.id', '=', 'color.productID');
                })
                ->with(['options' => function ($query) {
                    $query->orderBy("number", "ASC")
                        ->select(['id', 'productID', 'categoryID', 'name', 'number']);
                }]);

            if ($startTime && $endTime && $option) {

                $checkSale = DB::table('sale')
                    ->where('sale.startTime', '<=', $startTime)
                    ->where('sale.endTime', '>=', $endTime)
                    ->where('sale.type', $option)
                    ->join('product_sale as ps', 'sale.id', '=', 'ps.saleID')
                    ->select([
                        "ps.saleID",
                        "ps.productID",
                        "ps.discount",
                        "ps.percent",
                        "ps.number",
                    ]);

                $products->leftJoinSub($checkSale, 'checkProduct', function ($join) {
                    $join->on('product.id', '=', 'checkProduct.productID');
                });
                $products->whereNull("checkProduct.productID");
                $products->where(function ($query) {
                    $query->where("product.type", "=", 1);
//                    $query->Where("product.type", "!=", 3);
                });

            } elseif ($startTime && $endTime && !$option) {
                $products->whereBetween(DB::raw("DATE(product.created_at)"), [$startTime, $endTime]);
            }

            if (is_array($productIDs)) {
                $productIDs = array_map('intval', $productIDs);
                $products->whereIn('product.id', $productIDs);
            }

            if (is_array($exclude) && $exclude[0]) {
                $products->whereNotIn('product.slug', $exclude);
            }

            if($brandID) {
                $products->where('product.brandID', $brandID);
            }
            if ($categoryID) {
                $categoryID = (int)$categoryID;
                $checkCategory = Category::where('parent', $categoryID)->pluck('id')->toArray();
                $allCategoryIDs = array_merge([$categoryID], $checkCategory);
                $categories = DB::table('product_category')
                    ->whereIn('categoryID', $allCategoryIDs)
                    ->groupBy('productID')
                    ->select([
                        "productID",
                    ]);
                $products->joinSub($categories, 'product_category', function ($join) {
                    $join->on('product.id', '=', 'product_category.productID');
                });
            }
            if ($type) {
                if ($type == 3)
                    $products->where('product.type', '=', (int)$type);
                else
                    $products->where('product.type', '!=', 3);
            }

            if ($startPrice) {
                $products->having('discount', '>=', (int)$startPrice);
            }
            if ($endPrice) {
                $products->having('discount', '<=', (int)$endPrice);
            }

            if (isset($search)) {
                $products->where(function ($query) use ($search) {
                    $query->where("product.name", "like", "%" . $search . "%")
                        ->orWhere("product.code", "like", "%" . $search . "%");
                });
            }

            $allRecords = clone $products;
            $totalRecords = $allRecords->count();

            if ($sort == 1) {
                $products->orderBy('product.name', "ASC");
            } elseif ($sort == 2) {
                $products->orderBy('product.name', "DESC");
            } elseif ($sort == 3) {
                $products->orderBy('product.discount', "ASC");
            } elseif ($sort == 4) {
                $products->orderBy('product.discount', "DESC");
            } elseif ($sort == 5) {
                $products->orderBy('product.id', "ASC");
            } elseif ($sort == 6) {
                $products->orderBy('product.id', "DESC");
            } elseif ($sort == 7) {
                $products->orderBy('product.viewCount', "ASC");
            } elseif ($sort == 8) {
                $products->orderBy('product.viewCount', "DESC");
            } elseif ($sort == 10) {
                $products->orderBy('product.quantity', "ASC");
            }  elseif ($sort == 11) {
                $products->orderBy('product.quantity', "DESC");
            }    else {
                $products->orderBy('product.name', "ASC");
            }

            if ($skip && $limit) {
                $products->skip((int)$skip);
            }
            if ($limit && !$all) {
                if ($page) {
                    $skip = ((int)$page - 1) * $limit;
                    $products->skip((int)$skip);
                }
                $products->take((int)$limit);
            }
            $products = $products->get();
            $products->each(function ($product) {
                if (is_string($product->colors)) {
                    $colorList = json_decode($product->colors, true);
                    $product->colors = $colorList;
                }
            });
            $response = [
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => [
                    "totalRecords" => $totalRecords,
                    "products" => $products ? $products : null,
                    "page" => $products ? ceil($totalRecords / $limit) : null,
                ]
            ];

            return response()->json($response, 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }


    public
    function getFlashSale(Request $request)
    {
        try {
            $color = DB::table('image as i')
                ->join('color as c', 'c.id', '=', 'i.colorID')
                ->where('i.status', 1)
                ->whereRaw('i.id = (
                                SELECT id FROM image
                                WHERE productID = i.productID
                                AND status = 1
                                ORDER BY number ASC LIMIT 1
                                     )')
                ->select('i.productID', 'c.name as colorName', 'c.id as colorID');
            $products = sale::select([
                'sale.endTime',
                'ps.discount',
                'ps.percent',
                'ps.number',
                'p.code',
                'p.quantity',
                'p.id',
                'p.type',
                'p.brandID',
                'p.name',
                'p.price',
                'p.slug',
                'p.viewCount',
                'i.image',
                'color.colorName',
                'color.colorID',
            ])

                ->where('sale.startTime', '<=', Carbon::now())
                ->where('sale.endTime', '>=', Carbon::now())
                ->where('sale.status', 1)
                ->where('sale.type', '=', 1)
                ->join('product_sale as ps', 'sale.id', '=', 'ps.saleID')
                ->join('product as p', 'p.id', '=', 'ps.productID')
                ->leftJoin('image as i', function ($join) {
                    $join->on('p.id', '=', 'i.productID')
                        ->whereRaw('i.id = (SELECT id FROM image WHERE image.productID = p.id AND image.status = 1 ORDER BY number ASC LIMIT 1)');
                })
                ->leftJoinSub($color, 'color', function ($join) {
                    $join->on('p.id', '=', 'color.productID');
                })
                ->orderBy('ps.number', 'ASC')
                ->get();

            $status = 0;
            if (!$products->isEmpty()) {
                $status = 1;
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => [
                    'status' => $status,
                    'products' => $status ? $products->makeHidden(['endTime']) : null,
                    'endTime' => $status ? max(0, Carbon::now()->diffInSeconds($products[0]->endTime, false)) : null,
                ]
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public
    function getAllProduct(Request $request)
    {
        try {
            $categoryID = $request->categoryID;
            $notSamplePacks = $request->notSamplePacks;
            $limit = $request->limit ?? 6;
            $skip = $request->skip;
            $sort = $request->sort;
            $startPrice = $request->startPrice;
            $endPrice = $request->endPrice;
            $search = $request->search;
            $productIDs = $request->productIDs;
            $exclude = $request->exclude;
            $all = $request->all;
            $type = $request->type;
            $page = $request->page ?? 1;

            $sale = DB::table(DB::raw("
                                    (
                                        SELECT
                                            ps.productID,
                                            ps.discount,
                                            ps.percent,
                                            ps.number,
                                            s.type,
                                            s.status,
                                            ROW_NUMBER() OVER (PARTITION BY ps.productID ORDER BY s.type ASC) as rank
                                        FROM sale s
                                        JOIN product_sale ps ON s.id = ps.saleID
                                        WHERE s.startTime <= NOW()
                                        AND s.endTime >= NOW()
                                        AND s.status = 1
                                    ) as sale_filtered
                                "))
                ->where('sale_filtered.rank', 1);

            $color = DB::table('image as i')
                ->join('color as c', 'c.id', '=', 'i.colorID')
                ->where('i.status', 1)
                ->whereRaw('i.id = (
                                SELECT id FROM image
                                WHERE productID = i.productID
                                AND status = 1
                                ORDER BY number ASC LIMIT 1
                                     )')
                ->select('i.productID', 'c.name as colorName', 'c.id as colorID');
            $products = Product::select([
                'product.id',
                'product.name',
                'product.price',
                'product.slug',
                'product.type',
                'product.code',
                'product.brandID',
                'product.quantity',
                'product.viewCount',
                'product_sale.number',
                'i.image',
                'color.colorName',
                'color.colorID',
                DB::raw('COALESCE(product_sale.discount, product.discount,product.price) as discount'),
            ])
                ->with(['brand' => function ($query) {
                    $query
                        ->select(['id', 'name']);
                }])
                ->where('product.status', 1)
                ->leftJoinSub($sale, 'product_sale', function ($join) {
                    $join->on('product.id', '=', 'product_sale.productID');
                })
                ->leftJoin('image as i', function ($join) {
                    $join->on('product.id', '=', 'i.productID')
                        ->whereRaw('i.id = (SELECT id FROM image WHERE image.productID = product.id AND image.status = 1 ORDER BY number ASC LIMIT 1)');
                })
                ->leftJoinSub($color, 'color', function ($join) {
                    $join->on('product.id', '=', 'color.productID');
                })
                ->with(['options' => function ($query) {
                    $query->orderBy("number", "ASC")
                        ->select(['id', 'productID', 'categoryID', 'name', 'number']);
                }]);

            if (is_array($productIDs)) {
                $productIDs = array_map('intval', $productIDs);
                $products->whereIn('product.id', $productIDs);
            }
            if($request->brandID) {
                $products->where('product.brandID', $request->brandID);
            }
            if (is_array($exclude) && $exclude[0]) {
                $products->whereNotIn('product.slug', $exclude);
            }

            if ($categoryID) {
                $categoryID = (int)$categoryID;
                $checkCategory = Category::where('parent', $categoryID)->where('status', 1)->pluck('id')->toArray();
                $allCategoryIDs = array_merge([$categoryID], $checkCategory);
                $categories = DB::table('product_category')
                    ->whereIn('categoryID', $allCategoryIDs)
                    ->groupBy('productID')
                    ->select([
                        "productID",
                    ]);
                $products->joinSub($categories, 'product_category', function ($join) {
                    $join->on('product.id', '=', 'product_category.productID');
                });
            }
            if($notSamplePacks){
                $products->where('product.type', '!=', 4);
            }

            if ($type) {
                if ($type == 3)
                    $products->where('product.type', '=', (int)$type);
                else
                    $products->where('product.type', '!=', 3);
            }

            if ($startPrice) {
                $products->having('discount', '>=', (int)$startPrice);
            }
            if ($endPrice) {
                $products->having('discount', '<=', (int)$endPrice);
            }

            if (isset($search)) {

                $categoryIDs = DB::table('category')
                        ->where("name", "like", "%" . $search . "%")
                        ->where('status', 1)
                        ->join('product_category', 'product_category.categoryID', '=', 'category.id')
                        ->select([
                            "product_category.productID",
                        ])->pluck('productID')->toArray();

                $products->where(function ($query) use ($search,$categoryIDs ) {
                    $query->where("product.name", "like", "%" . $search . "%")
                        ->orWhere("product.code", "like", "%" . $search . "%");
                         if (!empty($categoryIDs)) {
                             $query->orWhereIn("product.id", $categoryIDs);
                         }
                });
            }

            $allRecords = clone $products;
            $totalRecords = $allRecords->count();

            if ($sort == 1) {
                $products->orderBy('product.name', "ASC");
            } elseif ($sort == 2) {
                $products->orderBy('product.name', "DESC");
            } elseif ($sort == 3) {
                $products->orderBy('discount', "ASC");
            } elseif ($sort == 4) {
                $products->orderBy('discount', "DESC");
            } elseif ($sort == 5) {
                $products->orderBy('id', "ASC");
            } elseif ($sort == 6) {
                $products->orderBy('id', "DESC");
            } elseif ($sort == 7) {
                $products->orderBy('viewCount', "ASC");
            } elseif ($sort == 8) {
                $products->orderBy('viewCount', "DESC");
            }if ($sort == 9) {
                $topViews = Product::select('id')
                    ->orderBy('viewCount', 'DESC')
                    ->limit(2);
                $products->leftJoinSub($topViews, 'top_products', function ($join) {
                         $join->on('product.id', '=', 'top_products.id');
                     })
                    ->orderByRaw("CASE WHEN top_products.id IS NOT NULL THEN 0 ELSE 1 END")
                    ->orderBy("product.id", "DESC");
            }

            if ($skip && $limit) {
                $products->skip((int)$skip);
            }
            if ($limit && !$all) {
                if ($page) {
                    $skip = ((int)$page - 1) * $limit;
                    $products->skip((int)$skip);
                }
                $products->take((int)$limit);
            }
            $products = $products->get();

            $response = [
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => [
                    "totalRecords" => $totalRecords,
                    "products" => $products ? $products : null,
                    "page" => $products ? ceil($totalRecords / $limit) : null,
                ]
            ];

            return response()->json($response, 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public
    function getOneProduct(Request $request)
    {
        try {
            $slug = $request->slug;

//            $sale = DB::table('sale')
//                ->where('sale.startTime', '<=', Carbon::now())
//                ->where('sale.endTime', '>=', Carbon::now())
//                ->where('sale.status', 1)
//                ->join('product_sale as ps', 'sale.id', '=', 'ps.saleID')
//                ->select([
//                    "ps.productID",
//                    "ps.discount",
//                    "ps.percent",
//                    "ps.number",
//                ]);
            $sale = DB::table(DB::raw("
                                    (
                                        SELECT
                                            ps.productID,
                                            ps.discount,
                                            ps.percent,
                                            ps.number,
                                            s.type,
                                            s.status,
                                            ROW_NUMBER() OVER (PARTITION BY ps.productID ORDER BY s.type ASC) as rank
                                        FROM sale s
                                        JOIN product_sale ps ON s.id = ps.saleID
                                        WHERE s.startTime <= NOW()
                                        AND s.endTime >= NOW()
                                        AND s.status = 1
                                    ) as sale_filtered
                                "))
                ->where('sale_filtered.rank', 1);
            $products = Product::select([
                'product.id',
                'product.name',
                'product.price',
                'product.slug',
                'product.detail',
                'product.brandID',
                'product.type',
                'product.quantity',
                'iframe',
                'product.viewCount',
                'product.description',
                'product_sale.number',
                DB::raw('COALESCE(product_sale.discount, product.discount,product.price) as discount')
            ])
                ->with(['brand' => function ($query) {
                    $query
                        ->select(['id', 'name']);
                }])
                ->where('product.status', 1)
                ->where('product.slug', $slug)
                ->leftJoinSub($sale, 'product_sale', function ($join) {
                    $join->on('product.id', '=', 'product_sale.productID');
                })
                ->with(['brand'])
                ->with(['images' => function ($query) {
                    $query->orderBy("number", "ASC")
                        ->where('status', 1)
                        ->select(['id', 'productID', 'colorID', 'image', 'number', 'status']);
                }])
                ->with(['options' => function ($query) {
                    $query->orderBy("number", "ASC")
                        ->select(['id', 'productID', 'categoryID', 'name', 'number', 'image']);
                }]);
            $products = $products->first();
            if ($products) {
                $color = Color::whereIn("id", $products->images->pluck('colorID')->unique()->values())->get(['id', 'name', 'code']);
                $products->colors = $color;

                $categories = Category::
                select([
                    "category.id",
                    "category.name",
                    "category.slug",
                    "category.parent",
                ])
                    ->join('product_category as pc', "pc.categoryID", "=", "category.id")
                    ->where('pc.productID', $products->id)
                    ->where('category.status', 1)
                    ->get();
                $products->categories = $categories;
            } else {
                return createError(404, "Không tìm thấy sản phẩm");
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => $products ? $products : null,
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
    public
    function updateQuantity(Request $request)
    {
        try {
            $id = $request->route('id');

            $product = Product::find($id);

            if (!$product) {
                return createError(404, "Không tìm thấy sản phẩm!");
            }

            $product->quantity+=(int)$request->quantity;
            if($product->quantity<0){
                $product->quantity = 0;
            }
            $product->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật thành công!',
                'data' => $product,
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }


    public
    function updateView(Request $request)
    {
        try {
            $slug = $request->slug;

            $product = Product::where('slug', $slug)->first();

            if (!$product) {
                return createError(404, "Không tìm thấy sản phẩm!");
            }

            $product->viewCount++;
            $product->save();
            $today = Carbon::today();

            $checkTimeView = ViewCount::where('productID', $product->id)
                ->whereDate('created_at', $today)
                ->count();

            if ($checkTimeView > 0) {
                ViewCount::where('productID', $product->id)
                    ->whereDate('created_at', $today)
                    ->increment('count');
            } else {
                ViewCount::create([
                    'productID' => $product->id,
                    'count' => 1,
                    'created_at' => now()
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật thành công!',
                'data' => null,
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public
    function checkCoupon(Request $request)
    {
        try {
            $productID = (int)$request->productID;
            $code = $request->coupon;

            $coupon = Coupon::join('product_coupon as pc', 'pc.couponID', '=', 'coupon.id')
                ->where('code', $code)
                ->where('pc.productID', $productID)
                ->where('status', 1)
                ->first([
                    "coupon.name",
                    "coupon.code",
                    "coupon.discount",
                    "coupon.percent",
                    "coupon.type",
                    'coupon.startTime',
                    'coupon.endTime',
                    'pc.productID',
                ]);

            if (!$coupon) {
                return createError(404, "Mã giảm giá sai!");
            }
            if (!Carbon::now()->between(Carbon::parse($coupon->startTime), Carbon::parse($coupon->endTime))) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Lấy dữ liệu thành công!',
                    'data' => [
                        'status' => 0,
                        'product' => null,
                        'coupon' => null,
                    ],
                ], 200);
            }

            $sale = DB::table('sale')
                ->where('sale.startTime', '<=', Carbon::now())
                ->where('sale.endTime', '>=', Carbon::now())
                ->where('sale.status', 1)
                ->join('product_sale as ps', 'sale.id', '=', 'ps.saleID')
                ->select([
                    "ps.productID",
                    "ps.discount",
                    "ps.percent",
                    "ps.number",
                ]);

            $products = Product::select([
                'product.id',
                'product.name',
                'product.price',
                'product.slug',
                'product.type',
                'product.code',
                'product.quantity',
                'i.image',
                DB::raw('COALESCE(product_sale.discount, product.discount,product.price) as discount'),
            ])
                ->where('product.status', 1)
                ->where('product.id', $productID)
                ->leftJoinSub($sale, 'product_sale', function ($join) {
                    $join->on('product.id', '=', 'product_sale.productID');
                })
                ->leftJoin('image as i', function ($join) {
                    $join->on('product.id', '=', 'i.productID')
                        ->whereRaw('i.id = (SELECT id FROM image WHERE image.productID = product.id AND image.status = 1 ORDER BY number ASC LIMIT 1)');
                })->first();
            if ($coupon->type == 1) {
                $products->newPrice = $products->discount - $coupon->discount;
            } else {
                $products->newPrice = $products->discount - ($coupon->percent * $products->discount / 100);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => [
                    'status' => 1,
                    'product' => $products ? $products : null,
                    'coupon' => $coupon ? $coupon : null,
                ],
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }

    }


}
