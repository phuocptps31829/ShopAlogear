<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
Route::get('/hello', function () {
    $start = microtime(true);
    $result = 'hello';
    $end = microtime(true);
    return $result . ' - Time: ' . ($end - $start) . 's';
});
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::get('/v1/auth/otp', function (Request $request) {
    return view('mail.send_otp');
});
Route::get('/clear-cache', function () {
    \Illuminate\Support\Facades\Cache::flush(); // Xóa toàn bộ cache
    return response()->json([
        'status' => 'success',
        'message' => 'Cache đã được xóa thành công!'
    ]);
});
Route::get('/test-request', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Cache đã được xóa thành công!1'
    ]);

});
Route::get('/check-redis', function () {
    try {
        // Lưu một giá trị vào cache Redis
        \Illuminate\Support\Facades\Cache::put('test_key', 'Redis is working!', now()->addMinutes(5));

        // Lấy lại giá trị từ cache
        $value = \Illuminate\Support\Facades\Cache::get('test_key');

        return response()->json([
            'status' => 'success',
            'message' => 'Connected to Redis!',
            'value' => $value
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to connect to Redis!',
            'error' => $e->getMessage()
        ], 500);
    }
});

// API CẦN ĐĂNG NHẬP
Route::group(['middleware' => 'jwtAuth'], function () {
    // API ADMIN
    Route::group(['middleware' => ['permission:admin,manage,view']], function () {
    Route::get('/v1/auth/check-admin', function (Request $request) {
        return response()->json(['message' => 'Đây là admin']);
    });
        Route::get('/v1/admin/dashboard/getChartQuarterly', [\App\Http\Controllers\DashboardController::class, 'getChartQuarterly']);
        Route::get('/v1/admin/dashboard/getChartDayToDay', [\App\Http\Controllers\DashboardController::class, 'getChartDayToDay']);
        Route::get('/v1/admin/dashboard/getAll', [\App\Http\Controllers\DashboardController::class, 'getAll']);
        Route::get('/v1/admin/dashboard/getView', [\App\Http\Controllers\DashboardController::class, 'getView']);
        Route::get('/v1/admin/dashboard/getNewOrder', [\App\Http\Controllers\DashboardController::class, 'getNewOrder']);
        Route::get('/v1/admin/dashboard/getNewProduct', [\App\Http\Controllers\DashboardController::class, 'getNewProduct']);
        Route::get('/v1/admin/dashboard/getChartYear', [\App\Http\Controllers\DashboardController::class, 'getChartYear']);
//        Lấy danh sách giảm giá
        Route::get('/v1/admin/sales/getAll', [\App\Http\Controllers\SaleController::class, 'getList']);
        // Chi tiết giảm giá
        Route::get('/v1/admin/sales/getOne/{id}', [\App\Http\Controllers\SaleController::class, 'getOne']);

//        Thông tin hợp tác
        Route::get('/v1/admin/cooperates/getAll', [\App\Http\Controllers\CooperateController::class, 'getList']);
        Route::get('/v1/admin/cooperates/getOne/{id}', [\App\Http\Controllers\CooperateController::class, 'getOne']);
//     Thông tin sản phẩm
        Route::get('/v1/admin/products/getAll', [\App\Http\Controllers\ProductController::class, 'getList']);
        Route::get('/v1/admin/products/getOne/{id}', [\App\Http\Controllers\ProductController::class, 'getOne']);
// Đơn hàng
        Route::get('/v1/admin/orders/getAll', [\App\Http\Controllers\OrderController::class, 'getList']);
//        Thương hiệu
        Route::get('/v1/admin/brands/getAll', [\App\Http\Controllers\BrandController::class, 'getList']);
        Route::get('/v1/admin/brands/getOne/{id}', [\App\Http\Controllers\BrandController::class, 'getOne']);
    });
    Route::group(['middleware' => ['permission:admin,manage']], function () {
        // Danh mục
        Route::get('/v1/admin/categories/getSelect', [\App\Http\Controllers\CategoryController::class, 'getSelect']);
        Route::get('/v1/admin/categories/getAll', [\App\Http\Controllers\CategoryController::class, 'getList']);
//  Cập nhật thông tin giảm giá
        Route::post('/v1/admin/sales/create', [\App\Http\Controllers\SaleController::class, 'create']);
        Route::put('/v1/admin/sales/update/{id}', [\App\Http\Controllers\SaleController::class, 'update']);
        Route::delete('/v1/admin/sales/delete/{id}', [\App\Http\Controllers\SaleController::class, 'delete']);
//        Cập nhật thông tin đơn hàng
        Route::patch('/v1/admin/orders/updateStatus/{id}', [\App\Http\Controllers\OrderController::class, 'updateStatus']);
        Route::patch('/v1/admin/orders/updateShipping/{id}', [\App\Http\Controllers\OrderController::class, 'updateShipping']);
        Route::get('/v1/admin/orders/getOne/{id}', [\App\Http\Controllers\OrderController::class, 'getOne']);
        Route::post('/v1/admin/orders/create', [\App\Http\Controllers\OrderController::class, 'createOrderAdmin']);
        Route::delete('/v1/admin/orders/delete/{id}', [\App\Http\Controllers\OrderController::class, 'delete']);
//        Thông tin sản phẩm
        Route::post('/v1/admin/products/create', [\App\Http\Controllers\ProductController::class, 'create']);
        Route::put('/v1/admin/products/update/{id}', [\App\Http\Controllers\ProductController::class, 'update']);
        Route::delete('/v1/admin/products/delete/{id}', [\App\Http\Controllers\ProductController::class, 'delete']);
        Route::patch('/v1/admin/products/updateQuantity/{id}', [\App\Http\Controllers\ProductController::class, 'updateQuantity']);

// Thông tin hợp tác
        Route::post('/v1/admin/cooperates/create', [\App\Http\Controllers\CooperateController::class, 'create']);
        Route::put('/v1/admin/cooperates/update/{id}', [\App\Http\Controllers\CooperateController::class, 'update']);
        Route::delete('/v1/admin/cooperates/delete/{id}', [\App\Http\Controllers\CooperateController::class, 'delete']);
//        Thông tin thương hiệu

        Route::post('/v1/admin/brands/create', [\App\Http\Controllers\BrandController::class, 'create']);
        Route::put('/v1/admin/brands/update/{id}', [\App\Http\Controllers\BrandController::class, 'update']);
        Route::delete('/v1/admin/brands/delete/{id}', [\App\Http\Controllers\BrandController::class, 'delete']);
    });

    Route::group(['middleware' => ['permission:admin,view']], function () {
// Thông tin banner
        Route::get('/v1/admin/banners/getAll', [\App\Http\Controllers\BannerController::class, 'getList']);
        Route::get('/v1/admin/banners/getOne/{id}', [\App\Http\Controllers\BannerController::class, 'getOne']);
    });

    Route::group(['middleware' => ['permission:admin']], function () {
// Cập nhật thông tin banner
        Route::post('/v1/admin/banners/create', [\App\Http\Controllers\BannerController::class, 'create']);
        Route::put('/v1/admin/banners/update/{id}', [\App\Http\Controllers\BannerController::class, 'update']);
        Route::delete('/v1/admin/banners/delete/{id}', [\App\Http\Controllers\BannerController::class, 'delete']);
//        THông tin người dùng
        Route::get('/v1/admin/users/getAll', [\App\Http\Controllers\UserController::class, 'getList']);
        Route::get('/v1/admin/users/getOne/{id}', [\App\Http\Controllers\UserController::class, 'getOne']);
        Route::post('/v1/admin/users/create', [\App\Http\Controllers\UserController::class, 'create']);
        Route::put('/v1/admin/users/update/{id}', [\App\Http\Controllers\UserController::class, 'update']);
        Route::delete('/v1/admin/users/delete/{id}', [\App\Http\Controllers\UserController::class, 'delete']);
//        Danh mục
        Route::get('/v1/admin/categories/getOne/{id}', [\App\Http\Controllers\CategoryController::class, 'getOne']);
        Route::post('/v1/admin/categories/create', [\App\Http\Controllers\CategoryController::class, 'create']);
        Route::put('/v1/admin/categories/update/{id}', [\App\Http\Controllers\CategoryController::class, 'update']);
        Route::delete('/v1/admin/categories/delete/{id}', [\App\Http\Controllers\CategoryController::class, 'delete']);
//        Set Role
        Route::patch('/v1/admin/auth/setRole/{id}', [\App\Http\Controllers\AuthController::class, 'setRole']);
    });

    // API CLIENT
    Route::group(['middleware' => ['permission:client,admin,view,manage']], function () {
        Route::post('/v1/auth/check-client', function (Request $request) {
            return response()->json(['message' => 'Đây là user']);
        });
        Route::get('/v1/auth/users/profile', [\App\Http\Controllers\AuthController::class, 'getProfile']);
        Route::patch('/v1/auth/users/update', [\App\Http\Controllers\AuthController::class, 'updateUser']);
        Route::patch('/v1/orders/cancel/{id}', [\App\Http\Controllers\OrderController::class, 'cancel']);

    });
});

// Đơn hàng
Route::post('/v1/orders/create', [\App\Http\Controllers\OrderController::class, 'createOrder']);
Route::patch('/v1/orders/update', [\App\Http\Controllers\OrderController::class, 'updateOrder']);

// Danh mục cần đăng nhập admin
Route::get('/v1/categories/getAllCategory', [\App\Http\Controllers\CategoryController::class, 'getAll']);

// Đăng nhập google
//Route::middleware(['web'])->group(function () {
Route::post('/v1/auth/google', [\App\Http\Controllers\AuthController::class, 'loginGoogle']);
Route::post('/v1/auth/google/callback', [\App\Http\Controllers\AuthController::class, 'googleCallback']);
//});
Route::post('/v1/auth/login', [\App\Http\Controllers\AuthController::class, 'login']);
Route::post('/v1/auth/register', [\App\Http\Controllers\AuthController::class, 'register']);
Route::post('/v1/auth/logout', [\App\Http\Controllers\AuthController::class, 'logout'])->middleware('VerifyRefreshToken');
Route::get('/v1/auth/redirect/register/{token}', [\App\Http\Controllers\AuthController::class, 'redirectRegister']);
Route::post('/v1/auth/forgot-password/send-otp', [\App\Http\Controllers\AuthController::class, 'sendOTPForgotPassword']);
Route::post('/v1/auth/forgot-password/check-otp', [\App\Http\Controllers\AuthController::class, 'checkOTPForgotPassword'])->middleware('VerifyOTP');
Route::put('/v1/auth/forgot-password/reset-password', [\App\Http\Controllers\AuthController::class, 'forgotPassword'])->middleware('VerifyOTP');
Route::post('/v1/auth/refresh-token', [\App\Http\Controllers\AuthController::class, 'refreshToken'])->middleware('VerifyRefreshToken');
// API DANH MỤC
Route::get('/v1/categories/getAll', [\App\Http\Controllers\CategoryController::class, 'getAllCategory']);
// API BANNER
Route::get('/v1/banners/getAllBanner', [\App\Http\Controllers\BannerController::class, 'getAllBanner']);
// API FLASH SALE
Route::get('/v1/sales/getFlashSale', [\App\Http\Controllers\ProductController::class, 'getFlashSale']);
// API LẤY DANH SÁCH SẢN PHẨM THEO DANH MỤC
Route::get('/v1/products/getAllProduct', [\App\Http\Controllers\ProductController::class, 'getAllProduct']);
// API LẤY DANH SÁCH SẢN PHẨM TRONG GIỎ HÀNG
Route::post('/v1/products/getProductByCart', [\App\Http\Controllers\ProductController::class, 'getProductByCart']);
// API LẤY CHI TIẾT SẢN PHẨM BẰNG SLUG
Route::get('/v1/products/getOneProduct/{slug}', [\App\Http\Controllers\ProductController::class, 'getOneProduct']);
// API CẬP NHẬT VIEW CHO SẢN PHẨM
Route::patch('/v1/products/updateView/{slug}', [\App\Http\Controllers\ProductController::class, 'updateView']);
// API DỰ ÁN
Route::get('/v1/cooperates/getCooperate', [\App\Http\Controllers\CooperateController::class, 'getCooperate']);
// API UP LOAD ẢNH
Route::post('/v1/images/uploadImages', [\App\Http\Controllers\ImageController::class, 'uploadImages']);
// API CHECK COUPON
Route::get('/v1/products/checkCoupon', [\App\Http\Controllers\ProductController::class, 'checkCoupon']);
// Danh sách thương hiệu
Route::get('/v1/brands/getAll', [\App\Http\Controllers\BrandController::class, 'getAll']);
// API CẬP NHẬT VIEW CHO DỰ ÁN HỢP TÁC
Route::patch('/v1/cooperates/updateView/{id}', [\App\Http\Controllers\CooperateController::class, 'updateView']);
// SEO META
Route::get('/v1/meta', [\App\Http\Controllers\MetaController::class, 'getMeta']);

// Kiểm tra tên chatbot truy cập
Route::get('/check-bot', function (Request $request) {
    $userAgent = $request->header('User-Agent');

    $userAgent = $request->header('User-Agent');
    $url = $request->fullUrl();

    // Log lại tất cả bot truy cập
    Log::info('Bot truy cập', [
        'user_agent' => $userAgent,
        'url' => $url
    ]);
    // Ghi log User-Agent để kiểm tra bot Zalo
    \Log::info('User-Agent từ request:', ['user_agent' => $userAgent]);

    return response()->json(['user_agent' => $userAgent]);
});
