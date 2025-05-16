<?php

namespace App\Http\Controllers;

use App\Models\Cooperate;
use App\Models\Product;
use App\Models\ViewCount;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CooperateController extends Controller
{
    public
    function updateView(Request $request)
    {
        try {
            $id = $request->route('id');

            $cooperate = Cooperate::where('id', $id)->first();

            if (!$cooperate) {
                return createError(404, "Không tìm thấy dự án!");
            }
            $cooperate->viewCount++;
            $cooperate->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật thành công!',
                'data' => null,
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
    public function getOne(Request $request)
    {
        try {
            $id = $request->id;
            $cooperate = Cooperate::find($id);

            if ($cooperate) {
                createError(404, "Không tìm thấy dự án!");
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => $cooperate
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
            $page = $request->page ?? 1;
            $all = $request->all;
            $search=$request->search;

            $cooperate = Cooperate::
            select([
                "id",
                "name",
                "description",
                "image",
                "number",
                "status",
                'type',
                'link'
            ])
                ->orderBy("name", "ASC");
            if(isset($search)){
                $cooperate = $cooperate->where('name', 'like', '%'.$search.'%');
            }
            $allRecords = clone $cooperate;
            $totalRecords = $allRecords->count();

            if ($skip && $limit) {
                $cooperate->skip((int)$skip);
            }
            if ($limit && !$all) {
                if ($page) {
                    $skip = ((int)$page - 1) * $limit;
                    $cooperate->skip((int)$skip);
                }
                $cooperate->take((int)$limit);
            }
            $cooperate = $cooperate->get();
            $response = [
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => [
                    "totalRecords" => $totalRecords,
                    "products" => $cooperate ? $cooperate : null,
                    "page" => $cooperate ? ceil($totalRecords / $limit) : null,
                ]

            ];
            return response()->json($response, 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function getCooperate(Request $request)
    {
        try {

            $limit = $request->limit;
            $skip = $request->skip;
            $search = $request->search;

            $cooperate = Cooperate::
            select([
                "id",
                "name",
                "description",
                "image",
                "number",
                "status",
                'type',
                'link',
                'viewCount'
            ])
                ->where("status", 1)
                ->orderBy("id", "DESC");

            $allRecords = clone $cooperate;
            $totalRecords = $allRecords->count();
            if ($skip) {
                $cooperate = $cooperate->skip($skip);
            }
            if ($limit) {
                $cooperate = $cooperate->take($limit);
            }
            if ($search) {
                $cooperate = $cooperate->where("name", "like", "%" . $search . "%");
            }
            $cooperate = $cooperate->get();
            $response = [
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => [
                    "totalRecords" => $totalRecords,
                    "products" => $cooperate ? $cooperate : null,
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
                'image' => 'required|string',
                'number' => 'nullable|integer',
                'description' => 'required|string',
                'status' => 'required|integer|in:0,1',
                'link'=>'required|string',
                'type'=>'required|integer'
            ], [
                'name.required' => 'Tên không được để trống!',
                'name.string' => 'Tên phải là ký tự!',
                'image.required' => 'Hình ảnh không được để trống!',
                'image.string' => 'Hình ảnh phải là ký tự!',
                'description.required' => 'Mô tả không được để trống!',
                'description.string' => 'Mô tả phải là ký tự!',
                'number.integer' => 'Số thứ tự phải là dạng số',
                'status.required' => 'Trạng thái không được để trống!',
                'status.in' => 'Trạng thái phải là 1 hoặc 0'
            ]);
            $cooperate = Cooperate::create([
                "name" => $request->name,
                "image" => $request->image,
                "description" => $request->description,
                'status' => $request->status,
                "number" => $request->number,
                "link"=>$request->link,
                "type"=>$request->type
            ]);
            return response()->json([
                'status' => 'success',
                'message' => 'Tạo thành công!',
                'data' => $cooperate,
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
                'image' => 'required|string',
                'number' => 'nullable|integer',
                'description' => 'required|string',
                'status' => 'required|integer|in:0,1',
                'link'=>'required|string',
                'type'=>'required|integer'
            ], [
                'name.required' => 'Tên không được để trống!',
                'name.string' => 'Tên phải là ký tự!',
                'image.required' => 'Hình ảnh không được để trống!',
                'image.string' => 'Hình ảnh phải là ký tự!',
                'description.required' => 'Mô tả không được để trống!',
                'description.string' => 'Mô tả phải là ký tự!',
                'number.integer' => 'Số thứ tự phải là dạng số',
                'status.required' => 'Trạng thái không được để trống!',
                'status.in' => 'Trạng thái phải là 1 hoặc 0'
            ]);
            $cooperate = Cooperate::find($id);
            if($request->image!=$request->image){
                checkImage($cooperate->image);
            }
            $cooperate->update([
                "name" => $request->name,
                "image" => $request->image,
                "description" => $request->description,
                'status' => $request->status,
                "number" => $request->number,
                "link"=>$request->link,
                "type"=>$request->type
            ]);
            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật thành công!',
                'data' => $cooperate,
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

            $cooperate = Cooperate::find($id);
            if (!$cooperate) {
                return createError(404, 'Không tìm thấy danh mục!');
            }
            checkImage($cooperate->image);

            $cooperate->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Xóa thành công!',
                'data' => $cooperate,
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
}
