<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class BannerController extends Controller
{
    public function getOne(Request $request)
    {
        try {
            $id = $request->id;
            $category = Banner::find($id);
            if (!$category) {
               return createError(404, "Không tìm thấy banner!");
            }

            $list = Banner::where('type', '=', $category->type)
                ->orderBy('number', 'ASC')
                ->pluck('number');

            $category->listNumber= $list;

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => $category
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function getList(Request $request)
    {
        try {

            $type = $request->type;
            $skip = $request->skip;
            $limit = $request->limit ?? 10;
            $page=$request->page ;
            $all=$request->all ;

            $banners = Banner::
            select([
                "id",
                "image",
                "type",
                "number",
                "status",
                'link'
            ])
                ->orderby('type','ASC')
                ->orderBy("number", "ASC");


            if ($type) {
                $banners = $banners->where("type", (int)$type);
            }

            $allRecords = clone $banners;
            $totalRecords = $allRecords->count();

            if ($skip && $limit) {
                $banners->skip((int)$skip);
            }
            if ($limit && !$all) {
                if ($page) {
                    $skip = ((int)$page - 1) * $limit;
                    $banners->skip((int)$skip);
                }
                $banners->take((int)$limit);
            }
            $banners = $banners->get();
            $response=[
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => [
                    "totalRecords" => $totalRecords,
                    "products" => $banners ? $banners : null,
                    "page" => $banners ? ceil($totalRecords / $limit) : null,
                ]

            ];

            return response()->json($response, 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function getAllBanner(Request $request)
    {
        try {
//            $cacheKey = 'banner_' . md5(json_encode($request->all()));
//
//            // ✅ Kiểm tra cache trước khi query database
//            if (Cache::has($cacheKey)) {
//                return response()->json(Cache::get($cacheKey));
//            }

            $limit = $request->limit;
            $skip = $request->skip;
            $type = $request->type;

            $banners = Banner::
            select([
                "id",
                "image",
                "type",
                "number",
                "status",
                "link"
            ])
                ->where("status", 1)
                ->orderby('type','ASC')
                ->orderBy("number", "ASC");

            if ($type) {
                $banners = $banners->where("type", (int)$type);
            }

            $allRecords = clone $banners;
            $totalRecords = $allRecords->count();
            if ($skip) {
                $banners = $banners->skip($skip);
            }
            if ($limit) {
                $banners = $banners->take($limit);
            }
            $banners = $banners->get();
            $response=[
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => [
                    "totalRecords" => $totalRecords,
                    "products" => $banners ? $banners : null,
                ]

            ];

//            Cache::put($cacheKey, $response, 600);

            return response()->json($response, 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function create(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|string',
                'number' => 'nullable|integer',
                'type' => 'required|integer',
                'link' => 'nullable|string',
                'status' => 'required|integer|in:0,1'
            ], [
                'image.required' => 'Hình ảnh không được để trống!',
                'image.string' => 'Hình ảnh phải là ký tự!',
                'type.required' => 'Loại banner không được để trống!',
                'type.integer' => 'Loại banner phải là ký tự!',
                'number.integer' => 'Số thứ tự phải là dạng số',
                'status.required' => 'Trạng thái không được để trống!',
                'status.in' => 'Trạng thái phải là 1 hoặc 0',
                'link.string'=>'Link phải là ký tự!'
            ]);
            if (!$request->number) {
                $category = Banner::where('type', '=', (int)$request->type)
                    ->orderBy('number', 'DESC')
                    ->first();
                if ($category && $category->number > 0) {
                    $number = $category->number + 1;
                    $request->merge(['number' => $number]);
                } else {
                    $request->merge(['number'=> 1]);
                }
            }

            $banners = Banner::create([
                "image" => $request->image,
                "type" => $request->type,
                'status' => $request->status,
                "number" => $request->number,
                "link"=>$request->link
            ]);
            return response()->json([
                'status' => 'success',
                'message' => 'Tạo thành công!',
                'data' => $banners,
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
                'image' => 'required|string',
                'number' => 'nullable|integer',
                'type' => 'required|integer',
                'status' => 'required|integer|in:0,1',
                'link' => 'nullable|string',
            ], [
                'image.required' => 'Hình ảnh không được để trống!',
                'image.string' => 'Hình ảnh phải là ký tự!',
                'type.required' => 'Loại banner không được để trống!',
                'type.integer' => 'Loại banner phải là ký tự!',
                'number.integer' => 'Số thứ tự phải là dạng số',
                'status.required' => 'Trạng thái không được để trống!',
                'status.in' => 'Trạng thái phải là 1 hoặc 0',
                'link.string'=>'Link phải là ký tự!'
            ]);
            $banner = Banner::find($id);
            if($banner->image != $request->image){
                checkImage($banner->image);
            }
            $banner->update([
                "image" => $request->image,
                "type" => $request->type,
                'status' => $request->status,
                "number" => $request->number,
                'link'=>$request->link
            ]);
            if ($request->number) {
                $newNumber = $request->number;
                $categories = Banner::where('type', '=', $banner->type)
                    ->where('id', '!=', $banner->id)
                    ->orderBy('number', 'ASC')
                    ->get();

                $banner->number = $newNumber;
                $banner->save();

                $index = 1;
                foreach ($categories as $categoryNew) {
                    if ($index == $newNumber) {
                        $index++;
                    }
                    $categoryNew->number = $index;
                    $categoryNew->save();
                    $index++;
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật thành công!',
                'data' => $banner,
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

            $banner = Banner::find($id);
            if (!$banner) {
                return createError(404, 'Không tìm thấy banner!');
            }
            checkImage($banner->image);
            $banner->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Xóa thành công!',
                'data' => $banner,
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
}
