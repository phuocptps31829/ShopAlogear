<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Color;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{

    public function delete($id)
    {
        try {
            if (!$id) {
                return createError(400, 'ID Không được trống!');
            }

            $order = Order::find($id);
            if (!$order) {
                return createError(404, 'Không tìm thấy đơn hàng!');
            }
            $order->delete();
            $productOrder=ProductOrder::where("orderID",$id)->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Xóa thành công!',
                'data' => $order,
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
    public function createOrderAdmin(Request $request)
    {
        try {
            if ($request->id) {
                $request->validate([
                    'fullName' => 'required|string',
                    'phone' => 'required|string',
                    'email' => 'nullable|string|email',
                    'address' => 'required|string',
                    'products' => 'required|array',
                    'type' => 'required|integer',
                    'products.*.productID' => 'required|integer|exists:product,id',
                    'products.*.quantity' => 'required|integer|min:1',
                    'products.*.colorID' => 'nullable|integer|exists:color,id',
                    'time' => 'nullable|string',
                    'status' => 'required|integer',
                ], [
                    'fullName.required' => 'Tên không được để trống!',
                    'phone.required' => 'Số điện thoại không được để trống!',
                    'email.required' => 'Email không được để trống!',
                    'email.email' => 'Email không hợp lệ!',
                    'address.required' => 'Địa chỉ không được để trống!',
                    'type.required' => 'Phương thức thanh toán không được để trống!',
                    'type.integer' => 'Phương thức thanh toán phải là số!',

                    'products.required' => 'Danh sách sản phẩm không được để trống!',
                    'products.array' => 'Danh sách sản phẩm phải là mảng!',

                    'products.*.productID.exists' => 'Sản phẩm không tồn tại trong hệ thống!',
                    'products.*.colorID.exists' => 'Màu sản phẩm không tồn tại trong hệ thống!',
                    'products.*.productID.required' => 'Mã sản phẩm không được để trống!',
                    'products.*.productID.integer' => 'Mã sản phẩm phải là số nguyên!',
                    'products.*.quantity.integer' => 'Số lượng phải là số nguyên!',
                    'products.*.quantity.min' => 'Số lượng phải lớn hơn 0!',

                    'time'=> "thời gian phải là chuỗi!",
                    'status.required'=> "Trạng thái đơn hàng không được bỏ trống!",
                    'status.string'=> "Trạng thái phải là chuỗi!"
                ]);

                $order = Order::find($request->id);
//                if($order->success == 1||$order->status !=1 ){
//                    createError(409,"Đơn hàng đang được sử lý không thể cập nhật thông tin");
//                }

                $order->update([
                    "fullName" => $request->fullName,
                    "phone" => $request->phone,
                    "email" => $request->email,
                    "address" => $request->address,
                    "type" => $request->type,
                    "status" => $request->status,
                    "success" => 1,
                    "time"=>$request->time??now()
                ]);
                $productOrder = [];
                $totalPrice = 0;
                $products = $request->products;
                $productIDList = [];
                foreach ($products as $product) {
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

                    $item = Product::select([
                        'product.id',
                        'product.price',
                        'product.type',
                        'product_sale.number',
                        DB::raw('COALESCE(product_sale.discount, product.discount,product.price) as discount')
                    ])
                        ->where('product.status', 1)
                        ->where('product.id', $product["productID"])
                        ->leftJoinSub($sale, 'product_sale', function ($join) {
                            $join->on('product.id', '=', 'product_sale.productID');
                        });
                    $itemProduct = $item->first();
                    if ($itemProduct) {
                        $checkProduct = ProductOrder::where('productID', $itemProduct->id)
                            ->where('orderID', $order->id)->first();
                        if ($checkProduct) {
                            $checkProduct->quantity =$product["quantity"];
                            $checkProduct->price = $itemProduct->discount;
                            $checkProduct->colorID=$product["colorID"];
                            $checkProduct->save();
                            $productOrder[] = $checkProduct;
                            $totalPrice+= $itemProduct->discount;
                            $productIDList[]  = $checkProduct->productID*$product["quantity"];
                        } else {
                            $itemOrder = ProductOrder::create([
                                "productID" => $product["productID"],
                                "orderID" => $order->id,
                                "quantity" => $product["quantity"],
                                "price" => $itemProduct->discount,
                                "colorID"=>$product["colorID"],
                            ]);

                            $productIDList[] = $itemOrder->productID;
                            $productOrder[] = $itemOrder;
                            $totalPrice += $itemProduct->discount*$product["quantity"];
                        }
                    } else {
                        createError(404, "Không tìm thấy sản phẩm có id =>" . $product["productID"]);
                    }
                }
//                Xóa sản phẩm ngoài danh sách mới được cập nhật
                if (!empty($productIDList)) {
                    ProductOrder::whereNotIn('productID', $productIDList)
                        ->where('orderID', $order->id)
                        ->delete();
                }
            }else{

                $request->validate([
                    'fullName' => 'nullable|string',
                    'phone' => 'nullable|string',
                    'email' => 'nullable|string|email',
                    'address' => 'nullable|string',
                    'products' => 'required|array',
                    'products.*.productID' => 'required|integer|exists:product,id',
                    'products.*.quantity' => 'required|integer|min:1',
                    'products.*.colorID' => 'nullable|integer|exists:color,id',
                    'time' => 'nullable|string',
                    'status' => 'required|integer',
                    'type' => 'required|integer',
                ], [
                    'fullName.required' => 'Tên không được để trống!',
                    'phone.required' => 'Số điện thoại không được để trống!',
                    'email.required' => 'Email không được để trống!',
                    'email.email' => 'Email không hợp lệ!',
                    'address.required' => 'Địa chỉ không được để trống!',

                    'products.required' => 'Danh sách sản phẩm không được để trống!',
                    'products.array' => 'Danh sách sản phẩm phải là mảng!',

                    'products.*.productID.exists' => 'Sản phẩm không tồn tại trong hệ thống!',
                    'products.*.colorID.exists' => 'Màu sản phẩm không tồn tại trong hệ thống!',
                    'products.*.productID.required' => 'Mã sản phẩm không được để trống!',
                    'products.*.productID.integer' => 'Mã sản phẩm phải là số nguyên!',
                    'products.*.quantity.integer' => 'Số lượng phải là số nguyên!',
                    'products.*.quantity.min' => 'Số lượng phải lớn hơn 0!',

                    'time'=> "thời gian phải là chuỗi!",
                    'status.required'=> "Trạng thái đơn hàng không được bỏ trống!",
                    'status.string'=> "Trạng thái phải là chuỗi!",
                    'type.integer' => 'Phương thức thanh toán phải là số!',
                ]);

                $order = Order::create([
                    "fullName" => $request->fullName,
                    "phone" => $request->phone,
                    "email" => $request->email,
                    "address" => $request->address,
                    "type" => $request->type,
                    "status" => $request->time,
                    "success" => 1,
                    "code" => generateInvoiceCode(),
                    "time"=>$request->time??now()
                ]);
                $productOrder = [];
                $totalPrice = 0;
                $products = $request->products;
                foreach ($products as $product) {
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
                    $item = Product::select([
                        'product.id',
                        'product.price',
                        'product.type',
                        'product_sale.number',
                        DB::raw('COALESCE(product_sale.discount, product.discount,product.price) as discount')
                    ])
                        ->where('product.status', 1)
                        ->where('product.id', $product["productID"])
                        ->leftJoinSub($sale, 'product_sale', function ($join) {
                            $join->on('product.id', '=', 'product_sale.productID');
                        });
                    $itemProduct = $item->first();
                    if ($itemProduct) {

                        $itemOrder = ProductOrder::create([
                            "productID" => $product["productID"],
                            "orderID" => $order->id,
                            "quantity" => $product["quantity"],
                            "price" => $itemProduct->discount,
                            "colorID"=>$product["colorID"],
                        ]);

                        $productOrder[] = $itemOrder;
                        $totalPrice += $itemProduct->discount*$product["quantity"];

                    } else {

                        createError(404, "Không tìm thấy sản phẩm có id =>" . $product["productID"]);
                    }

                }

            }

            return response()->json([
                'status' => 'success',
                'message' => 'Tạo thành công!',
                'data' => [
                    'order' => $order,
                    'productOrder' => $productOrder,
                    'totalPrice' => $totalPrice,
                ],
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
    public function getOne(Request $request)
    {
        try {
            $id = $request->id;
            $order = Order::select([
                "id",
                "fullName",
                "email",
                "phone",
                "address",
                "code",
                "status",
                'shippingCode',
                'link',
                'unit',
                "type",
//                "time",
                "success"
            ])
                ->selectRaw("DATE_FORMAT(time, '%H:%i:%s %d-%m-%Y') as time")
                ->with(['productOrder' => function ($query) {
                $query->select(['product_order.id', 'product_order.productID', 'product_order.orderID', 'product_order.quantity', 'product_order.price', 'c.id as colorID', 'c.name as colorName', 'c.code as colorCode'])
                    ->leftJoin('color as c', 'product_order.colorID', '=', 'c.id')
                    ->with(['product' => function ($q) {
                        $q->select(['product.id', 'product.name'])
                            ->leftJoin('image as i', function ($join) {
                                $join->on('product.id', '=', 'i.productID')
                                    ->whereRaw('i.id = (SELECT id FROM image WHERE image.productID = product.id AND image.status = 1 ORDER BY number ASC LIMIT 1)');
                            })
                            ->addSelect('i.image as image');
                    }]);
            }])->addSelect([
                \DB::raw("(SELECT SUM(product_order.price * product_order.quantity) FROM product_order WHERE product_order.orderID = order.id) as totalPrice")
            ])
                ->where('id', $id)->first();

            if (!$order) {
                createError(404, "Không tìm thấy đơn hàng!");
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => $order
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
            $page = $request->page;
            $all = $request->all;
            $sort = $request->sort;
            $search = $request->search;
            $success = $request->success??1;

            $order = Order::select([
                "id",
                "fullName",
                "email",
                "phone",
                "address",
                "code",
                'shippingCode',
                'link',
                'unit',
                "status",
                "type",
//                "DATE_FORMAT(time, '%H:%i:%s %d-%m-%Y') as time",
                "success"
            ]);
            $order->selectRaw("DATE_FORMAT(time, '%H:%i:%s %d-%m-%Y') as time");
            $order->with(['productOrder' => function ($query) {
                $query->select(['product_order.id', 'product_order.productID', 'product_order.orderID', 'product_order.quantity', 'product_order.price', 'c.id as colorID', 'c.name as colorName', 'c.code as colorCode'])
                    ->leftJoin('color as c', 'product_order.colorID', '=', 'c.id')
                    ->with(['product' => function ($q) {
                        $q->select(['product.id', 'product.name'])
                            ->leftJoin('image as i', function ($join) {
                                $join->on('product.id', '=', 'i.productID')
                                    ->whereRaw('i.id = (SELECT id FROM image WHERE image.productID = product.id AND image.status = 1 ORDER BY number ASC LIMIT 1)');
                            })
                            ->addSelect('i.image as image');
                    }]);
            }])->addSelect([
                \DB::raw("(SELECT SUM(product_order.price * product_order.quantity) FROM product_order WHERE product_order.orderID = order.id) as totalPrice")
            ]);

            if ($search) {
                $order = $order->where(function ($query) use ($search) {
                    $query->where("fullName", "like", "%$search%");
                    $query->orWhere("email", "like", "%$search%");
                    $query->orWhere("phone", "like", "%$search%");
                    $query->orWhere("code", "like", "%$search%");

                });
            }
            if($success==1){
                $order = $order->where('success', 1);
            }elseif ($success==0) {
                $order = $order->where('success', 0);
            }


            $allRecords = clone $order;
            $totalRecords = $allRecords->count();
            if ($sort == 1) {
                $order->orderBy('fullName', "ASC");
            } elseif ($sort == 2) {
                $order->orderBy('fullName', "DESC");
            } elseif ($sort == 3) {
                $order->orderBy('email', "ASC");
            } elseif ($sort == 4) {
                $order->orderBy('email', "DESC");
            } elseif ($sort == 5) {
                $order->orderBy('id', "ASC");
            } else {
                $order->orderBy('id', "DESC");
            }

            if ($skip && $limit) {
                $order->skip((int)$skip);
            }
            if ($limit && !$all) {
                if ($page) {
                    $skip = ((int)$page - 1) * $limit;
                    $order->skip((int)$skip);
                }
                $order->take((int)$limit);
            }
            $order = $order->get();
            $response = [
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => [
                    "totalRecords" => $totalRecords,
                    "orders" => $order ? $order : null,
                    "page" => $order ? ceil($totalRecords / $limit) : null,
                ]
            ];

            return response()->json($response, 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
    public function updateShipping(Request $request)
    {
        try {
            $id = $request->route('id');
            $order = Order::find($id);
            if ($order) {
                $order->link = $request->link;
                $order->shippingCode = $request->shippingCode;
                $order->unit = $request->unit;
                $order->status = 2;
                $order->save();
            } else {
                createError(404, "Không tìm thấy đơn hàng cần cập nhật!");
            }
            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật thành công!',
                'data' => $order,
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
    public function updateStatus(Request $request)
    {
        try {
            $id = $request->route('id');
            $order = Order::find($id);
            if ($order) {
                $order->status = $request->status;
                $order->save();

                if($order->status==3){
                    $products=Product::join('product_order','product_order.productID','=','product.id')
                        ->where('product_order.orderID',$id)
                        ->select([
                            'product.id',
                            'product.name',
                            'product.price',
                            'product.quantity',
                            'product_order.price as orderPrice',
                            'product_order.quantity as orderQuantity',
                        ])
                        ->get();
                    if($products){
                        foreach ($products as $product) {
                            $product->quantity=$product->quantity-$product->orderQuantity;
                            if($product->quantity<=0){
                                $product->quantity=0;
                            }
                            $product->save();
                        }
                    }
                }

            } else {
                createError(404, "Không tìm thấy đơn hàng cần cập nhật!");
            }
            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật thành công!',
                'data' => $order,
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
    public function cancel(Request $request)
    {
        try {
            $id = $request->route('id');
            $order = Order::find($id);
            if ($order && $order->status == 1) {
                $order->status = 0;
                $order->save();
            }
            elseif ($order && $order->status!=1)
            {
                return createError(403,"Đơn hàng đã được sử lý không thể cập nhật!");
            }
            else {
                createError(404, "Không tìm thấy đơn hàng cần cập nhật!");
            }
            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật thành công!',
                'data' => $order,
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
    public function updateOrder(Request $request)
    {
        try {
            $id = $request->id;
            $type = $request->type;
            $order = Order::find($id);

            if ($order->success == 0 && $order->status == 1) {
                $order->type = $type;
                $order->success = 1;
                $order->save();
            } else {
                createError(404, "Không tìm thấy đơn hàng cần cập nhật!");
            }
            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật thành công!',
                'data' => $order,
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function createOrder(Request $request)
    {
        try {
            if ($request->id) {
                $request->validate([
                    'fullName' => 'required|string',
                    'phone' => 'required|string',
                    'email' => 'nullable|string|email',
                    'address' => 'required|string',
                    'products' => 'required|array',
                    'type' => 'required|integer',
                    'products.*.productID' => 'required|integer|exists:product,id',
                    'products.*.quantity' => 'required|integer|min:1',
                    'products.*.colorID' => 'nullable|integer|exists:color,id',

                ], [
                    'fullName.required' => 'Tên không được để trống!',
                    'phone.required' => 'Số điện thoại không được để trống!',
                    'email.required' => 'Email không được để trống!',
                    'email.email' => 'Email không hợp lệ!',
                    'address.required' => 'Địa chỉ không được để trống!',
                    'type.required' => 'Phương thức thanh toán không được để trống!',
                    'type.integer' => 'Phương thức thanh toán phải là số!',

                    'products.required' => 'Danh sách sản phẩm không được để trống!',
                    'products.array' => 'Danh sách sản phẩm phải là mảng!',

                    'products.*.productID.exists' => 'Sản phẩm không tồn tại trong hệ thống!',
                    'products.*.colorID.exists' => 'Màu sản phẩm không tồn tại trong hệ thống!',
                    'products.*.productID.required' => 'Mã sản phẩm không được để trống!',
                    'products.*.productID.integer' => 'Mã sản phẩm phải là số nguyên!',
                    'products.*.quantity.integer' => 'Số lượng phải là số nguyên!',
                    'products.*.quantity.min' => 'Số lượng phải lớn hơn 0!'
                ]);

                $order = Order::find($request->id);
                if($order->success == 1||$order->status !=1 ){
                    createError(409,"Đơn hàng đang được sử lý không thể cập nhật thông tin");
                }

                $order->update([
                    "fullName" => $request->fullName,
                    "phone" => $request->phone,
                    "email" => $request->email,
                    "address" => $request->address,
                    "type" => $request->type,
                    "status" => 1,
                    "success" => 1,
                    "time"=>now(),
                    "userID"=>$request->userID??null
                ]);
                $productOrder = [];
                $totalPrice = 0;
                $products = $request->products;
                $productIDList = [];
                foreach ($products as $product) {
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

                    $item = Product::select([
                        'product.id',
                        'product.price',
                        'product.type',
                        'product_sale.number',
                        DB::raw('COALESCE(product_sale.discount, product.discount,product.price) as discount')
                    ])
                        ->where('product.status', 1)
                        ->where('product.id', $product["productID"])
                        ->leftJoinSub($sale, 'product_sale', function ($join) {
                            $join->on('product.id', '=', 'product_sale.productID');
                        });
                    $itemProduct = $item->first();
                    if ($itemProduct) {
                        $checkProduct = ProductOrder::where('productID', $itemProduct->id)
                            ->where('orderID', $order->id)->first();
                        if ($checkProduct) {
                            $checkProduct->quantity =$product["quantity"];
                            $checkProduct->price = $itemProduct->discount;
                            $checkProduct->colorID=array_key_exists("colorID", $product) ? $product["colorID"] : null;
                            $checkProduct->save();
                            $productOrder[] = $checkProduct;
                            $totalPrice+= $itemProduct->discount;
                            $productIDList[]  = $checkProduct->productID;
                        } else {
                            $itemOrder = ProductOrder::create([
                                "productID" => $product["productID"],
                                "orderID" => $order->id,
                                "quantity" => $product["quantity"],
                                "price" => $itemProduct->discount,
                                "colorID"=>array_key_exists("colorID", $product) ? $product["colorID"] : null,
                            ]);

                            $productIDList[] = $itemOrder->productID;
                            $productOrder[] = $itemOrder;
                            $totalPrice += $itemProduct->discount*$product["quantity"];
                        }
                    } else {
                        createError(404, "Không tìm thấy sản phẩm có id =>" . $product["productID"]);
                    }
                }
//                Xóa sản phẩm ngoài danh sách mới được cập nhật
                if (!empty($productIDList)) {
                    ProductOrder::whereNotIn('productID', $productIDList)
                        ->where('orderID', $order->id)
                        ->delete();
                }
            }else{

            $request->validate([
                'fullName' => 'nullable|string',
                'phone' => 'nullable|string',
                'email' => 'nullable|string|email',
                'address' => 'nullable|string',
                'products' => 'required|array',
                'products.*.productID' => 'required|integer|exists:product,id',
                'products.*.quantity' => 'required|integer|min:1',
                'products.*.colorID' => 'nullable|integer|exists:color,id',
            ], [
                'fullName.required' => 'Tên không được để trống!',
                'phone.required' => 'Số điện thoại không được để trống!',
                'email.required' => 'Email không được để trống!',
                'email.email' => 'Email không hợp lệ!',
                'address.required' => 'Địa chỉ không được để trống!',

                'products.required' => 'Danh sách sản phẩm không được để trống!',
                'products.array' => 'Danh sách sản phẩm phải là mảng!',

                'products.*.productID.exists' => 'Sản phẩm không tồn tại trong hệ thống!',
                'products.*.colorID.exists' => 'Màu sản phẩm không tồn tại trong hệ thống!',
                'products.*.productID.required' => 'Mã sản phẩm không được để trống!',
                'products.*.productID.integer' => 'Mã sản phẩm phải là số nguyên!',
                'products.*.quantity.integer' => 'Số lượng phải là số nguyên!',
                'products.*.quantity.min' => 'Số lượng phải lớn hơn 0!'
            ]);

            $order = Order::create([
                "fullName" => $request->fullName,
                "phone" => $request->phone,
                "email" => $request->email,
                "address" => $request->address,
                "type" => null,
                "status" => 1,
                "success" => 0,
                "code" => generateInvoiceCode(),
                "time"=>now(),
                "userID"=>$request->userID??null
            ]);
            $productOrder = [];
            $totalPrice = 0;
            $products = $request->products;
            foreach ($products as $product) {
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
                $item = Product::select([
                    'product.id',
                    'product.price',
                    'product.type',
                    'product_sale.number',
                    DB::raw('COALESCE(product_sale.discount, product.discount,product.price) as discount')
                ])
                    ->where('product.status', 1)
                    ->where('product.id', $product["productID"])
                    ->leftJoinSub($sale, 'product_sale', function ($join) {
                        $join->on('product.id', '=', 'product_sale.productID');
                    });
                $itemProduct = $item->first();
                if ($itemProduct) {

                    $itemOrder = ProductOrder::create([
                        "productID" => $product["productID"],
                        "orderID" => $order->id,
                        "quantity" => $product["quantity"],
                        "price" => $itemProduct->discount,
                        "colorID"=>array_key_exists("colorID", $product) ? $product["colorID"] : null,
                    ]);

                    $productOrder[] = $itemOrder;
                    $totalPrice += $itemProduct->discount*$product["quantity"];

                } else {

                    createError(404, "Không tìm thấy sản phẩm có id =>" . $product["productID"]);
                }

            }

            }

            return response()->json([
                'status' => 'success',
                'message' => 'Tạo thành công!',
                'data' => [
                    'order' => $order,
                    'productOrder' => $productOrder,
                    'totalPrice' => $totalPrice,
                ],
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
}
