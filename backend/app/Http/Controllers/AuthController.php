<?php

namespace App\Http\Controllers;

use App\Mail\SendMail;
use App\Mail\SendOTP;
use App\Mail\SendRegister;
use App\Models\Banner;
use App\Models\OTP;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Laravel\Socialite\Facades\Socialite;
use MongoDB\BSON\ObjectId;
use Nette\Utils\Random;
use GuzzleHttp\Client;
use Illuminate\Http\UploadedFile;
use function Laravel\Prompts\select;

class AuthController extends Controller
{
    public function setRole(Request $request)
    {
        try {
            $id = $request->jwtAuth['id'];
            $userID =  $request->route('id');
            $role = $request->role;
            $profile = User::find($id, ['id', 'username', 'email', 'phone', 'address', 'avatar', 'role']);
            if ($profile->role == 1) {
                if($id==$userID){
                    return createError(403,"Không thể cập nhật chính tài khooản này!");
                }

                $user = User::find($userID);
                if ($user) {
                    $user->role = $role;
                    $user->save();
                } else {
                    return createError(404, "Không tìm thấy tài khoản!");
                }
            }
            return response()->json([
                'message' => 'Lấy dữ liệu thành công!',
                'data' => $user??null
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function getProfile(Request $request)
    {
        try {
            $id = $request->jwtAuth['id'];
            $profile = User::
                with(['orders' => function ($query) {
                    $query->orderBy("id", "desc")
                        ->select([  "id",
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
                            "userID",
                            "success"])
                ->selectRaw("DATE_FORMAT(time, '%H:%i:%s %d-%m-%Y') as time")
                        ->where("success",1)
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

                }])
            ->select([
                'id', 'username', 'email', 'phone', 'address', 'avatar', 'role'
            ])->where('id', $id)->first();

            return response()->json([
                'message' => 'Lấy dữ liệu thành công!',
                'data' => $profile
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function updateUser(Request $request)
    {
        try {
            $request->validate([
                "username" => "nullable|string",
                "phone" => ["nullable", "string", "regex:/^(\+84|0)[3-9][0-9]{8}$/"],
                "password" => "nullable|string",
                "newPassword" => "nullable|string|min:6",
                "avatar" => "nullable|string",
                "address" => "nullable|string",
            ], [
                'username.string' => 'Tên người dùng phải là chuỗi ký tự!',
                'phone.string' => 'Số điện thoại phải là chuỗi!',
                'phone.regex' => 'Số điện thoại không đúng định dạng!',
                'email.unique' => 'Email đã được sử dụng!',
                'password.string' => 'Mật khẩu phải là chuỗi!',
                'newPassword.string' => 'Mật khẩu mới phải là chuỗi!',
                'newPassword.min' => 'Mật khẩu mới phải lớn hơn 6 ký tự!',
                'address.string' => 'Địa chỉ phải là chuỗi!',
                'avatar.string' => 'Ảnh đại diện phải là chuỗi!',
            ]);
            $id = $request->jwtAuth['id'];

            $userFound = User::where('id', $id)
                ->where('isActive', 1)
                ->first();

            if (!$userFound) {
                return createError(404, "Không tiềm thấy tài khoản");
            }

            if ($request->password) {
                if (Hash::check($request->password, $userFound->password)) {
                    $userFound->password = $request->newPassword;
                } else {
                    return createError(401, "Mật khẩu cũ không đúng");
                }
            }

            if ($request->username && trim($request->username)) {
                $userFound->username = trim($request->username);
            }
            if ($request->address && trim($request->address)) {
                $userFound->address = trim($request->address);
            }

            if ($request->phone) {
                checkPhoneAndEmail($request->phone, null, $userFound->id);
                $userFound->phone = $request->phone;
            }

            if ($request->avatar) {
                if ($request->avatar != $userFound->avatar) {
                    checkImage($userFound->avatar);
                }
                $userFound->avatar = $request->avatar;
            }

            $userFound->save();
            return response()->json([
                'message' => 'Updated password successfully',
                'data' => $userFound
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }

    }

    public function resetPassword(Request $request)
    {
        try {
            $request->validate([
                "password" => "required|string|min:6",
//                "newPassword" => "required|string",
            ], [
                'password.required' => "Mật khẩu không được để trống",
                'password.string' => "mật khẩu phải là chuỗi",
                'password.min' => "Mật khẩu phải lớn hơn 6 ký tự!"
            ]);

            $userFound = User::where('email', $request->newUser['email'])
                ->where('isActive', 1)
                ->first();

            if (!$userFound) {
                return createError(404, "Không tiềm thấy tài khoản");
            }

//            if (Hash::check($request->password, $userFound->password)) {
            $userFound->password = $request->password;
            $userFound->save();
//            } else {
//                return createError(401, "Mật khẩu không đúng");
//            }
            return response()->json([
                'message' => 'Updated password successfully',
                'data' => $userFound
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function logout(Request $request)
    {
        try {
            return response()->json([
                'message' => 'logout successfully',
            ], 200);
        } catch (\Exception $e) {
            // Xử lý lỗi
            return response()->json(['error' => 'Something went wrong', 'message' => $e->getMessage()], 500);
        }
    }

    public function refreshToken(Request $request)
    {
        try {
            $user = User::where('id', $request->id)->first();
            if (!$user) {
                createError(404, "Không tìm thấy tài khoản!");
            }
            $newTokens = generateAccessRefreshToken($user);

            return response()->json([
                "data" => [
                    'accessToken' => $newTokens['accessToken'],
                    'refreshToken' => $newTokens['refreshToken'],
                ]
            ], 200);
        } catch (\Exception $e) {
            // Xử lý lỗi
            return response()->json(['error' => 'Something went wrong', 'message' => $e->getMessage()], 500);
        }
    }

    public function forgotPassword(Request $request)
    {
        try {
            $email = $request->newUser['email'];

            $userFound = User::where('email', $email)
                ->where('isActive', true)
                ->first();

            if (!$userFound) {
                return createError(404, "Không tìm thấy tài khoản");
            }

            $userFound->password = $request->password;
            $userFound->save();

            return response()->json([
                'message' => 'Đã gửi yêu cầu quên mật khẩu!',
                'data' => $userFound
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function checkOTPForgotPassword(Request $request)
    {
        try {
            $OTP = $request->input('OTP');
            $newUser = $request->newUser;

            $email = $newUser['email'];
            $password = $newUser['password'];

            $otpToken = generateOTPToken(
                $email,
                $password,
            );

            return response()->json([
                'message' => 'OTP is correct',
                'data' => [
                    'OTP' => $OTP,
                    'otpToken' => $otpToken
                ]
            ], 201);
        } catch (\Exception $e) {
            return handleException($e);
        }
    }

    public function sendOTPForgotPassword(Request $request)
    {
        try {

            $email = $request->email;
            $userFound = User::where('email', $email)->where('isActive', 1)->first();

            if (!$userFound) {
                return createError(404, 'Không tìm thấy tài khoản!');
            }
            $checkOTP = OTP::where('email', $email)->latest()->first();

            if ($checkOTP) {
                if (Carbon::parse($checkOTP->time)->diffInMinutes(Carbon::now()) < 2) {
                    return createError(400, 'Chỉ gửi lại OTP sau 2 phút!');
                }
            }

            $OTP = (string)rand(100000, 999999);;

            $hashedOTP = Hash::make($OTP);
            $banner=Banner::where('type',3)->first();

            $data['otp'] = $OTP;
            $data['image'] = $banner->image??null;
            Mail::to($userFound->email)->send(new SendOTP($data));

            OTP::create([
                'otp' => $hashedOTP,
                'email' => $email,
                'time' => Carbon::now()
            ]);

            $otpToken = generateOTPToken(
                $userFound->email,
                $userFound->password,
            );

            return response()->json([
                'message' => 'Gửi OTP thành công!',
                'data' => [
                    'otpToken' => $otpToken,
                ]
            ], 201);
        } catch (\Exception $e) {

            return handleException($e);
        }
    }

    public function loginGoogle()
    {
        $url = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();

        return response()->json([
            'message' => 'Successfully',
            'data' => [
                'url' => $url
            ]
        ], 200);
    }

    public function googleCallback(Request $request)
    {
        $http = new Client();
        try {
            // 1️⃣ Đổi Authorization Code thành Access Token
            $response = $http->post('https://oauth2.googleapis.com/token', [
                'form_params' => [
                    'client_id' => env('GOOGLE_CLIENT_ID'),
                    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
                    'redirect_uri' => env('GOOGLE_REDIRECT_URI'),
                    'grant_type' => 'authorization_code',
                    'code' => $request->code, // Code từ frontend
                ],
            ]);

            $tokens = json_decode((string)$response->getBody(), true);
            $accessToken = $tokens['access_token']; // Lấy access_token từ response
            // 2️⃣ Dùng Access Token lấy thông tin user
            $user = Socialite::driver('google')->stateless()->userFromToken($accessToken);
//            $user = Socialite::driver('google')->stateless()->userFromToken($request->code);

            $findUser = User::where('email', '=', $user->email)->first();
            if ($findUser) {
                $token = generateAccessRefreshToken($findUser);
            } else {
                $client = new Client();
                $responseImage = $client->get($user->avatar);
                $avatar = null;
                // Lưu tạm file vào hệ thống
                $tempPath = tempnam(sys_get_temp_dir(), 'avatar');
                file_put_contents($tempPath, $responseImage->getBody());

                // Chuyển đổi thành UploadedFile giống file gửi từ form
                $uploadedFile = new UploadedFile(
                    $tempPath,
                    'avatar.jpg',
                    mime_content_type($tempPath),
                    null,
                    true // Đánh dấu file là hợp lệ
                );

                if (!checkValidImage($uploadedFile)) {
                    $avatar = uploadImage($uploadedFile);
                }
                $userNew = User::create([
                    "username" => $user->name,
                    "email" => $user->email,
                    "password" => generateRandomString(),
                    "avatar" => $avatar,
                    "auth" => 2,
                    "isActive" => 1,
                ]);
                $token = generateAccessRefreshToken($userNew);
            }
            return response()->json([
                'message' => 'User logged in successfully.',
                'data' => [
                    'accessToken' => $token['accessToken'],
                    'refreshToken' => $token['refreshToken']
                ]
            ], 200);
        } catch (Exception $e) {
            return handleException($e);
        }

    }

    public function register(Request $request)
    {
        try {
//            \DB::beginTransaction();
            $request->validate([
                'email' => 'required|email|unique:users',
                'password' => 'required|string|min:6',
            ], [
                'email.required' => 'Email không được bỏ trống!',
                'email.email' => 'Email không đúng định dạng!',
                'email.unique' => 'Email đã được đăng ký!',
                'password.required' => 'Mật khẩu không được bỏ trống!',
                'password.string' => 'Mật khẩu phải là chuỗi!',
                'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
            ]);
            $user = User::create([
                "email" => $request->email,
                "password" => $request->password,
                "username" => $request->email,
                "role" => 0,
                "isActive" => 2,
            ]);
            $banner=Banner::where('type',3)->first();
            $data = [
                "email" => $user->email,
                'token' => Crypt::encryptString($user->email),
                'image' => $banner->image??null,
            ];
//            Mail::to('gameming132@gmail.com')->queue(new SendMail($data));
            Mail::to($user->email)->queue(new SendRegister($data));
            return response()->json([
                'message' => 'Đăng ký thành công!',
                'data' => null,
            ], 201);
        } catch (\Exception $e) {
//            \DB::rollBack();
            if (isset($user)) {
                $user->delete();
            }
            return handleException($e);
        }
    }


    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ], [
                'email.required' => 'Email không được bỏ trống!',
                'email.email' => 'Email không đúng định dạng!',
                'password.required' => 'Mật khẩu không được bỏ trống',
                'password.string' => 'Mật khẩu phải là chuỗi!'
            ]);

            $user = User::where('email', '=', $request->email)->first();

            if (!$user) {
                return createError(400, 'Email hoặc mật khẩu không đúng.');
            }
            $validPassword = Hash::check($request->password, $user->password);

            if (!$validPassword) {
                return createError(400, 'Email hoặc mật khẩu không đúng.');
            }

            if ($user->isActive == 2) {
                return createError(400, 'Tài khoản chưa được kích hoạt!');
            }

            if ($user->isActive == 0) {
                return createError(400, 'Tài khoản đã bị khóa!');
            }

//            if (!$user->role) {
//                if (isset($request->isAdmin)) {
//                    return createError(403, 'Tài khoản hoặc mật khẩu không đúng!');
//                }
//            } else {
//                if (!isset($request->isAdmin)) {
//                    return createError(403, 'Tài khoản hoặc mật khẩu không đúng!');
//                }
//            }
            $token = generateAccessRefreshToken($user);

            return response()->json([
                'message' => 'User logged in successfully.',
                'data' => [
                    'accessToken' => $token['accessToken'],
                    'refreshToken' => $token['refreshToken']
                ]
            ], 200);
        } catch (\Exception $e) {

            return handleException($e);
        }
    }

    public function redirectRegister(Request $request)
    {
        try {
            $token = $request->token;
            $email = Crypt::decryptString($token);
            $user = User::where('email', '=', $email)->first();

            if (!$user) {
                return createError(400, 'Sai thông tin tài khoản!');
            }
            if ($user->isActive != 2) {
                return createError(403, 'Đường dẫn đã hết hiệu lực!');
            }
            $user->isActive = 1;
            $user->save();

            return view('redirect.redirect_register');
        } catch (\Exception $e) {

            return handleException($e);
        }
    }

}
