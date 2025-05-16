<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Permission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next,...$permissions): Response
    {
        $jwtAuth = $request->jwtAuth;

        // Kiểm tra nếu user chưa đăng nhập
        if (!$jwtAuth) {
            abort(401, 'Unauthorized.');
        }

        $hasPermission = false;
//        Mảng các id của các quyền đang có
        $roles=[
            'admin'=>1,
            'client'=>0,
            'view'=>3,
            'manage'=>2,
        ];
        $roleValuesToCheck = array_map(function ($role) use ($roles) {
            return $roles[$role] ?? null;
        }, $permissions);
        if (!in_array($jwtAuth['role'], $roleValuesToCheck)) {
            return response()->json(['error' => 'Không có quyền thực hiện.'], 403);
        }

        return $next($request);
    }
}
