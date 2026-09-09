<?php

use App\Http\Controllers\Api\Cms\AdminAuthController;
use App\Http\Controllers\Api\Cms\AdminCmsController;
use App\Http\Controllers\Api\Cms\AdminUsersController;
use App\Http\Controllers\Api\Cms\PublicCmsController;
use App\Http\Middleware\EnsureCmsAdmin;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['success' => true, 'message' => 'ok']));

Route::prefix('cms')->group(function () {
    $public = PublicCmsController::class;

    Route::get('/markets', [$public, 'markets']);
    Route::get('/hero/{page}', [$public, 'hero']);
    Route::get('/features', [$public, 'features']);
    Route::get('/logos', [$public, 'logos']);
    Route::get('/testimonials', [$public, 'testimonials']);
    Route::get('/pricing', [$public, 'pricing']);
    Route::get('/faq', [$public, 'faq']);
    Route::get('/faqs', [$public, 'faq']);
    Route::get('/stats', [$public, 'stats']);
    Route::get('/team', [$public, 'team']);
    Route::get('/cta/{page}', [$public, 'cta']);
    Route::get('/settings', [$public, 'siteSettings']);
    Route::get('/mission-values', [$public, 'missionValues']);
    Route::get('/how-it-works', [$public, 'howItWorks']);
    Route::get('/company-story', [$public, 'companyStory']);
    Route::get('/industries', [$public, 'industries']);
    Route::get('/mobile-features', [$public, 'mobileFeatures']);
    Route::get('/analytics-cards', [$public, 'analyticsCards']);
    Route::get('/why-choose-reasons', [$public, 'whyChooseReasons']);
    Route::get('/supported-brands', [$public, 'supportedBrands']);
    Route::get('/section-heading/{key}', [$public, 'sectionHeading']);
    Route::get('/demo-block/{key}', [$public, 'demoBlock']);
    Route::get('/page-cards/{page}', [$public, 'pageCards']);
    Route::get('/legal-pages/{slug}', [$public, 'legalPage']);
    Route::get('/navigation', [$public, 'navigation']);
    Route::get('/seo', [$public, 'seo']);
    Route::get('/blog', [$public, 'blogIndex']);
    Route::get('/blog/{slug}', [$public, 'blogShow']);
    Route::post('/contact', [$public, 'contact']);
    Route::post('/demo-request', [$public, 'demoRequest']);
    Route::get('/draft-preview', [$public, 'draftPreview'])->name('cms.draft-preview');

    Route::prefix('admin')->group(function () {
        Route::post('/login', [AdminAuthController::class, 'login'])->middleware('throttle:5,1');
        Route::post('/forgot-password', [AdminUsersController::class, 'forgotPassword'])->middleware('throttle:5,1');

        Route::middleware(['auth:sanctum', EnsureCmsAdmin::class])->group(function () {
            $admin = AdminCmsController::class;
            $users = AdminUsersController::class;

            Route::post('/logout', [AdminAuthController::class, 'logout']);
            Route::get('/me', [AdminAuthController::class, 'me']);
            Route::post('/change-password', [$users, 'changePassword'])->middleware('throttle:5,1');
            Route::get('/dashboard', [$admin, 'dashboard']);

            Route::get('/users', [$users, 'index']);
            Route::post('/users', [$users, 'store']);
            Route::put('/users/{user}', [$users, 'update']);
            Route::post('/users/{user}/reset-link', [$users, 'adminResetLink']);

            Route::get('/markets', [$admin, 'marketsIndex']);
            Route::post('/markets', [$admin, 'marketsStore']);
            Route::put('/markets/{market}', [$admin, 'marketsUpdate']);

            Route::get('/locales', [$admin, 'localesIndex']);
            Route::post('/locales', [$admin, 'localesStore']);

            Route::get('/pages', [$admin, 'pagesIndex']);
            Route::post('/pages', [$admin, 'pagesStore']);
            Route::put('/pages/{page}', [$admin, 'pagesUpdate']);
            Route::delete('/pages/{page}', [$admin, 'pagesDestroy']);
            Route::post('/pages/{page}/restore', [$admin, 'pagesRestore']);
            Route::get('/pages/{page}/dependencies', [$admin, 'pagesDependencies']);

            Route::get('/sections', [$admin, 'sectionsIndex']);
            Route::post('/sections', [$admin, 'sectionsStore']);
            Route::put('/sections/{section}', [$admin, 'sectionsUpdate']);
            Route::delete('/sections/{section}', [$admin, 'sectionsDestroy']);
            Route::post('/sections/{section}/publish', [$admin, 'sectionsPublish']);
            Route::post('/sections/{section}/unpublish', [$admin, 'sectionsUnpublish']);
            Route::post('/sections/{section}/duplicate', [$admin, 'sectionsDuplicate']);
            Route::post('/sections/{section}/restore', [$admin, 'sectionsRestore']);
            Route::post('/sections/reorder', [$admin, 'sectionsReorder']);
            Route::get('/sections/{section}/preview', [$admin, 'sectionsPreview']);
            Route::post('/preview/signed', [$admin, 'signedPreview']);

            Route::get('/navigation', [$admin, 'navigationIndex']);
            Route::post('/navigation', [$admin, 'navigationStore']);
            Route::put('/navigation/{item}', [$admin, 'navigationUpdate']);
            Route::delete('/navigation/{item}', [$admin, 'navigationDestroy']);

            Route::get('/settings', [$admin, 'settingsIndex']);
            Route::post('/settings', [$admin, 'settingsUpsert']);

            Route::get('/seo', [$admin, 'seoIndex']);
            Route::post('/seo', [$admin, 'seoUpsert']);

            Route::get('/blog/categories', [$admin, 'blogCategoriesIndex']);
            Route::post('/blog/categories', [$admin, 'blogCategoriesStore']);
            Route::get('/blog/posts', [$admin, 'blogPostsIndex']);
            Route::post('/blog/posts', [$admin, 'blogPostsStore']);
            Route::put('/blog/posts/{post}', [$admin, 'blogPostsUpdate']);
            Route::delete('/blog/posts/{post}', [$admin, 'blogPostsDestroy']);

            Route::get('/media', [$admin, 'mediaIndex']);
            Route::post('/media', [$admin, 'mediaUpload']);
            Route::put('/media/{media}', [$admin, 'mediaUpdate']);
            Route::delete('/media/{media}', [$admin, 'mediaDestroy']);

            Route::get('/inquiries', [$admin, 'inquiriesIndex']);
            Route::get('/inquiries/{inquiry}', [$admin, 'inquiriesShow']);
            Route::put('/inquiries/{inquiry}', [$admin, 'inquiriesUpdate']);
        });
    });
});
