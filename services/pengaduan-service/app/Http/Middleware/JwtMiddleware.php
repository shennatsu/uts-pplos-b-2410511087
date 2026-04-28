<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['message' => 'Token tidak ada'], 401);
        }

        $token = substr($authHeader, 7);

        try {
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
            $request->merge(['auth_user' => (array) $decoded]);
        } catch (Exception $e) {
            return response()->json(['message' => 'Token tidak valid atau expired'], 401);
        }

        return $next($request);
    }
}