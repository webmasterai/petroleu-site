<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\CmsRoles;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AdminUsersController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        if (! CmsRoles::canManageUsers($request->user()->role)) {
            return $this->error('Forbidden', 403);
        }

        $users = User::query()
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'is_active', 'assigned_markets', 'assigned_locales', 'last_login_at', 'password_changed_at', 'created_at', 'updated_at']);

        return $this->success($users->map(fn (User $u) => $this->serialize($u)));
    }

    public function store(Request $request): JsonResponse
    {
        if (! CmsRoles::canManageUsers($request->user()->role)) {
            return $this->error('Forbidden', 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', PasswordRule::min(10)->mixedCase()->numbers()],
            'role' => 'required|in:'.implode(',', CmsRoles::all()),
            'is_active' => 'boolean',
            'assigned_markets' => 'nullable|array',
            'assigned_locales' => 'nullable|array',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $data['role'],
            'is_active' => $data['is_active'] ?? true,
            'assigned_markets' => $data['assigned_markets'] ?? null,
            'assigned_locales' => $data['assigned_locales'] ?? null,
            'password_changed_at' => now(),
        ]);

        return $this->success($this->serialize($user), 'Created', 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        if (! CmsRoles::canManageUsers($request->user()->role)) {
            return $this->error('Forbidden', 403);
        }

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,'.$user->id,
            'role' => 'sometimes|in:'.implode(',', CmsRoles::all()),
            'is_active' => 'boolean',
            'assigned_markets' => 'nullable|array',
            'assigned_locales' => 'nullable|array',
            'password' => ['nullable', 'confirmed', PasswordRule::min(10)->mixedCase()->numbers()],
        ]);

        if (isset($data['role']) || (array_key_exists('is_active', $data) && ! $data['is_active'])) {
            $wouldBeRole = $data['role'] ?? $user->role;
            $wouldBeActive = array_key_exists('is_active', $data) ? (bool) $data['is_active'] : (bool) $user->is_active;
            if (CmsRoles::normalize($user->role) === CmsRoles::SUPER_ADMIN && (! $wouldBeActive || CmsRoles::normalize($wouldBeRole) !== CmsRoles::SUPER_ADMIN)) {
                $otherSuper = User::query()
                    ->where('id', '!=', $user->id)
                    ->where('is_active', true)
                    ->whereIn('role', [CmsRoles::SUPER_ADMIN, CmsRoles::LEGACY_ADMIN])
                    ->count();
                if ($otherSuper < 1) {
                    return $this->error('Cannot remove or deactivate the final Super Admin.', 422);
                }
            }
        }

        if (! empty($data['password'])) {
            $user->password = $data['password'];
            $user->password_changed_at = now();
            $user->tokens()->delete();
            unset($data['password']);
        }

        $user->fill($data);
        $user->save();

        return $this->success($this->serialize($user->fresh()));
    }

    public function changePassword(Request $request): JsonResponse
    {
        $key = 'cms-pw-change:'.$request->user()->id.'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return $this->error('Too many attempts. Try again later.', 429);
        }

        $data = $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', PasswordRule::min(10)->mixedCase()->numbers()],
        ]);

        $user = $request->user();
        if (! Hash::check($data['current_password'], $user->password)) {
            RateLimiter::hit($key, 60);
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        RateLimiter::clear($key);
        $user->password = $data['password'];
        $user->password_changed_at = now();
        $user->save();

        // Invalidate other sessions; keep the current personal access token when present
        $current = $user->currentAccessToken();
        $keepId = ($current instanceof \Laravel\Sanctum\PersonalAccessToken) ? $current->id : null;
        $query = $user->tokens();
        if ($keepId) {
            $query->where('id', '!=', $keepId)->delete();
        } else {
            $query->delete();
        }

        return $this->success([
            'password_changed_at' => $user->password_changed_at,
        ], 'Password updated');
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $key = 'cms-pw-forgot:'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return $this->error('Too many attempts. Try again later.', 429);
        }
        RateLimiter::hit($key, 60);

        $data = $request->validate(['email' => 'required|email']);

        // Always return success to avoid email enumeration; only send if configured & user exists
        $user = User::where('email', $data['email'])->where('is_active', true)->first();
        if ($user && CmsRoles::isCmsUser($user->role) && config('mail.default') && config('mail.default') !== 'array') {
            Password::broker()->sendResetLink(['email' => $user->email]);
        }

        return $this->success(null, 'If that account exists and mail is configured, a reset link was sent.');
    }

    public function adminResetLink(Request $request, User $user): JsonResponse
    {
        if (! CmsRoles::canManageUsers($request->user()->role)) {
            return $this->error('Forbidden', 403);
        }

        $token = Password::broker()->createToken($user);

        return $this->success([
            'email' => $user->email,
            'reset_token' => $token,
            'note' => 'Single-use token. Deliver out-of-band. Never store passwords.',
        ], 'Reset token created');
    }

    protected function serialize(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => CmsRoles::normalize($user->role),
            'is_active' => (bool) $user->is_active,
            'assigned_markets' => $user->assigned_markets,
            'assigned_locales' => $user->assigned_locales,
            'last_login_at' => $user->last_login_at,
            'password_changed_at' => $user->password_changed_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }
}
