<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\CmsRoles;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    use ApiResponse;

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $key = 'cms-login:'.strtolower($data['email']).'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            return $this->error('Too many login attempts. Try again in '.$seconds.' seconds.', 429);
        }

        $user = User::where('email', $data['email'])->first();

        if (
            ! $user
            || ! Hash::check($data['password'], $user->password)
            || ! $user->is_active
            || ! CmsRoles::isCmsUser($user->role)
        ) {
            RateLimiter::hit($key, 60);

            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        RateLimiter::clear($key);
        $user->last_login_at = now();
        $user->save();

        $token = $user->createToken('cms-admin')->plainTextToken;

        return $this->success([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => CmsRoles::normalize($user->role),
                'assigned_markets' => $user->assigned_markets,
                'assigned_locales' => $user->assigned_locales,
            ],
        ], 'Logged in');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return $this->success(null, 'Logged out');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->success([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => CmsRoles::normalize($user->role),
            'assigned_markets' => $user->assigned_markets,
            'assigned_locales' => $user->assigned_locales,
            'password_changed_at' => $user->password_changed_at,
        ]);
    }
}
