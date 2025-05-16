<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\RevokedToken;
use App\Models\Otp;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

use Firebase\JWT\ExpiredException;
use Illuminate\Support\Facades\Hash;
use Exception;
use stdClass;

class VerifyRefreshToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $refreshToken = $request->refreshToken;

            if (!$refreshToken) {
                return createError(403, 'No refresh token found.');
            }
            $revokedToken = RevokedToken::where('token', $refreshToken)->first();

            if ($revokedToken) {
                return createError(403, 'Refresh token is expired');
            }

            $verifiedUser = JWT::decode($refreshToken, new Key(env('REFRESH_TOKEN_SECRET'), 'HS256'));

            if (!$verifiedUser) {
                return response()->json(['error' => 'Invalid refresh token.'], 403);
            }

            $removeToken = RevokedToken::create([
                'token' => $refreshToken
            ]);

            $request->merge(['id' => $verifiedUser->id]);

            return $next($request);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred: ' . $e->getMessage()], 500);
        }
    }
}
