<?php

namespace App\Http\Middleware;

use App\Models\RevokedToken;
use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckToken
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $accessToken = $request->bearerToken();

        if (!$accessToken) {
            return createError(403, 'No access token found.');
        }
        try{
            $verifiedUser = JWT::decode($accessToken, new Key(env('ACCESS_TOKEN_SECRET'), 'HS256'));
        }catch(\Exception $e){
            return response()->json(['error' => 'Token hết hạn.'], 401);
        }

        $request->merge(['id' => $verifiedUser->id]);

        return $next($request);
    }
}
