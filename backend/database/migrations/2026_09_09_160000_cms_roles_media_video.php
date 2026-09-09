<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'assigned_markets')) {
                $table->json('assigned_markets')->nullable()->after('role');
            }
            if (! Schema::hasColumn('users', 'assigned_locales')) {
                $table->json('assigned_locales')->nullable()->after('assigned_markets');
            }
            if (! Schema::hasColumn('users', 'password_changed_at')) {
                $table->timestamp('password_changed_at')->nullable()->after('password');
            }
        });

        Schema::table('cms_media', function (Blueprint $table) {
            if (! Schema::hasColumn('cms_media', 'media_kind')) {
                $table->string('media_kind', 16)->default('image')->after('mime_type');
            }
            if (! Schema::hasColumn('cms_media', 'width')) {
                $table->unsignedInteger('width')->nullable()->after('size');
            }
            if (! Schema::hasColumn('cms_media', 'height')) {
                $table->unsignedInteger('height')->nullable()->after('width');
            }
            if (! Schema::hasColumn('cms_media', 'duration_seconds')) {
                $table->unsignedInteger('duration_seconds')->nullable()->after('height');
            }
            if (! Schema::hasColumn('cms_media', 'caption')) {
                $table->string('caption', 500)->nullable()->after('alt_text');
            }
            if (! Schema::hasColumn('cms_media', 'poster_url')) {
                $table->string('poster_url', 500)->nullable()->after('caption');
            }
        });

        // Legacy cms_admin → super_admin
        DB::table('users')->where('role', 'cms_admin')->update(['role' => 'super_admin']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            foreach (['assigned_markets', 'assigned_locales', 'password_changed_at'] as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        Schema::table('cms_media', function (Blueprint $table) {
            foreach (['media_kind', 'width', 'height', 'duration_seconds', 'caption', 'poster_url'] as $col) {
                if (Schema::hasColumn('cms_media', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
