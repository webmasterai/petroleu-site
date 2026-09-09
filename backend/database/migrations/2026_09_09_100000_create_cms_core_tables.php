<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('cms_admin')->after('password');
            $table->boolean('is_active')->default(true)->after('role');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
        });

        Schema::create('cms_markets', function (Blueprint $table) {
            $table->id();
            $table->string('code', 16)->unique();
            $table->string('name');
            $table->string('default_locale', 16);
            $table->string('currency', 8)->nullable();
            $table->string('phone')->nullable();
            $table->string('phone_tel')->nullable();
            $table->string('whatsapp')->nullable();
            $table->string('email')->nullable();
            $table->string('sales_email')->nullable();
            $table->string('support_email')->nullable();
            $table->text('address')->nullable();
            $table->string('inquiry_recipients')->nullable();
            $table->string('form_source')->nullable();
            $table->json('social_links')->nullable();
            $table->json('regional_settings')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_shared')->default(false);
            $table->timestamps();
        });

        Schema::create('cms_locales', function (Blueprint $table) {
            $table->id();
            $table->string('code', 16)->unique();
            $table->string('name');
            $table->string('native_name')->nullable();
            $table->string('dir', 3)->default('ltr');
            $table->string('font_stack')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('cms_market_locale', function (Blueprint $table) {
            $table->id();
            $table->string('market_code', 16);
            $table->string('locale_code', 16);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->unique(['market_code', 'locale_code']);
            $table->foreign('market_code')->references('code')->on('cms_markets')->cascadeOnDelete();
            $table->foreign('locale_code')->references('code')->on('cms_locales')->cascadeOnDelete();
        });

        Schema::create('cms_media', function (Blueprint $table) {
            $table->id();
            $table->string('market_code', 16)->nullable()->index();
            $table->string('disk')->default('public');
            $table->string('path');
            $table->string('url');
            $table->string('original_name')->nullable();
            $table->string('mime_type', 128)->nullable();
            $table->unsignedBigInteger('size')->default(0);
            $table->string('alt_text')->nullable();
            $table->string('title')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('cms_pages', function (Blueprint $table) {
            $table->id();
            $table->string('market_code', 16)->index();
            $table->string('locale_code', 16)->index();
            $table->string('slug');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('template')->default('default');
            $table->boolean('is_enabled')->default(true);
            $table->string('status', 20)->default('draft'); // draft|published
            $table->boolean('is_shared')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->unique(['market_code', 'locale_code', 'slug']);
        });

        Schema::create('cms_sections', function (Blueprint $table) {
            $table->id();
            $table->string('market_code', 16)->index();
            $table->string('locale_code', 16)->index();
            $table->string('page_slug')->index();
            $table->string('section_key')->index();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->longText('content')->nullable();
            $table->json('data')->nullable();
            $table->string('image_url')->nullable();
            $table->string('image_alt')->nullable();
            $table->foreignId('media_id')->nullable()->constrained('cms_media')->nullOnDelete();
            $table->string('link_label')->nullable();
            $table->string('link_url')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_enabled')->default(true);
            $table->string('status', 20)->default('draft');
            $table->boolean('is_shared')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->index(['market_code', 'locale_code', 'page_slug', 'section_key'], 'cms_sections_lookup_idx');
        });

        Schema::create('cms_navigation_items', function (Blueprint $table) {
            $table->id();
            $table->string('market_code', 16)->index();
            $table->string('locale_code', 16)->index();
            $table->string('location'); // header|footer|mega
            $table->string('label');
            $table->string('url')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable()->index();
            $table->json('children_data')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_enabled')->default(true);
            $table->string('status', 20)->default('draft');
            $table->boolean('is_shared')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('cms_settings', function (Blueprint $table) {
            $table->id();
            $table->string('market_code', 16)->index();
            $table->string('locale_code', 16)->nullable()->index();
            $table->string('key');
            $table->text('value')->nullable();
            $table->string('type')->default('text');
            $table->string('label')->nullable();
            $table->string('grp')->default('general');
            $table->boolean('is_shared')->default(false);
            $table->timestamps();
            $table->unique(['market_code', 'locale_code', 'key'], 'cms_settings_unique');
        });

        Schema::create('cms_seo_entries', function (Blueprint $table) {
            $table->id();
            $table->string('market_code', 16)->index();
            $table->string('locale_code', 16)->index();
            $table->string('path');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('keywords')->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('og_title')->nullable();
            $table->text('og_description')->nullable();
            $table->string('og_image')->nullable();
            $table->string('og_locale')->nullable();
            $table->boolean('noindex')->default(false);
            $table->json('hreflang')->nullable();
            $table->string('status', 20)->default('draft');
            $table->boolean('is_shared')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->unique(['market_code', 'locale_code', 'path'], 'cms_seo_unique');
        });

        Schema::create('cms_blog_categories', function (Blueprint $table) {
            $table->id();
            $table->string('market_code', 16)->index();
            $table->string('locale_code', 16)->index();
            $table->string('slug');
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_enabled')->default(true);
            $table->string('status', 20)->default('draft');
            $table->boolean('is_shared')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->unique(['market_code', 'locale_code', 'slug']);
        });

        Schema::create('cms_blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('market_code', 16)->index();
            $table->string('locale_code', 16)->index();
            $table->string('slug');
            $table->string('title');
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->string('image_url')->nullable();
            $table->string('image_alt')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('cms_blog_categories')->nullOnDelete();
            $table->string('author')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_enabled')->default(true);
            $table->string('status', 20)->default('draft');
            $table->boolean('is_shared')->default(false);
            $table->boolean('noindex')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->unique(['market_code', 'locale_code', 'slug']);
        });

        Schema::create('cms_inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('type', 32)->default('contact'); // contact|demo
            $table->string('market_code', 16)->nullable()->index();
            $table->string('locale_code', 16)->nullable()->index();
            $table->string('source')->default('website');
            $table->string('full_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('stations')->nullable();
            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->string('fuel_brand')->nullable();
            $table->text('message')->nullable();
            $table->string('status', 32)->default('new');
            $table->text('admin_notes')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_inquiries');
        Schema::dropIfExists('cms_blog_posts');
        Schema::dropIfExists('cms_blog_categories');
        Schema::dropIfExists('cms_seo_entries');
        Schema::dropIfExists('cms_settings');
        Schema::dropIfExists('cms_navigation_items');
        Schema::dropIfExists('cms_sections');
        Schema::dropIfExists('cms_pages');
        Schema::dropIfExists('cms_media');
        Schema::dropIfExists('cms_market_locale');
        Schema::dropIfExists('cms_locales');
        Schema::dropIfExists('cms_markets');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'is_active', 'last_login_at']);
        });
    }
};
