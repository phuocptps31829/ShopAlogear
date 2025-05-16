<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use DateTime;
use DateInterval;
use DatePeriod;
class DashboardController extends Controller
{
    public function getChartQuarterly(Request $request)
    {
        try {
            // Lấy năm từ request, mặc định là năm hiện tại nếu không truyền
            $year = $request->input('year', Carbon::now()->year);

            // Xác định khoảng thời gian của năm
            $startOfYear = Carbon::create($year, 1, 1)->startOfDay()->format('Y-m-d H:i:s');
            $endOfYear = Carbon::create($year, 12, 31)->endOfDay()->format('Y-m-d H:i:s');

            // Truy vấn dữ liệu theo quý
            $ordersByQuarter = Order::selectRaw("
                QUARTER(order.time) as quarter,
                COUNT(order.id) as totalOrders,
                COALESCE(SUM(product_order.price * product_order.quantity), 0) as totalRevenue
            ")
                ->leftJoin('product_order', 'product_order.orderID', '=', 'order.id')
                ->whereBetween('order.time', [$startOfYear, $endOfYear])
                ->where('order.status', 3)
                ->groupByRaw("QUARTER(order.time)")
                ->orderByRaw("QUARTER(order.time)")
                ->get();

            // Tạo danh sách 4 quý
            $quarters = [
                1 => ["quarter" => "Quý 1 năm $year", "totalOrders" => 0, "totalRevenue" => 0],
                2 => ["quarter" => "Quý 2 năm $year", "totalOrders" => 0, "totalRevenue" => 0],
                3 => ["quarter" => "Quý 3 năm $year", "totalOrders" => 0, "totalRevenue" => 0],
                4 => ["quarter" => "Quý 4 năm $year", "totalOrders" => 0, "totalRevenue" => 0]
            ];

            // Cập nhật dữ liệu từ truy vấn vào mảng
            foreach ($ordersByQuarter as $order) {
                $quarterKey = $order->quarter; // Giá trị từ 1 đến 4
                if (isset($quarters[$quarterKey])) {
                    $quarters[$quarterKey] = [
                        "quarter" => "Q$quarterKey ($year)",
                        "totalOrders" => $order->totalOrders,
                        "totalRevenue" => $order->totalRevenue
                    ];
                }
            }

            // Chuyển thành mảng tuần tự
            $chartData = array_values($quarters);

            return response()->json([
                'status' => 'success',
                'message' => 'lấy dữ liệu thành công!',
                'data' =>$chartData,
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
    public function getChartDayToDay(Request $request)
    {
        try {
            // Lấy ngày từ request
            $startDate = Carbon::parse($request->startDay)->startOfDay()->format('Y-m-d H:i:s');
            $endDate = Carbon::parse($request->endDay)->endOfDay()->format('Y-m-d H:i:s');

            // Truy vấn dữ liệu
            $ordersByDay = Order::selectRaw("
                DATE(order.time) as day,
                COUNT(order.id) as totalOrders,
                COALESCE(SUM(product_order.price * product_order.quantity), 0) as totalRevenue
            ")
                ->leftJoin('product_order', 'product_order.orderID', '=', 'order.id')
                ->whereBetween('order.time', [$startDate, $endDate])
                ->where('order.status', 3)
                ->groupByRaw("DATE(order.time)")
                ->orderByRaw("DATE(order.time)")
                ->get();

            // Tạo danh sách ngày
            $startDateObj = new DateTime($startDate);
            $endDateObj = new DateTime($endDate);

            $interval = new DateInterval('P1D'); // Khoảng cách 1 ngày
            $dateRange = new DatePeriod($startDateObj, $interval, $endDateObj); // Không cộng thêm ngày

            // Khởi tạo mảng dữ liệu
            $chartData = [];
            foreach ($dateRange as $date) {
                $day = $date->format('Y-m-d'); // Định dạng YYYY-MM-DD
                $chartData[$day] = ["day" => $day, "totalOrders" => 0, "totalRevenue" => 0];
            }

            // Cập nhật dữ liệu từ truy vấn vào mảng
            foreach ($ordersByDay as $order) {
                $dayKey = $order->day; // Chuỗi YYYY-MM-DD
                if (isset($chartData[$dayKey])) {
                    $chartData[$dayKey] = [
                        "day" => $dayKey,
                        "totalOrders" => $order->totalOrders,
                        "totalRevenue" => $order->totalRevenue
                    ];
                }
            }

            // Chuyển thành mảng tuần tự
            $chartData = array_values($chartData);

            return response()->json([
                'status' => 'success',
                'message' => 'lấy dữ liệu thành công!',
                'data' =>$chartData,
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
    public  function  getChartYear(Request $request){
        try {

            $ordersByMonth = Order::selectRaw("
                                    MONTH(time) as month,
                                    COUNT(id) as totalOrders,
                                    SUM((SELECT SUM(product_order.price * product_order.quantity)
                                        FROM product_order WHERE product_order.orderID = order.id)) as totalRevenue
                                ")
                ->whereYear('time', $request->year)
                ->where('status', 3)
                ->groupByRaw("MONTH(time)")
                ->orderByRaw("MONTH(time)")
                ->get();

            $chartData = [];
            for ($i = 1; $i <= 12; $i++) {
                $chartData[$i] = ["month" => $i, "totalOrders" => 0, "totalRevenue" => 0];
            }

            foreach ($ordersByMonth as $order) {
                $chartData[$order->month] = [
                    "month" => $order->month,
                    "totalOrders" => $order->totalOrders,
                    "totalRevenue" => $order->totalRevenue
                ];
            }
            $dataYear=$chartData;
            $ordersByDay = Order::selectRaw("
                    DAY(time) as day,
                    COUNT(id) as totalOrders,
                    SUM((SELECT SUM(product_order.price * product_order.quantity)
                        FROM product_order WHERE product_order.orderID = order.id)) as totalRevenue
                ")
                ->whereYear('time', $request->year) // Lọc theo năm
                ->whereMonth('time', $request->month) // Lọc theo tháng
                ->where('status', 3)
                ->groupByRaw("DAY(time)")
                ->orderByRaw("DAY(time)")
                ->get();

// Lấy số ngày của tháng được chọn
            $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $request->month, $request->year);

// Tạo một mảng đủ số ngày trong tháng với giá trị mặc định
            $chartData = [];
            for ($i = 1; $i <= $daysInMonth; $i++) {
                $chartData[$i] = ["day" => $i, "totalOrders" => 0, "totalRevenue" => 0];
            }

// Cập nhật dữ liệu thực tế từ truy vấn vào mảng
            foreach ($ordersByDay as $order) {
                $chartData[$order->day] = [
                    "day" => $order->day,
                    "totalOrders" => $order->totalOrders,
                    "totalRevenue" => $order->totalRevenue
                ];
            }
            $chartMonth=$chartData;

            $startOfWeek = Carbon::now()->startOfWeek(); // Thứ 2
            $endOfWeek = Carbon::now()->endOfWeek();     // Chủ Nhật

            $ordersByDay = Order::selectRaw("
                            DAYOFWEEK(time) as weekday,
                            COUNT(id) as totalOrders,
                            SUM((SELECT SUM(product_order.price * product_order.quantity)
                                FROM product_order WHERE product_order.orderID = order.id)) as totalRevenue
                        ")
                ->whereBetween('time', [$startOfWeek, $endOfWeek]) // Lọc theo tuần hiện tại
                ->where('status', 3)
                ->groupByRaw("DAYOFWEEK(time)")
                ->orderByRaw("DAYOFWEEK(time)")
                ->get();

// Danh sách các ngày trong tuần (1 = Chủ Nhật, 2 = Thứ 2, ..., 7 = Thứ 7)
            $weekDays = [
                2 => "Monday", 3 => "Tuesday", 4 => "Wednesday",
                5 => "Thursday", 6 => "Friday", 7 => "Saturday", 1 => "Sunday"
            ];

// Tạo mảng mặc định với giá trị 0 đơn hàng - 0 doanh thu
            $chartData = [];
            foreach ($weekDays as $key => $dayName) {
                $chartData[$key] = ["day" => $dayName, "totalOrders" => 0, "totalRevenue" => 0];
            }

// Cập nhật dữ liệu thực tế vào mảng
            foreach ($ordersByDay as $order) {
                $chartData[$order->weekday] = [
                    "day" => $weekDays[$order->weekday],
                    "totalOrders" => $order->totalOrders,
                    "totalRevenue" => $order->totalRevenue
                ];
            }
            $dataWeek=$chartData;

            return response()->json([
                'status' => 'success',
                'message' => 'lấy dữ liệu thành công!',
                'data' => [
                    "dataYear" => $dataYear,
                    'dataMonth' => $chartMonth,
                    'dataWeek' => $dataWeek
                ],
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
    public function getNewProduct(Request $request)
    {
        try {
            $day = $request->day;
            $day = is_numeric($day) && $day > 0 ? $day : 7;

            $products = Product::select([
                DB::raw("DATE(created_at) as addDate"),
                DB::raw("COUNT(id) as totalProducts")
            ])
                ->whereBetween('created_at', [
                    Carbon::now()->subDays($day - 1)->startOfDay(),
                    Carbon::now()->endOfDay()
                ])
                ->groupBy(DB::raw("DATE(created_at)"))
                ->orderByDesc('addDate')
                ->get();

            $response = [
                'status' => 'success',
                'message' => 'Lấy danh sách sản phẩm đã thêm thành công!',
                'data' => $products
            ];

            return response()->json($response, 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function getAll(Request $request)
    {
        try {

            $totalProducts = Product::where('type', "!=", 3)->count();
            $totalServices = Product::where('type', 3)->orWhere('type', 2)->count();
            $totalUser = User::count();
            $totalOrder = Order::where('success', 1)->count();
            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => [
                    'totalProducts' => $totalProducts,
                    'totalServices' => $totalServices,
                    'totalUser' => $totalUser,
                    'totalOrder' => $totalOrder,
                ]
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function getView(Request $request)
    {
        try {
            $day = $request->day??7;
            $limit = $request->limit??20;

            $products = Product::select([
                'product.id',
                'product.name',
                'product.price',
                'product.slug',
                'product.type',
                'product.status',
                'product.discount',
                'product.code',
                'product.quantity',
                'product.viewCount',
                'i.image',
                DB::raw("SUM(v.count) as totalView")
            ])
                ->leftJoin('image as i', function ($join) {
                    $join->on('product.id', '=', 'i.productID')
                        ->whereRaw('i.id = (SELECT id FROM image WHERE image.productID = product.id AND image.status = 1 ORDER BY number ASC LIMIT 1)');
                })
                ->leftJoin('view_count as v', function ($join) use ($day) {
                    $join->on('product.id', '=', 'v.productID');

                    $day = is_numeric($day) && $day > 0 ? $day : 7;

                    $join->whereBetween('v.created_at', [
                        Carbon::now()->subDays($day - 1)->startOfDay(),
                        Carbon::now()->endOfDay()
                    ]);
                })
                ->groupBy([
                    'product.id',
                    'product.name',
                    'product.price',
                    'product.slug',
                    'product.type',
                    'product.status',
                    'product.discount',
                    'product.code',
                    'product.quantity',
                    'product.viewCount',
                    'i.image',
                ])
                ->orderByDesc('totalView');

            if ($limit) {
                $products->limit($limit);
            }

            $products = $products->get();

            $response = [
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => $products
            ];

            return response()->json($response, 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function getNewOrder(Request $request)
    {
        try {
            $limit = $request->limit;
            $order = Order::
            select([
                "id",
                "code",
                "status",
                "type"
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
                ]);
            $order->where('order.success', 1)
                ->orderByDesc('order.time');
            if ($limit) {
                $order->limit($limit);
            }
            $order = $order->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => $order
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

}
