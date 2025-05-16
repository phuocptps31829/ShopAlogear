<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function update(Request $request)
    {
        try {

            $id = $request->id;
            $request->validate([
                'username' => 'required|string',
                'email' => 'nullable|string|email',
                'phone' => 'nullable|string',
                'address' => 'nullable|string',
                'avatar' => 'nullable|string',
                'isActive' => 'nullable|integer|in:0,1',
                'password' => 'nullable|string|min:6',
            ], [
                'username.required' => 'Tên tài khoản không được để trống!',
                'username.string' => 'Tên tài khoản phải là dạng chuỗi!',

                'email.required' => 'Email không được để trống!',
                'email.string' => 'Email phải là dạng chuỗi!',
                'email.email' => 'Email không hợp lệ!',
                'email.unique' => 'Email đã tồn tại trong hệ thống!',

                'phone.required' => 'Số điện thoại không được để trống!',
                'phone.string' => 'Số điện thoại phải là dạng chuỗi!',
                'phone.unique' => 'Số điện thoại đã tồn tại trong hệ thống!',

                'address.required' => 'Địa chỉ không được để trống!',
                'address.string' => 'Địa chỉ phải là dạng chuỗi!',

                'isActive.required' => 'Trạng thái không được để trống!',
                'avatar.string' => 'Ảnh đại diện phải là dạng chuỗi!',

                'isActive.integer' => 'Trạng thái phải là dạng số!',
                'isActive.in' => 'Trạng thái phải là 0 hoặc 1!',

                'password.min' => "Mật khẩu phải dài hơn 6 ký tự!"
            ]);

            $user = User::find($id);
            if(!$user){
                return createError(404,"không tìm thấy tài khoản!");
            }
            if($request->username){
                $user->username=$request->username;
            }
            if($request->email){
              $check=  checkPhoneAndEmail(null,$request->email,$id);
              if($check){
                  return createError(400,$check);
              }
                $user->email=$request->email;
            }
            if($request->address){
                $user->address=$request->address;
            }
            if($request->avatar){
                if(!$user->avatar==$request->avatar){
                    checkImage($request->avatar);
                }
                $user->avatar=$request->avatar;
            }

            if($request->isActive){
                $user->isActive=$request->isActive;
            }

            if($request->phone){
                $checkPhone=checkPhoneAndEmail($request->phone,null,$id);
                if($checkPhone){
                    return createError(400,$checkPhone);
                }
                $user->phone=$request->phone;
            }

            if(isset($request->password)){
                $user->password=$request->password;
            }

            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật thành công!',
                'data' => $user,
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

            $user = User::find($id);
            if (!$user) {
                return createError(404, 'Không tìm thấy tài khoản!');
            }
            checkImage($user->avatar);
            $user->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Xóa thành công!',
                'data' => $user,
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function create(Request $request)
    {
        try {

            $request->validate([
                'username' => 'required|string',
                'email' => 'required|string|email|unique:users',
                'phone' => 'nullable|string|unique:users',
                'address' => 'nullable|string',
                'avatar' => 'nullable|string',
                'isActive' => 'required|integer|in:0,1',
                'password' => 'nullable|string|min:6',
            ], [
                'username.required' => 'Tên tài khoản không được để trống!',
                'username.string' => 'Tên tài khoản phải là dạng chuỗi!',

                'email.required' => 'Email không được để trống!',
                'email.string' => 'Email phải là dạng chuỗi!',
                'email.email' => 'Email không hợp lệ!',
                'email.unique' => 'Email đã tồn tại trong hệ thống!',

                'phone.required' => 'Số điện thoại không được để trống!',
                'phone.string' => 'Số điện thoại phải là dạng chuỗi!',
                'phone.unique' => 'Số điện thoại đã tồn tại trong hệ thống!',

                'address.required' => 'Địa chỉ không được để trống!',
                'address.string' => 'Địa chỉ phải là dạng chuỗi!',

                'isActive.required' => 'Trạng thái không được để trống!',
                'avatar.string' => 'Ảnh đại diện phải là dạng chuỗi!',

                'isActive.integer' => 'Trạng thái phải là dạng số!',
                'isActive.in' => 'Trạng thái phải là 0 hoặc 1!',

                'password.min' => "Mật khẩu phải dài hơn 6 ký tự!"
            ]);

            $check= checkPhoneAndEmail($request->phone, $request->email);

            if($check){
                return createError(400,$check);
            }

            $user = User::create([
                "username" => $request->username,
                "email" => $request->email,
                "phone" => $request->phone,
                'isActive' => $request->isActive,
                "avatar" => $request->avatar,
                "address" => $request->address,
                "password" => $request->password ?? generateRandomString(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Tạo thành công!',
                'data' => $user,
            ], 201);

        } catch (\Exception $e) {
            return handleException($e);
        }
    }


    public function getOne(Request $request)
    {
        try {
            $id = $request->id;
            $user = User::find($id);

            if ($user) {
                createError(404, "Không tìm thấy tài khoản!");
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function getList(Request $request)
    {
        try {

            $role = $request->role;
            $skip = $request->skip;
            $limit = $request->limit ?? 10;
            $page = $request->page;
            $all = $request->all;
            $sort = $request->sort;
            $search = $request->search;
            $user = User::select([
                "id",
                "username",
                "email",
                "phone",
                "avatar",
                "address",
                "isActive",
                "role"
            ]);

            if ($role) {
                $user = $user->where("type", (int)$role);
            }
            if ($search) {
                $user = $user->where(function ($query) use ($search) {
                    $query->where("username", "like", "%$search%");
                    $query->orWhere("email", "like", "%$search%");
                    $query->orWhere("phone", "like", "%$search%");
                });
            }

            $allRecords = clone $user;
            $totalRecords = $allRecords->count();
            if ($sort == 1) {
                $user->orderBy('username', "ASC");
            } elseif ($sort == 2) {
                $user->orderBy('username', "DESC");
            } elseif ($sort == 3) {
                $user->orderBy('email', "ASC");
            } elseif ($sort == 4) {
                $user->orderBy('email', "DESC");
            } elseif ($sort == 5) {
                $user->orderBy('id', "ASC");
            } else {
                $user->orderBy('id', "DESC");
            }

            if ($skip && $limit) {
                $user->skip((int)$skip);
            }
            if ($limit && !$all) {
                if ($page) {
                    $skip = ((int)$page - 1) * $limit;
                    $user->skip((int)$skip);
                }
                $user->take((int)$limit);
            }
            $user = $user->get();
            $response = [
                'status' => 'success',
                'message' => 'Lấy dữ liệu thành công!',
                'data' => [
                    "totalRecords" => $totalRecords,
                    "users" => $user ? $user : null,
                    "page" => $user ? ceil($totalRecords / $limit) : null,
                ]

            ];

            return response()->json($response, 200);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }
}
