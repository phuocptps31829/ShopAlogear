<?php

namespace App\Http\Controllers;

use App\Models\Cooperate;
use App\Models\Product;
use App\Models\ProductSale;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function getOne(Request $request)
    {
        try {
            $id = $request->route('id');

            $sale = Sale::
            select([
                "id",
                'name',
                'type',
                'status',
                \DB::raw("CASE
                    WHEN NOW() BETWEEN startTime AND endTime THEN 1
                    ELSE 0
                  END as start")
            ]);

            $sale->selectRaw("DATE_FORMAT(startTime, '%H:%i:%s %d-%m-%Y') as startTime");
            $sale->selectRaw("DATE_FORMAT(endTime, '%H:%i:%s %d-%m-%Y') as endTime");
            $sale->with(['productSales' => function ($query) {
                $query->select(['product_sale.id', 'product_sale.productID', 'product_sale.saleID', 'product_sale.discount','product_sale.number']);
                    $query->orderBy('product_sale.number',"ASC")
                    ->with(['product' => function ($q) {
                        $q->select(['product.id', 'product.name', 'product.discount', 'product.type'])
                            ->leftJoin('image as i', function ($join) {
                                $join->on('product.id', '=', 'i.productID')
                                    ->whereRaw('i.id = (SELECT id FROM image WHERE image.productID = product.id AND image.status = 1 ORDER BY number ASC LIMIT 1)');
                            })
                            ->addSelect('i.image as image');
                    }]);
            }]);

            $sale = $sale->where('id', $id)->first();

            if (!$sale) {
                createError(404, "Không tìm thấy chương trình giảm giá!");
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => $sale
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function getList(Request $request)
    {
        try {

            $skip = $request->skip;
            $limit = $request->limit ?? 10;
            $all = $request->all;
            $page = $request->page ?? 1;

            $sale = Sale::
            select([
                "id",
                'name',
                'type',
                'status',
                \DB::raw("CASE
                    WHEN NOW() BETWEEN startTime AND endTime THEN 1
                    ELSE 0
                  END as start")
            ]);
            $sale->orderBy("id", "DESC");
            $sale->selectRaw("DATE_FORMAT(startTime, '%H:%i:%s %d-%m-%Y') as startTime");
            $sale->selectRaw("DATE_FORMAT(endTime, '%H:%i:%s %d-%m-%Y') as endTime");
            $sale->with(['productSales' => function ($query) {
                $query->select(['product_sale.id', 'product_sale.productID', 'product_sale.saleID', 'product_sale.discount'])
//                    ->leftJoin('color as c', 'product_order.colorID', '=', 'c.id')
                    ->with(['product' => function ($q) {
                        $q->select(['product.id', 'product.name', 'product.discount', 'product.type'])
                            ->leftJoin('image as i', function ($join) {
                                $join->on('product.id', '=', 'i.productID')
                                    ->whereRaw('i.id = (SELECT id FROM image WHERE image.productID = product.id AND image.status = 1 ORDER BY number ASC LIMIT 1)');
                            })
                            ->addSelect('i.image as image');
                    }]);
            }]);


            $allRecords = clone $sale;
            $totalRecords = $allRecords->count();

            if ($skip && $limit) {
                $sale->skip((int)$skip);
            }
            if ($limit && !$all) {
                if ($page) {
                    $skip = ((int)$page - 1) * $limit;
                    $sale->skip((int)$skip);
                }
                $sale->take((int)$limit);
            }

            $sale = $sale->get();
            $response = [
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => [
                    "totalRecords" => $totalRecords,
                    "sale" => $sale ? $sale : null,
                    "page" => $sale ? ceil($totalRecords / $limit) : null,
                ]

            ];
            return response()->json($response, 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function create(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string',
                'startTime' => 'required|string',
                'endTime' => 'required|string',
                'type' => 'required|integer',
                'status' => 'required|integer|in:0,1',
                'products' => 'nullable|array'
            ], [
                'name.required' => 'Tên không được để trống!',
                'name.string' => 'Tên phải là ký tự!',
                'startTime.required' => 'Thời gian bắt đầu không được để trống!',
                'startTime.string' => 'Thời gian bắt đầu phải là ký tự!',
                'endTime.required' => 'Thời gian kết thúc không được để trống!',
                'endTime.string' => 'Thời gian kết thúc phải là ký tự!',
                'type.required' => 'Loại không được để trống!',
                'type.integer' => 'Loại là dạng số',
                'status.required' => 'Trạng thái không được để trống!',
                'status.in' => 'Trạng thái phải là 1 hoặc 0'
            ]);

          if(  (!checkTime($request->startTime) || !checkTime($request->endTime)) && $request->type==1){
             return createError(409, "Khoảng thời gian sale đã tồn tại!");
            }

            $sale = Sale::create([
                "name" => $request->name,
                "startTime" => $request->startTime,
                "endTime" => $request->endTime,
                'type' => $request->type,
                "status" => $request->status
            ]);

            $productList = [];

            if ($request->products) {
                foreach ($request->products as $product) {
                    $newProduct = ProductSale::create([
                        "saleID" => $sale->id,
                        "productID" => $product['productID'],
                        "discount" => $product['discount'],
                        "number" => $product['number'],
                    ]);
                    $productList[] = $newProduct;
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Tạo thành công!',
                'data' => [
                    "sale" => $sale,
                    "products" => $productList
                ],
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function update(Request $request)
    {
        try {
            $id = $request->id;
            $request->validate([
                'name' => 'nullable|string',
                'startTime' => 'nullable|string',
                'endTime' => 'nullable|string',
                'status' => 'nullable|integer|in:0,1',
                'products' => 'nullable|array'
            ], [
                'name.required' => 'Tên không được để trống!',
                'name.string' => 'Tên phải là ký tự!',
                'startTime.required' => 'Thời gian bắt đầu không được để trống!',
                'startTime.string' => 'Thời gian bắt đầu phải là ký tự!',
                'endTime.required' => 'Thời gian kết thúc không được để trống!',
                'endTime.string' => 'Thời gian kết thúc phải là ký tự!',
                'type.required' => 'Loại không được để trống!',
                'type.integer' => 'Loại là dạng số',
                'status.required' => 'Trạng thái không được để trống!',
                'status.in' => 'Trạng thái phải là 1 hoặc 0'
            ]);

            $sale = Sale::find($id);
            if (!$sale) {
                return createError(404, "không tìm thấy sự kiện giảm giá!");
            }
            if ($request->name) {
                $sale->name = $request->name;
            }
            if ($request->startTime&& $request->endTime) {
                if ($request->products) {
                    foreach ($request->products as $product) {
                        $checkSale = ProductSale::
                            where('productID', $product['productID'])
                           ->join('product', 'product.id', '=', 'product_sale.productID')
                            ->join('sale', 'sale.id', '=', 'product_sale.saleID')
                            ->where('sale.startTime', '<=', $request->startTime)
                            ->where('sale.endTime', '>=',  $request->endTime)
                                 ->where('saleID','!=', $sale->id)
                            ->select([
                                "product.id",
                                "product.name",
                                "product.code",
                                "sale.id",
                                "sale.name",
                            ])
                            ->first();

                        if ($checkSale) {
                           return createError(409,"Sản phẩm ". $checkSale->code. " trùng thời gian với sale ".$checkSale->name);
                        }
                    }
                }
                $sale->startTime = $request->startTime;
                $sale->endTime =$request->endTime;
            }


            if (isset($request->status)) {
                $sale->status = $request->status;
            }
            $sale->save();
            $productList = [];
            $productListID = [];
            if ($request->products) {
                foreach ($request->products as $product) {
                    $checkProduct = ProductSale::where('saleID', $sale->id)->where('productID', $product['productID'])->first();
                    if ($checkProduct) {
                        $checkProduct->update([
                            "discount" => $product['discount'],
                            "number"=>$product['number']
                        ]);
                        $productList[] = $checkProduct;
                        $productListID[] = $checkProduct->id;
                    } else {
                        $newProduct = ProductSale::create([
                            "saleID" => $sale->id,
                            "productID" => $product['productID'],
                            "discount" => $product['discount'],
                            "number" => $product['number'],
                        ]);
                        $productList[] = $newProduct;
                        $productListID[] = $newProduct->id;
                    }
                }
                if (!empty($productListID)) {
                    ProductSale::whereNotIn('id', $productListID)
                        ->where('saleID', $sale->id)
                        ->delete();
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật thành công!',
                'data' => [
                    "sale" => $sale,
                    "products" => $productList
                ],
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function delete($id)
    {
        try {
            if (!$id) {
                return createError(400, 'ID Không được trống!');
            }

            $sale = Sale::find($id);
            if (!$sale) {
                return createError(404, 'Không tìm thấy chương trình giảm giá!');
            }

            $sale->delete();
            $productList = ProductSale::where('saleID', $id)->get();
            $productList->each->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Xóa thành công!',
                'data' => $sale,
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
}
