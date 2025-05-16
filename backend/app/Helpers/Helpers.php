<?php

use App\Events\NotificationsEvent;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cookie;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Storage;
use App\Models\Invoice;

if (!function_exists('checkTime')) {
    function checkTime($time)
    {
        $checkTime = \App\Models\Sale::whereRaw('? BETWEEN startTime AND endTime', [$time])
            ->where('type', 1)
            ->first();

        return $checkTime ? false : true;
    }
}

if (!function_exists('convertNumberToTextPrice')) {
    function checkImage($image){
        if($image){
            $image=\App\Models\ImageUpload::where('image',$image)->first();
            if($image){
                $image->status=2;
                $image->save();
            }
        }
    }
}


if (!function_exists('convertNumberToTextPrice')) {


    function convertNumberToTextPrice($number)
    {
        $hyphen = ' ';
        $conjunction = ' ';
        $separator = ' ';
        $negative = 'negative ';
        $decimal = ' point ';
        $dictionary = array(
            0 => 'Không',
            1 => 'Một',
            2 => 'Hai',
            3 => 'Ba',
            4 => 'Bốn',
            5 => 'Năm',
            6 => 'Sáu',
            7 => 'Bảy',
            8 => 'Tám',
            9 => 'Chín',
            10 => 'Mười',
            11 => 'Mười một',
            12 => 'Mười hai',
            13 => 'Mười ba',
            14 => 'Mười bốn',
            15 => 'Mười năm',
            16 => 'Mười sáu',
            17 => 'Mười bảy',
            18 => 'Mười tám',
            19 => 'Mười chín',
            20 => 'Hai mươi',
            30 => 'Ba mươi',
            40 => 'Bốn mươi',
            50 => 'Năm mươi',
            60 => 'Sáu mươi',
            70 => 'Bảy mươi',
            80 => 'Tám mươi',
            90 => 'Chín mươi',
            100 => 'trăm',
            1000 => 'ngàn',
            1000000 => 'triệu',
            1000000000 => 'tỷ',
            1000000000000 => 'nghìn tỷ',
            1000000000000000 => 'ngàn triệu triệu',
            1000000000000000000 => 'tỷ tỷ'
        );

        if (!is_numeric($number)) {
            return false;
        }

        // Kiểm tra số âm
        if ($number < 0) {
            return $negative . convertNumberToTextPrice(abs($number));
        }

        $string = $fraction = null;
        if (strpos($number, '.') !== false) {
            list($number, $fraction) = explode('.', $number);
        }

        // Xử lý số nguyên
        if ($number < 21) {
            $string = $dictionary[$number];
        } elseif ($number < 100) {
            $tens = ((int)($number / 10)) * 10;
            $units = $number % 10;
            $string = $dictionary[$tens];
            if ($units) {
                $string .= $hyphen . $dictionary[$units];
            }
        } elseif ($number < 1000) {
            $hundreds = floor($number / 100);
            $remainder = $number % 100;
            $string = $dictionary[$hundreds] . ' ' . $dictionary[100];
            if ($remainder) {
                $string .= $conjunction . convertNumberToTextPrice($remainder);
            }
        } else {
            $baseUnit = pow(1000, floor(log($number, 1000)));
            $numBaseUnits = (int)($number / $baseUnit);
            $remainder = $number % $baseUnit;
            $string = convertNumberToTextPrice($numBaseUnits) . ' ' . $dictionary[$baseUnit];
            if ($remainder) {
                $string .= $separator . convertNumberToTextPrice($remainder);
            }
        }

        // Xử lý phần thập phân nếu có
        if (null !== $fraction && is_numeric($fraction)) {
            $string .= $decimal;
            $words = array();
            foreach (str_split((string)$fraction) as $number) {
                $words[] = $dictionary[$number];
            }
            $string .= implode(' ', $words);
        }

        return $string;
    }

}
if (!function_exists('sendNotification')) {

    function sendNotification($userID,$title,$description,$type=0,$endpoint=null,$_id=null)
    {
        $redirect= new \stdClass();
        $redirect->endpoint=$endpoint;
        $redirect->_id=$_id;
        $notification = Notification::create([
            "userID" => $userID,
            "title" => $title,
            'description'=>$description,
            "type" => $type,
            "isRead" => false,
            "redirect" => $redirect
        ]);
        event(new NotificationsEvent([$userID]));
        return true;
    }
}
if (!function_exists('generateInvoiceCode')) {

    function generateInvoiceCode()
    {
            $randomNumber = rand(10, 99);
            $randomLetters = strtoupper(Str::random(2));
            $randomLastNumber =  substr(time(), -5);
            $invoiceCode = "DH{$randomNumber}{$randomLetters}{$randomLastNumber}";

        return $invoiceCode;
    }
}
    if (!function_exists('generateDate')) {
    function generateDate($date)
    {
        $date = Carbon\Carbon::parse($date);
        $dayOfWeekNumber = $date->dayOfWeek;
        $daysInVietnamese = [
            0 => 'Chủ Nhật',
            1 => 'Thứ Hai',
            2 => 'Thứ Ba',
            3 => 'Thứ Tư',
            4 => 'Thứ Năm',
            5 => 'Thứ Sáu',
            6 => 'Thứ Bảy',
        ];
        return [
            'date' => $date->day,
            'month' => $date->month,
            "year" => $date->year,
            "day" => $daysInVietnamese[$dayOfWeekNumber]
        ];
    }
}

if (!function_exists('successResponse')) {
    function successResponse($data, $message = 'Success', $code = 200)
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
            'errors' => null,
        ], $code);
    }
}
if (!function_exists('handleException')) {
    function handleException($e)
    {
        if ($e instanceof \Illuminate\Validation\ValidationException) {
            $firstError = collect($e->errors())->flatten()->first();
            return createError(422, $firstError);
        }

        if ($e instanceof \App\Exceptions\DataExistsException) {
            return createError((int)$e->getCode(), $e->getMessage());
        }

        return response()->json([
            "error" => [],
            "message" => $e->getMessage()
        ],  500);

    }
}

if (!function_exists('searchInTable')) {
    function generateRandomString($length = 6)
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-={}[]|:;<>,.?';
        return substr(str_shuffle($characters), 0, $length);
    }

    function getAccessToken()
    {
        $apiKeySid = env('API_KEY_SID');
        $apiKeySecret = env('API_KEY_SECRET');

        $now = time();
        $exp = $now + 3600;

        $header = ['cty' => "stringee-api;v=1"];

        $payload = [
            'jti' => $apiKeySid . '-' . $now,
            'iss' => $apiKeySid,
            'exp' => $exp,
            'rest_api' => 1
        ];
        return JWT::encode($payload, $apiKeySecret, 'HS256', null, $header);

    }
    function callNotification($phoneNumber, $message)
    {
        $newPhoneNumber = substr($phoneNumber, 1);

        $options = [
            'from' => [
                'type' => 'external',
                'number' => env('PHONE_NUMBER'),
                'alias' => 'STRINGEE_NUMBER'
            ],
            'to' => [
                [
                    'type' => 'external',
                    'number' => '84' . $newPhoneNumber,
                    'alias' => 'TO_NUMBER'
                ]
            ],
            'answer_url' => env('ANSWER_URL'),
            'actions' => [
                [
                    'action' => 'talk',
                    'text' =>$message
                ]
            ]
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-STRINGEE-AUTH' => getAccessToken()
        ])->post(env('URL_CALL'), $options);

        if ($response->successful()) {
            return true;
        } else {
            return false;
        }
    }
    function sendMailOTP($phoneNumber)
    {
        $OTP = (string)rand(100000, 999999);

        $talkOTP = implode('... ', str_split($OTP));

        $newPhoneNumber = substr($phoneNumber, 1);

        $options = [
            'from' => [
                'type' => 'external',
                'number' => env('PHONE_NUMBER'),
                'alias' => 'STRINGEE_NUMBER'
            ],
            'to' => [
                [
                    'type' => 'external',
                    'number' => '84' . $newPhoneNumber,
                    'alias' => 'TO_NUMBER'
                ]
            ],
            'answer_url' => env('ANSWER_URL'),
            'actions' => [
                [
                    'action' => 'talk',
                    'text' => "Mã OTP của bạn là:..." . $talkOTP . "... Xin nhắc lại... Mã OTP của bạn là:..." . $talkOTP
                ]
            ]
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-STRINGEE-AUTH' => getAccessToken()
        ])->post(env('URL_CALL'), $options);

        if ($response->successful()) {
            return $OTP;
        } else {
            return false;
        }
    }
    function sendOTP($phoneNumber)
    {
        $OTP = (string)rand(100000, 999999);

        $talkOTP = implode('... ', str_split($OTP));

        $newPhoneNumber = substr($phoneNumber, 1);

        $options = [
            'from' => [
                'type' => 'external',
                'number' => env('PHONE_NUMBER'),
                'alias' => 'STRINGEE_NUMBER'
            ],
            'to' => [
                [
                    'type' => 'external',
                    'number' => '84' . $newPhoneNumber,
                    'alias' => 'TO_NUMBER'
                ]
            ],
            'answer_url' => env('ANSWER_URL'),
            'actions' => [
                [
                    'action' => 'talk',
                    'text' => "Mã OTP của bạn là:..." . $talkOTP . "... Xin nhắc lại... Mã OTP của bạn là:..." . $talkOTP
                ]
            ]
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-STRINGEE-AUTH' => getAccessToken()
        ])->post(env('URL_CALL'), $options);

        if ($response->successful()) {
            return $OTP;
        } else {
            return false;
        }
    }

    function execPostRequest($url, $data)
    {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt(
            $ch,
            CURLOPT_HTTPHEADER,
            array(
                'Content-Type: application/json',
                'Content-Length: ' . strlen($data)
            )
        );
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        $result = curl_exec($ch);
        curl_close($ch);

        $jsonResult = json_decode($result, true);
        return $jsonResult;
    }

    function generateOTPToken( $email, $password)
    {
        $payload = [
            'email' => $email,
            'password' => $password,
            'expiresIn' => time() + 300
        ];

        $otpToken = JWT::encode($payload, getenv('OTP_TOKEN_SECRET'), 'HS256');

        return $otpToken;
    }

    function checkValidImage($file)
    {
        if (!$file || !$file->isValid()) {
            return 'File does not exist.';
        }

        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

        $mimeType = $file->getMimeType();
        $extension = $file->getClientOriginalExtension();

        if (!in_array($mimeType, $allowedMimeTypes) || !in_array(strtolower($extension), $allowedExtensions)) {
            return 'The file must be jpg, jpeg, png or gif.';
        }

        return null;
    }

    function uploadImage($image, $nameFolder = null)
    {
        // Tạo tên mới cho ảnh
        $newName = time() . '_' . Str::slug(pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME)) . '.webp';
        $destinationPath = $nameFolder
            ? public_path('images/' . $nameFolder . '/')
            : public_path('images/');
        // Di chuyển ảnh vào thư mục đích
        $image->move($destinationPath, $newName);
        $fullPath = $destinationPath . $newName;
        $quality = 100;
        // Log dung lượng trước khi tối ưu hóa
        $sizeBefore = filesize($fullPath);
//        if ($sizeBefore > 2 * 1024 * 1024) { // Lớn hơn 2MB
//            $quality = 15;
//        } elseif ($sizeBefore > 1 * 1024 * 1024) { // Lớn hơn 1MB
//            $quality = 25;
//        }
//        \Log::info("Dung lượng trước khi tối ưu: {$sizeBefore} bytes (".($sizeBefore / 1024)." KB)");
        // Chuyển đổi sang WebP và giảm dung lượng
        exec("cwebp -q {$quality}  " . escapeshellarg($fullPath) . " -o " . escapeshellarg($fullPath));
        $sizeAfter = filesize($fullPath);
        $saveImage=\App\Models\ImageUpload::create([
            'image' => $newName,
            "size" => round($sizeAfter / 1024, 2),
            'status'=>1,
        ]);
//        \Log::info("Dung lượng sau khi tối ưu: {$sizeAfter} bytes (".($sizeAfter / 1024)." KB)");
        return $newName;
    }

    function checkSlug($title, $table, $id = null)
    {

        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;

        while (DB::table($table)->where('slug', $slug)->exists()) {

            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        return $slug;
    }

    function saveRefreshToken($refreshToken)
    {
        return response()->json([
            'message' => 'Token saved successfully.'
        ])->cookie('refreshToken', $refreshToken, 48 * 60 * 60, null, null, false, true);
    }

    function generateAccessRefreshToken($user)
    {
        $accessToken = JWT::encode(['id' => $user->id, 'role' => (int)$user->role, 'exp' => time() + 300], env('ACCESS_TOKEN_SECRET'), 'HS256');
        $refreshToken = JWT::encode(['id' => $user->id, 'role' => (int)$user->role,'exp' => time() + 7 * 24 * 60 * 60], env('REFRESH_TOKEN_SECRET'), 'HS256');

        return [
            'accessToken' =>
                [
                    'token' => $accessToken,
                    'expires' => time() + 60
                ],
            'refreshToken' =>
                [
                    'token' => $refreshToken,
                    'expires' => time() + (7 * 24 * 60 * 60)
                ]
        ];
    }

    ;

    function searchInTable($table, $keyword)
    {
        $columns = DB::getSchemaBuilder()->getColumnListing($table);
        $query = DB::table($table);
        foreach ($columns as $column) {
            $query->orWhere($column, 'LIKE', '%' . $keyword . '%');
        }
        return $query->get();
    }

    ;
    function isValidMongoId($id)
    {
        return preg_match('/^[0-9a-fA-F]{24}$/', $id);
    }

    function createError($code = 500, $message = "Error", $errors = [])
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
            'data' => null,
            'errors' => $errors,
        ], $code);
    }

    function checkPhoneAndEmail($phone = null, $email = null, $userId = null)
    {

        if (!$phone && !$email) {
            createError(500, 'Không được trống số điện thoại và email');
        }
        if($phone){
            if (!preg_match('/^0[2-9]{1}[0-9]{8}$/', $phone)) {
                createError(422, 'Số điện thoại không hợp lệ');
            }
        }

        if ($userId) {
            $user = User::find($userId);
            if (!$user) {
                return 'Không tìm thấy tài khoản';
            }
            if ($phone && $user->phone != $phone) {
                $userPhone = User::where('phone', $phone)->where('id','!=',$userId)->first();
                if ($userPhone) {
                    return 'Số điện thoại đã được đăng ký';
                }
            }
            if ($email && $user && $user->email != $email) {
                $userMail = User::where('email', $email)->where('id','!=',$userId)->first();
                if ($userMail) {
                    return 'Email đã được đăng ký';
                }
            }
            return null;
        } else {
            if ($phone) {
                $user = User::where('phone', $phone)->first();
                if ($user) {
                    return 'Số điện thoại đã được đăng ký';
                }
            }
            if ($email) {
                $user = User::where('email', $email)->first();
                if ($user) {
                    return 'Email đã được đăng ký';
                }
            }
        }
    }
}
