<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cms_sections', function (Blueprint $table) {
            $table->softDeletes();
            $table->string('frontend_path')->nullable()->after('page_slug');
            $table->string('translation_status', 32)->nullable()->after('status'); // ready|translation_required|review
        });

        Schema::table('cms_pages', function (Blueprint $table) {
            $table->softDeletes();
            $table->string('frontend_path')->nullable()->after('slug');
            $table->unsignedInteger('sort_order')->default(0)->after('template');
            $table->string('translation_status', 32)->nullable()->after('status');
        });

        Schema::table('cms_blog_posts', function (Blueprint $table) {
            $table->softDeletes();
            $table->json('tags')->nullable()->after('author');
            $table->json('related_slugs')->nullable()->after('tags');
            $table->string('seo_title')->nullable()->after('related_slugs');
            $table->text('seo_description')->nullable()->after('seo_title');
            $table->string('canonical_url')->nullable()->after('seo_description');
            $table->string('og_image')->nullable()->after('canonical_url');
            $table->string('media_type', 32)->nullable()->after('og_image');
            $table->string('video_url')->nullable()->after('media_type');
            $table->string('duration', 16)->nullable()->after('video_url');
            $table->boolean('show_on_homepage')->default(false)->after('duration');
            $table->string('translation_status', 32)->nullable()->after('status');
        });

        Schema::table('cms_navigation_items', function (Blueprint $table) {
            $table->softDeletes();
            $table->string('menu_group', 64)->nullable()->after('location'); // primary|resources|mega|footer|announcement
        });

        Schema::table('cms_media', function (Blueprint $table) {
            $table->softDeletes();
            $table->string('locale_code', 16)->nullable()->after('market_code');
            $table->string('source', 32)->default('upload')->after('locale_code'); // upload|imported
        });
    }

    public function down(): void
    {
        Schema::table('cms_media', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['locale_code', 'source']);
        });
        Schema::table('cms_navigation_items', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn('menu_group');
        });
        Schema::table('cms_blog_posts', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn([
                'tags', 'related_slugs', 'seo_title', 'seo_description', 'canonical_url',
                'og_image', 'media_type', 'video_url', 'duration', 'show_on_homepage', 'translation_status',
            ]);
        });
        Schema::table('cms_pages', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['frontend_path', 'sort_order', 'translation_status']);
        });
        Schema::table('cms_sections', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['frontend_path', 'translation_status']);
        });
    }
};
