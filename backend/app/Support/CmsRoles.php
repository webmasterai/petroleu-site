<?php

namespace App\Support;

class CmsRoles
{
    public const SUPER_ADMIN = 'super_admin';

    public const ADMINISTRATOR = 'administrator';

    public const EDITOR = 'editor';

    public const TRANSLATOR = 'translator';

    public const VIEWER = 'viewer';

    /** Legacy role treated as Super Admin */
    public const LEGACY_ADMIN = 'cms_admin';

    public static function all(): array
    {
        return [
            self::SUPER_ADMIN,
            self::ADMINISTRATOR,
            self::EDITOR,
            self::TRANSLATOR,
            self::VIEWER,
        ];
    }

    public static function normalize(?string $role): string
    {
        if ($role === self::LEGACY_ADMIN || $role === null || $role === '') {
            return self::SUPER_ADMIN;
        }

        return $role;
    }

    public static function isCmsUser(?string $role): bool
    {
        $role = self::normalize($role);

        return in_array($role, self::all(), true);
    }

    public static function canManageUsers(?string $role): bool
    {
        return self::normalize($role) === self::SUPER_ADMIN;
    }

    public static function canPublish(?string $role): bool
    {
        return in_array(self::normalize($role), [
            self::SUPER_ADMIN,
            self::ADMINISTRATOR,
            self::EDITOR,
        ], true);
    }

    public static function canWrite(?string $role): bool
    {
        return in_array(self::normalize($role), [
            self::SUPER_ADMIN,
            self::ADMINISTRATOR,
            self::EDITOR,
            self::TRANSLATOR,
        ], true);
    }

    public static function rank(?string $role): int
    {
        return match (self::normalize($role)) {
            self::SUPER_ADMIN => 100,
            self::ADMINISTRATOR => 80,
            self::EDITOR => 60,
            self::TRANSLATOR => 40,
            self::VIEWER => 20,
            default => 0,
        };
    }
}
