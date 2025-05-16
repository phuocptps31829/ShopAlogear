<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtAuthenticate
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $accessToken = $request->bearerToken();
        if (!$accessToken) {
            return createError(401, 'accessToken token not found.');
        }

        try {
            $verifiedUser = JWT::decode($accessToken, new Key(env('ACCESS_TOKEN_SECRET'), 'HS256'));
        }catch (\Exception $e){
            return createError(401, 'Invalid access token.');
        }

        $request->merge(['jwtAuth' =>get_object_vars($verifiedUser)]);
           return $next($request);
    }
}
