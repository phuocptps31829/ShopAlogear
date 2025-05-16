<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function getOne(Request $request)
    {
        try {
            $id = $request->id;
            $brand = Brand::find($id);
            if (!$brand) {
                createError(404, "Không tìm thấy banner!");
            }
            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => $brand
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
            $page=$request->page ;
            $all=$request->all ;
            $search=$request->search;

            $brand = Brand::
            select([
                "id",
                "name",
            ]);
            if($search){
                $brand=$brand->where("name","like","%$search%");
            }
            $brand->orderBy("name","ASC");

            $allRecords = clone $brand;
            $totalRecords = $allRecords->count();

            if ($skip && $limit) {
                $brand->skip((int)$skip);
            }
            if ($limit && !$all) {
                if ($page) {
                    $skip = ((int)$page - 1) * $limit;
                    $brand->skip((int)$skip);
                }
                $brand->take((int)$limit);
            }
            $brand = $brand->get();
            $response=[
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => [
                    "totalRecords" => $totalRecords,
                    "products" => $brand ? $brand : null,
                    "page" => $brand ? ceil($totalRecords / $limit) : null,
                ]

            ];

            return response()->json($response, 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function getAll(Request $request)
    {
        try {
            $limit = $request->limit;
            $skip = $request->skip;
            $type = $request->type;
            $columns = 4;
            $brand = Brand::
            select([
                "id",
                "name"
            ]);

            $allRecords = clone $brand;
            $totalRecords = $allRecords->count();
            $brand->orderBy("name","ASC");

            if ($skip) {
                $brand = $brand->skip($skip);
            }
            if ($limit) {
                $brand = $brand->take($limit);
            }

            $brand = $brand->get();
            if($request->sort==1) {
                $rows = ceil($brand->count() / $columns);
                $sortedBrands = [];
                for ($i = 0; $i < $rows; $i++) {
                    foreach (range(0, $columns - 1) as $col) {
                        $index = $i + ($col * $rows);
                        if (isset($brand[$index])) {
                            $sortedBrands[] = $brand[$index];
                        }
                    }
                }
                $brand=$sortedBrands;
            }

            $response=[
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => [
                    "totalRecords" => $totalRecords,
                    "products" => $brand ? $brand : null,
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
            ], [
                'name.required' => 'Tên thương hiệu không được để trống!',
                'name.string' => 'Tên thương hiệu phải là ký tự!',
            ]);
            $brand = Brand::create([
                "name" => $request->name
            ]);
            return response()->json([
                'status' => 'success',
                'message' => 'Tạo thành công!',
                'data' => $brand,
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
                'name' => 'required|string',
            ], [
                'name.required' => 'Tên thương hiệu không được để trống!',
                'name.string' => 'Tên thương hiệu phải là ký tự!',
            ]);
            $brand = Brand::find($id);

            $brand->update([
                "name" => $request->name
            ]);
            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật thành công!',
                'data' => $brand,
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

            $brand = Brand::find($id);
            if (!$brand) {
                return createError(404, 'Không tìm thấy thương hiệu!');
            }

            $brand->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Xóa thành công!',
                'data' => $brand,
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
}
