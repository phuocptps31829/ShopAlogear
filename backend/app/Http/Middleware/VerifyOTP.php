<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\RevokedToken;
use App\Models\OTP;
use Firebase\JWT\Key;
use Firebase\JWT\JWT;
use Firebase\JWT\ExpiredException;
use Illuminate\Support\Facades\Hash;
use Exception;

class VerifyOTP
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $otpToken = $request->otpToken;
        $OTP = $request->OTP;

        if (!$otpToken || !$OTP) {
            return createError(403, 'Thiếu token hoặc OTP.');
        }
        try {
            $revokedToken = RevokedToken::where('token', $otpToken)->first();

            if ($revokedToken) {
                return createError(401, 'Token đã hết hạn.');
            }
            $verifiedToken  = JWT::decode($otpToken, new Key(env('OTP_TOKEN_SECRET'), 'HS256'));
            $email = $verifiedToken->email;
            $password = $verifiedToken->password;

            $otpHolder = OTP::where('email', $email)->get();

            if ((time()) > (int)$verifiedToken->expiresIn) {
                return createError(401, 'Token hết hạn!.');
            }

            $lastOTP = $otpHolder->last();
            if (!Hash::check($OTP, $lastOTP->otp)) {
                return createError(403, 'OTP không đúng.');

            }
            $revokedToken =   RevokedToken::create(['token' => $otpToken]);

            $request->merge([
                'newUser' => [
                    'password' => $password,
                    'email' => $email,
                ]
            ]);

            return $next($request);
        } catch (ExpiredException $e) {
            return createError(401, 'Token đã hết hạn.');
        } catch (Exception $e) {
                return handleException($e);
            }

    }
}
