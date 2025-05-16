<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MetaController extends Controller
{
    public function getMeta(Request $request)
    {

        $request->validate(['url' => 'required|url']);
        $url = $request->query('url');
        $path = explode('/', trim(parse_url($url, PHP_URL_PATH), '/'));
        if (($path[0] === 'products'||$path[0] === 'services') && isset($path[1])) {
            // Lấy User-Agent & URL được truy cập
            $userAgent = $request->header('User-Agent');
            $url = $request->fullUrl();

            // Log thông tin
            \Log::info('Bot truy cập', [
                'user_agent' => $userAgent,
                'url' => $url
            ]);
            $product = Product::select([
                'product.id',
                'product.name',
                'product.slug',
                'product.description',
                 'i.image',
            ])->leftJoin('image as i', function ($join) {
                $join->on('product.id', '=', 'i.productID')
                    ->whereRaw('i.id = (SELECT id FROM image WHERE image.productID = product.id AND image.status = 1 ORDER BY number ASC LIMIT 1)');
            })
                ->where('product.slug', $path[1])
                ->first();
            if ($product) {
//                return response()->view('meta.meta', compact('product', 'url'))
//                    ->header('Content-Type', 'text/html');

                return response()->json([
                    'status' => 'success',
                    'message' => 'thành công!',
                    'data' => $product,
                ], 200);
            }
        }
        return response()->json(['error' => 'Không tìm thấy sản phẩm'], 404);
    }
}
