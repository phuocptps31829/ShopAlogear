<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ProductCategory;
use App\Models\WorkSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{

    public function getSelect(Request $request)
    {
        try {
            $type = $request->type;
            $children=$request->children;
            $category = Category::select([
                'id', 'name', 'icon', 'slug', 'number', 'status', 'parent', 'type', 'display',
            ]);

            if($type){
                $category->where('type', $type);
            }

            if($children){
                $category= $category->with(['children' => function ($query) {
                    $query->orderBy("number", "ASC")
                        ->select([
                            'id', 'name', 'icon', 'slug', 'number', 'status', 'parent', 'type', 'display',
                        ]);
                }]);
            }else{
                $category=$category->where('parent','=',null);
            }
            $category=$category->orderBy("number", "ASC")->get();
            if ($category) {
                createError(404, "Không tìm thấy danh mục!");
            }
            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => $category
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function getOne(Request $request)
    {
        try {

            $id = $request->id;
            $category = Category::find($id);
            if ($category) {
                createError(404, "Không tìm thấy danh mục!");
            }
            $list = Category::where('type', $category->type)
                ->where('parent', $category->parent)
                ->where('number', '!=', null)
                ->orderBy('number', 'ASC')
                ->pluck('number')
                ->toArray();

            if (empty($list)) {
                $list = [0, 1];
            } else {
                if ($category->number != null) {
                    array_unshift($list, 0);
                } else {
                    array_unshift($list, 0);
                    $list[] = max($list) + 1;
                }
            }


            $category->listNumber=$list;

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
            $sort = $request->sort;
            $search = $request->search;
            $page = $request->page;
            $all = $request->all;
            $level = $request->level;
            $samplePacks =$request->samplePacks;

            $productCategory = DB::table("product_category")
                ->select([
                    "categoryID",
                    DB::raw("COUNT(DISTINCT productID) as totalProducts")
                ])
                ->groupBy("categoryID");


            $categories = Category::
                orderBy("type", "ASC")
            ->orderByRaw("CASE WHEN number IS NULL THEN 1 ELSE 0 END, number ASC")
            ->orderBy("name", "ASC")
                ->whereNull("parent")

                ->leftJoinSub($productCategory, 'product_category', function ($join) {
                    $join->on('category.id', '=', 'product_category.categoryID');
                })
                ->with(['children' => function ($query) use ($productCategory) {
                    $query->orderByRaw("CASE WHEN number IS NULL THEN 1 ELSE 0 END, number ASC")
                        ->orderBy("name", "ASC")
                        ->select([
                            'id', 'name', 'icon', 'slug', 'number', 'status', 'parent', 'type', 'display',
                            DB::raw("(SELECT COUNT(DISTINCT productID) FROM product_category WHERE product_category.categoryID = category.id) as totalProducts")
                        ]);
                }]);

            if ($level) {
                if ((int)$level == 1) {
                    $categories->where("parent", null);
                } elseif ((int)$level == 2) {
                    $categories->where("parent", '<>', null);
                }
            }
            if ($samplePacks) {
                $categories->where("id", 6);
            }
            if ($type) {
                $categories->where("type", (int)$type);
            }

            if ($search) {
                $categories->where("name", "like", "%" . $search . "%");
            }
            $allRecords = clone $categories;
            $totalRecords = $allRecords->count();
            if ($skip && $limit) {
                $categories->skip((int)$skip);
            }

            if ($limit && !$all) {
                if ($page) {
                    $skip = ((int)$page - 1) * $limit;
                    $categories->skip((int)$skip);
                }
                $categories->limit((int)$limit);
            }

            if ($sort == 1) {
                $categories->orderBy('name', "ASC");
            } elseif ($sort == 2) {
                $categories->orderBy('name', "DESC");
            } elseif ($sort == 3) {
                $categories->orderBy('number', "ASC");
            } elseif ($sort == 4) {
                $categories->orderBy('number', "DESC");
            } elseif ($sort == 5) {
                $categories->orderBy('id', "ASC");
            } else {
                $categories->orderBy('id', "DESC");
            }

            $categories = $categories->get([
                'id', 'name', 'icon', 'slug', 'status', 'number', 'type', 'display',
                DB::raw("COALESCE(product_category.totalProducts, 0) as totalProducts")
            ]);

            $categories->each(function ($category) {
                $category->totalProducts = ($category->totalProducts ?? 0) + ($category->children ? $category->children->sum('totalProducts') : 0);
            });

            $response = [
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => [
                    "totalRecords" => $totalRecords,
                    "products" => $categories ? $categories : null,
                    "totalPage" => $categories ? ceil($totalRecords / $limit) : null,
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
//            $cacheKey = 'category_' . md5(json_encode($request->all()));
//
//            // ✅ Kiểm tra cache trước khi query database
//            if (Cache::has($cacheKey)) {
//                return response()->json(Cache::get($cacheKey));
//            }
            $type = $request->type;
            $skip = $request->skip;
            $limit = $request->limit ?? 10;
            $sort = $request->sort;
            $search = $request->search;
            $page = $request->page;
            $all = $request->all;
            $level = $request->level;

            $categories = Category::where("status", "<>", 0)
                ->whereNull("parent")
              ->orderBy("type", "ASC")
                   ->orderByRaw("CASE WHEN number IS NULL THEN 1 ELSE 0 END, number ASC")
                   ->orderBy("name", "ASC")

                ->with(['children' => function ($query) {
                    $query->orderBy("number", "ASC");
                    $query->orderBy("name", "ASC")
                        ->where("status", "<>", 0)
                        ->select([
                            'id', 'name', 'icon', 'slug', 'number', 'status', 'parent', 'type', 'display'
                        ]);
                }]);

            if ($level) {
                if ((int)$level == 1) {
                    $categories->where("parent", null);
                } elseif ((int)$level == 2) {
                    $categories->where("parent", '<>', null);
                }
            }

            if ($type) {
                $categories->where("type", (int)$type);
            }

            if ($search) {
                $categories->where("name", "like", "%" . $search . "%");
            }

            if ($skip && $limit) {
                $categories->skip((int)$skip);
            }

            if ($limit && !$all) {
                if ($page) {
                    $skip = ((int)$page - 1) * $limit;
                    $categories->skip((int)$skip);
                }
                $categories->limit((int)$limit);
            }

            if ($sort == 1) {
                $categories->orderBy('name', "ASC");
            } elseif ($sort == 2) {
                $categories->orderBy('name', "DESC");
            } elseif ($sort == 3) {
                $categories->orderBy('number', "ASC");
            } elseif ($sort == 4) {
                $categories->orderBy('number', "DESC");
            } elseif ($sort == 5) {
                $categories->orderBy('id', "ASC");
            } else {
                $categories->orderBy('id', "DESC");
            }

            $categories = $categories->get(['id', 'name', 'icon', 'slug', 'status', 'number', 'type', 'display']);

            $columns=4;
            if ($request->option == 1) {
                foreach ($categories as $category) {
                    if ($category->children) {
                        $children = collect($category->children);

                        $rows = ceil($children->count() / $columns); // Số hàng
                        $sortedChildren = array_fill(0, $children->count(), null); // Mảng rỗng để sắp xếp lại

                        $index = 0;
                        for ($col = 0; $col < $columns; $col++) {
                            for ($row = 0; $row < $rows; $row++) {
                                $position = $row * $columns + $col; // Công thức tính vị trí trong mảng
                                if ($position < $children->count()) {
                                    $sortedChildren[$index] = $children[$position];
                                    $index++;
                                }
                            }
                        }

                        $category->children = array_values(array_filter($sortedChildren)); // Xóa null và reset index
                    }
                }
            }

            $response = [
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => $categories
            ];
//            Cache::put($cacheKey, $response, 600);
            return response()->json($response, 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function getAllCategory(Request $request)
    {
        try {
            //            $cacheKey = 'category_' . md5(json_encode($request->all()));
//
//            // ✅ Kiểm tra cache trước khi query database
//            if (Cache::has($cacheKey)) {
//                return response()->json(Cache::get($cacheKey));
//            }
            $type = $request->type;
            $categories = Category::where("status", "<>", 0)
                ->whereNull("parent")
                ->orderBy("type", "ASC")
                ->orderByRaw("CASE WHEN number IS NULL THEN 1 ELSE 0 END, number ASC")
                ->orderBy("name", "ASC")
                ->with(['children' => function ($query) {
                    $query->orderByRaw("CASE WHEN number IS NULL THEN 1 ELSE 0 END, number ASC")
                        ->orderBy("name", "ASC")
                        ->where("status", "<>", 0)
                        ->select(['id', 'name', 'icon', 'slug', 'number', 'status', 'parent', 'type', 'display']);
                }]);

            if ($type) {
                $categories = $categories->where("type", (int)$type);
            }
            $categories = $categories->get(['id', 'name', 'icon', 'slug', 'status', 'number', 'type', 'display'])
                ->toArray();
            if ($request->option == 1) {
                foreach ($categories as &$category) {
                    if ($category['children']) {

                        $data = $category['children'];

                        $columns = 4;
                        $totalItems = count($data);
// Tính số hàng
                        $rows = ceil($totalItems / $columns);
// Tính số phần tử mỗi cột (ưu tiên cột bên trái nhiều hơn)
                        $columnSizes = array_fill(0, $columns, intdiv($totalItems, $columns));
                        for ($i = 0; $i < ($totalItems % $columns); $i++) {
                            $columnSizes[$i]++;
                        }

// Tạo mảng rỗng theo từng cột
                        $result = array_fill(0, $columns, []);

// Phân bố dữ liệu theo từng cột căn trái
                        $offset = 0;
                        for ($col = 0; $col < $columns; $col++) {
                            $result[$col] = array_slice($data, $offset, $columnSizes[$col]);
                            $offset += $columnSizes[$col];
                        }
// 1 Tạo mảng 2D (đổ dữ liệu theo hàng)
//                        $matrix= array_chunk($data, $rows);/
                        $arrayData = [];
                        for ($row = 0; $row < $rows; $row++) {
                            for ($col = 0; $col < $columns; $col++) {
                                if (isset($result[$col][$row])) {
                                    $arrayData[] = $result[$col][$row]; // Thêm phần tử theo hàng
                                }
                            }
                        }
                        $category['children']=$arrayData;

                    }

                }

            }

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => $categories
            ], 200);

        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function create(Request $request)
    {
        try {

            $request->validate([
                'name' => 'required|string',
                'icon' => 'nullable|string',
                'type' => 'required|integer',
                'parent' => 'nullable|integer|exists:category,id',
                'status' => 'required|integer|in:0,1',
                'number' => 'nullable|integer',
                'display' => 'nullable|integer|in:0,1'
            ], [
                'name.required' => 'Tên danh mục không được để trống!',
                'name.string' => 'Tên danh mục phải là ký tự!',
                'icon.string' => 'Icon phải là ký tự!',
                'type.required' => 'Loại danh mục không được để trống!',
                'type.integer' => 'Loại danh mục phải là số!',
                'parent.exists' => 'ID danh mục cha không tồn tại!',
                'parent.integer' => 'ID danh mục cha phải là số!',
                'status.in' => 'Trạng thái danh mục phải là số 0 hoặc 1',
                'number.integer' => 'Số thứ tự phải là dạng số',
                'display.in' => 'Hiển thị danh mục phải là số 0 hoặc 1',
            ]);

//            if (!$request->number) {
//                $category = Category::where('type', '=', (int)$request->type)
//                    ->where('parent', '=', (int)$request->parent)
//                    ->orderBy('number', 'DESC')
//                    ->first();
//
//                if ($category && $category->number > 0) {
//                    $number = $category->number + 1;
//                    $request->merge(['number' => $number]);
//                } else {
//                    $request->merge(['number'=> 1]);
//                }
//            }

            $newCategory = Category::create([
                "name" => $request->name,
                "slug" => checkSlug($request->name, 'category'),
                "icon" => $request->icon,
                "number" => $request->number,
                "type" => $request->type,
                "parent" => $request->parent,
                "status" => $request->status,
                "display" => $request->display
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Lưu thành công!',
                'data' => $newCategory
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function update(Request $request)
    {
        try {
            $id = $request->route('id');
            if (!$id) {
                return createError(400, 'ID Không được trống!');
            }

            $request->validate([
                'name' => 'required|string',
                'icon' => 'nullable|string',
                'parent' => 'nullable|integer|exists:category,id',
                'status' => 'required|integer|in:0,1',
                'number' => 'required|integer',
                'display' => 'nullable|integer|in:0,1',
            ], [
                'name.required' => 'Tên danh mục không được để trống!',
                'name.string' => 'Tên danh mục phải là ký tự!',
                'icon.string' => 'Icon phải là ký tự!',
                'parent.exists' => 'ID danh mục cha không tồn tại!',
                'parent.integer' => 'ID danh mục cha phải là số!',
                'status.in' => 'Trạng thái danh mục phải là số 0 hoặc 1',
                'number.integer' => 'Số thứ tự phải là dạng số',
                'display.in' => 'Hiển thị danh mục phải là số 0 hoặc 1',
            ]);
            $category = Category::find($request->id);
            if (!$category) {
                return createError(404, 'Không tìm thấy danh mục!');
            }
            $oldNumber = $category->number;
            $newNumber = $request->number ?: null;

            $category->update([
                "name" => $request->name,
                "slug" => $request->name!=$category->name? checkSlug($request->name, 'category'): $request->name,
                "icon" => $request->icon,
                "number" => $newNumber,
                "parent" => $request->parent,
                "status" => $request->status,
                "display" => $request->display
            ]);


            $categories = Category::where('type', '=', $category->type)
                ->where('parent', '=', $category->parent)
                ->whereNotNull('number')
                ->orderBy('number', 'ASC')
                ->get();
            if ($oldNumber !== null && $newNumber === null) {
                foreach ($categories as $categoryNew) {
                    if ($categoryNew->number > $oldNumber) {
                        $categoryNew->update(['number' => $categoryNew->number - 1]);
                    }
                }
            }

            elseif ($newNumber !== null) {
                foreach ($categories as $categoryNew) {
                    if ($categoryNew->id !== $category->id && $categoryNew->number >= $newNumber) {
                        $categoryNew->update(['number' => $categoryNew->number + 1]);
                    }
                }
            }

            $index = 1;
            $categories = Category::where('type', '=', $category->type)
                ->where('parent', '=', $category->parent)
                ->whereNotNull('number')
                ->orderBy('number', 'ASC')
                ->get();

            foreach ($categories as $categoryNew) {
                $categoryNew->update(['number' => $index]);
                $index++;
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Lưu thành công!',
                'data' => $category
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

            $category = Category::
               leftJoin('product_category as pc', 'category.id', '=', 'pc.categoryID')
                ->groupBy(['category.id',
                    'category.name',
                    'pc.categoryID'])
                ->select([
                    'category.id',
                    'category.name',
                    DB::raw("COUNT( pc.categoryID) as totalProducts"),
                ])
                ->where('category.id', '=', $id)
                ->first();

            if (!$category) {
                return createError(404, 'Không tìm thấy danh mục!');
            }
            if($category->type==2&&$category->parent==null){
                return createError(422, "Danh mục gốc không được xóa!");
            }
            if($category->id==6){
                return createError(422,"Danh mục gốc không được xóa!");
            }

           $checkCategory=Category::where('parent', '=', $id)->first();
            if ($checkCategory) {
                return createError(422, 'Danh mục đang có danh mục con!');
            }
            if ($category->totalProducts > 0) {
                return createError(422, 'Danh mục đang có sản phẩm!');
            }
            $category->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Xóa thành công!',
                'data' => $category,
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }


}
