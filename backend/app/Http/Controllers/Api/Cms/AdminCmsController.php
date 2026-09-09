<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Cms\CmsBlogCategory;
use App\Models\Cms\CmsBlogPost;
use App\Models\Cms\CmsInquiry;
use App\Models\Cms\CmsLocale;
use App\Models\Cms\CmsMarket;
use App\Models\Cms\CmsMedia;
use App\Models\Cms\CmsNavigationItem;
use App\Models\Cms\CmsPage;
use App\Models\Cms\CmsSection;
use App\Models\Cms\CmsSeoEntry;
use App\Models\Cms\CmsSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminCmsController extends Controller
{
    use ApiResponse;

    public function dashboard(Request $request): JsonResponse
    {
        $market = $request->query('market');
        $locale = $request->query('locale');
        $all = $request->boolean('all');

        $sections = CmsSection::query();
        $pages = CmsPage::query();
        $media = CmsMedia::query();
        $posts = CmsBlogPost::query();
        $inquiries = CmsInquiry::query();

        if (! $all && $market) {
            $sections->where('market_code', $market);
            $pages->where('market_code', $market);
            $media->where(function ($q) use ($market) {
                $q->where('market_code', $market)->orWhereNull('market_code');
            });
            $posts->where('market_code', $market);
            $inquiries->where('market_code', $market);
        }
        if (! $all && $locale) {
            $sections->where('locale_code', $locale);
            $pages->where('locale_code', $locale);
            $posts->where('locale_code', $locale);
        }

        return $this->success([
            'scope' => $all ? 'all' : ['market' => $market, 'locale' => $locale],
            'markets' => CmsMarket::count(),
            'pages' => (clone $pages)->count(),
            'sections' => (clone $sections)->count(),
            'published_sections' => (clone $sections)->where('status', 'published')->count(),
            'draft_sections' => (clone $sections)->where('status', 'draft')->count(),
            'needs_review_sections' => (clone $sections)->where('translation_status', 'needs_review')->count(),
            'media' => (clone $media)->count(),
            'inquiries_new' => (clone $inquiries)->where('status', 'new')->count(),
            'blog_posts' => (clone $posts)->count(),
        ]);
    }

    // ── Markets / Locales ─────────────────────────────────────────────

    public function marketsIndex(): JsonResponse
    {
        return $this->success(CmsMarket::orderBy('code')->get());
    }

    public function marketsStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => 'required|string|max:16|unique:cms_markets,code',
            'name' => 'required|string|max:255',
            'default_locale' => 'required|string|max:16',
            'currency' => 'nullable|string|max:8',
            'phone' => 'nullable|string|max:64',
            'phone_tel' => 'nullable|string|max:64',
            'whatsapp' => 'nullable|string|max:64',
            'email' => 'nullable|email',
            'sales_email' => 'nullable|email',
            'support_email' => 'nullable|email',
            'address' => 'nullable|string',
            'inquiry_recipients' => 'nullable|string',
            'form_source' => 'nullable|string|max:64',
            'social_links' => 'nullable|array',
            'regional_settings' => 'nullable|array',
            'is_active' => 'boolean',
            'is_shared' => 'boolean',
        ]);

        return $this->success(CmsMarket::create($data), 'Created', 201);
    }

    public function marketsUpdate(Request $request, CmsMarket $market): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'default_locale' => 'sometimes|string|max:16',
            'currency' => 'nullable|string|max:8',
            'phone' => 'nullable|string|max:64',
            'phone_tel' => 'nullable|string|max:64',
            'whatsapp' => 'nullable|string|max:64',
            'email' => 'nullable|email',
            'sales_email' => 'nullable|email',
            'support_email' => 'nullable|email',
            'address' => 'nullable|string',
            'inquiry_recipients' => 'nullable|string',
            'form_source' => 'nullable|string|max:64',
            'social_links' => 'nullable|array',
            'regional_settings' => 'nullable|array',
            'is_active' => 'boolean',
            'is_shared' => 'boolean',
        ]);
        $market->update($data);

        return $this->success($market->fresh());
    }

    public function localesIndex(): JsonResponse
    {
        return $this->success(CmsLocale::orderBy('code')->get());
    }

    public function localesStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => 'required|string|max:16|unique:cms_locales,code',
            'name' => 'required|string|max:255',
            'native_name' => 'nullable|string|max:255',
            'dir' => 'required|in:ltr,rtl',
            'font_stack' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        return $this->success(CmsLocale::create($data), 'Created', 201);
    }

    // ── Pages / Sections ──────────────────────────────────────────────

    public function pagesIndex(Request $request): JsonResponse
    {
        $q = CmsPage::query()->orderBy('slug');
        if ($request->market) {
            $q->where('market_code', $request->market);
        }
        if ($request->locale && ! $request->boolean('group')) {
            $q->where('locale_code', $request->locale);
        }
        if ($request->filled('q')) {
            $term = '%'.$request->query('q').'%';
            $q->where(function ($inner) use ($term) {
                $inner->where('slug', 'like', $term)->orWhere('title', 'like', $term);
            });
        }
        if ($request->filled('status')) {
            $q->where('status', $request->query('status'));
        }

        $rows = $q->get();

        if ($request->boolean('group')) {
            $grouped = $rows->groupBy(fn ($p) => ($p->market_code ?: 'shared').'|'.$p->slug)->map(function ($items) {
                $first = $items->first();
                $translations = $items->map(fn ($p) => [
                    'id' => $p->id,
                    'locale_code' => $p->locale_code,
                    'title' => $p->title,
                    'status' => $p->status,
                    'translation_status' => $p->translation_status,
                    'frontend_path' => $p->frontend_path,
                ])->values();

                return [
                    'id' => $first->id,
                    'logical_key' => ($first->market_code ?: 'shared').'|'.$first->slug,
                    'market_code' => $first->market_code,
                    'slug' => $first->slug,
                    'template' => $first->template,
                    'is_enabled' => $first->is_enabled,
                    'sort_order' => $first->sort_order,
                    'title' => $first->title,
                    'translations' => $translations,
                ];
            })->values();

            return $this->success($grouped);
        }

        return $this->success($rows);
    }

    public function pagesStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'market_code' => 'required|string|max:16',
            'locale_code' => 'required|string|max:16',
            'slug' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'template' => 'nullable|string|max:64',
            'is_enabled' => 'boolean',
            'status' => 'in:draft,published',
            'is_shared' => 'boolean',
        ]);
        if (($data['status'] ?? 'draft') === 'published') {
            $data['published_at'] = now();
        }

        return $this->success(CmsPage::create($data), 'Created', 201);
    }

    public function pagesUpdate(Request $request, CmsPage $page): JsonResponse
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'template' => 'nullable|string|max:64',
            'is_enabled' => 'boolean',
            'status' => 'in:draft,published',
            'is_shared' => 'boolean',
        ]);
        if (($data['status'] ?? null) === 'published') {
            $data['published_at'] = now();
        }
        $page->update($data);

        return $this->success($page->fresh());
    }

    public function pagesDependencies(CmsPage $page): JsonResponse
    {
        $sectionCount = CmsSection::where('market_code', $page->market_code)
            ->where('locale_code', $page->locale_code)
            ->where('page_slug', $page->slug)
            ->count();

        return $this->success([
            'page_id' => $page->id,
            'sections' => $sectionCount,
            'can_delete_safely' => $sectionCount === 0,
            'warning' => $sectionCount > 0
                ? "This page has {$sectionCount} section(s). Deleting will soft-delete the page; sections remain until removed separately."
                : null,
        ]);
    }

    public function pagesDestroy(Request $request, CmsPage $page): JsonResponse
    {
        $sectionCount = CmsSection::where('market_code', $page->market_code)
            ->where('locale_code', $page->locale_code)
            ->where('page_slug', $page->slug)
            ->count();

        if ($sectionCount > 0 && ! $request->boolean('force')) {
            return $this->error(
                "Page has {$sectionCount} section(s). Pass force=1 to soft-delete anyway.",
                409,
                ['sections' => $sectionCount]
            );
        }

        $page->delete();

        return $this->success(null, 'Page soft-deleted');
    }

    public function pagesRestore(int $page): JsonResponse
    {
        $row = CmsPage::withTrashed()->findOrFail($page);
        $row->restore();

        return $this->success($row->fresh(), 'Restored');
    }

    public function sectionsDuplicate(CmsSection $section): JsonResponse
    {
        return $this->success($section->duplicate(), 'Duplicated', 201);
    }

    public function sectionsRestore(int $section): JsonResponse
    {
        $row = CmsSection::withTrashed()->findOrFail($section);
        $row->restore();

        return $this->success($row->fresh(), 'Restored');
    }

    public function sectionsIndex(Request $request): JsonResponse
    {
        $q = CmsSection::query()->orderBy('page_slug')->orderBy('section_key')->orderBy('sort_order');
        foreach (['market_code' => 'market', 'locale_code' => 'locale', 'page_slug' => 'page', 'section_key' => 'section_key', 'status' => 'status'] as $col => $param) {
            if ($request->filled($param)) {
                $q->where($col, $request->query($param));
            }
        }
        if ($request->filled('q')) {
            $term = '%'.$request->query('q').'%';
            $q->where(function ($inner) use ($term) {
                $inner->where('title', 'like', $term)
                    ->orWhere('section_key', 'like', $term)
                    ->orWhere('page_slug', 'like', $term);
            });
        }

        if ($request->boolean('group')) {
            $rows = $q->get();
            $grouped = $rows->groupBy(fn ($s) => ($s->market_code ?: 'shared').'|'.$s->page_slug.'|'.$s->section_key)->map(function ($items) {
                $first = $items->sortBy('sort_order')->first();
                $itemsSorted = $items->sortBy('sort_order')->values();
                $isRepeating = $itemsSorted->count() > 1 && $itemsSorted->pluck('locale_code')->unique()->count() === 1;

                return [
                    'id' => $first->id,
                    'market_code' => $first->market_code,
                    'page_slug' => $first->page_slug,
                    'section_key' => $first->section_key,
                    'title' => $first->title,
                    'item_count' => $itemsSorted->count(),
                    'is_group' => $isRepeating,
                    'translations' => $itemsSorted->groupBy('locale_code')->map(function ($localeItems, $locale) {
                        return [
                            'locale_code' => $locale,
                            'status' => $localeItems->first()->status,
                            'translation_status' => $localeItems->first()->translation_status,
                            'count' => $localeItems->count(),
                            'ids' => $localeItems->pluck('id')->values(),
                        ];
                    })->values(),
                    'items' => $isRepeating ? $itemsSorted : [],
                ];
            })->values();

            return $this->success(['data' => $grouped, 'total' => $grouped->count()]);
        }

        return $this->success($q->paginate(50));
    }

    public function sectionsStore(Request $request): JsonResponse
    {
        $data = $this->validateSection($request);
        if (($data['status'] ?? 'draft') === 'published') {
            $data['published_at'] = now();
        }

        return $this->success(CmsSection::create($data), 'Created', 201);
    }

    public function sectionsUpdate(Request $request, CmsSection $section): JsonResponse
    {
        $data = $this->validateSection($request, false);
        if (($data['status'] ?? null) === 'published' && $section->status !== 'published') {
            $data['published_at'] = now();
        }
        $section->update($data);

        return $this->success($section->fresh());
    }

    public function sectionsDestroy(CmsSection $section): JsonResponse
    {
        $section->delete();

        return $this->success(null, 'Deleted');
    }

    public function sectionsPublish(CmsSection $section): JsonResponse
    {
        $section->publish();

        return $this->success($section->fresh(), 'Published');
    }

    public function sectionsUnpublish(CmsSection $section): JsonResponse
    {
        $section->unpublish();

        return $this->success($section->fresh(), 'Unpublished');
    }

    public function sectionsReorder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:cms_sections,id',
            'items.*.sort_order' => 'required|integer|min:0',
        ]);
        foreach ($data['items'] as $item) {
            CmsSection::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return $this->success(null, 'Reordered');
    }

    public function sectionsPreview(CmsSection $section): JsonResponse
    {
        // Admin preview may return drafts
        return $this->success($section);
    }

    protected function validateSection(Request $request, bool $requireKeys = true): array
    {
        return $request->validate([
            'market_code' => ($requireKeys ? 'required' : 'sometimes').'|string|max:16',
            'locale_code' => ($requireKeys ? 'required' : 'sometimes').'|string|max:16',
            'page_slug' => ($requireKeys ? 'required' : 'sometimes').'|string|max:255',
            'section_key' => ($requireKeys ? 'required' : 'sometimes').'|string|max:255',
            'frontend_path' => 'nullable|string|max:500',
            'title' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'data' => 'nullable|array',
            'image_url' => 'nullable|string|max:1000',
            'image_alt' => 'nullable|string|max:500',
            'media_id' => 'nullable|integer|exists:cms_media,id',
            'link_label' => 'nullable|string|max:255',
            'link_url' => 'nullable|string|max:1000',
            'sort_order' => 'nullable|integer|min:0',
            'is_enabled' => 'boolean',
            'status' => 'in:draft,published',
            'is_shared' => 'boolean',
            'translation_status' => 'nullable|in:ready,translation_required,review,needs_review',
        ]);
    }

    // ── Navigation ────────────────────────────────────────────────────

    public function navigationIndex(Request $request): JsonResponse
    {
        $q = CmsNavigationItem::query()->orderBy('sort_order');
        if ($request->market) {
            $q->where('market_code', $request->market);
        }
        if ($request->locale) {
            $q->where('locale_code', $request->locale);
        }
        if ($request->location) {
            $q->where('location', $request->location);
        }

        return $this->success($q->get());
    }

    public function navigationStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'market_code' => 'required|string|max:16',
            'locale_code' => 'required|string|max:16',
            'location' => 'required|in:header,footer,mega,announcement',
            'menu_group' => 'nullable|string|max:64',
            'label' => 'required|string|max:255',
            'url' => 'nullable|string|max:1000',
            'parent_id' => 'nullable|integer',
            'children_data' => 'nullable|array',
            'sort_order' => 'integer|min:0',
            'is_enabled' => 'boolean',
            'status' => 'in:draft,published',
            'is_shared' => 'boolean',
        ]);
        if (($data['status'] ?? 'draft') === 'published') {
            $data['published_at'] = now();
        }

        return $this->success(CmsNavigationItem::create($data), 'Created', 201);
    }

    public function navigationUpdate(Request $request, CmsNavigationItem $item): JsonResponse
    {
        $data = $request->validate([
            'label' => 'sometimes|string|max:255',
            'url' => 'nullable|string|max:1000',
            'parent_id' => 'nullable|integer',
            'children_data' => 'nullable|array',
            'sort_order' => 'integer|min:0',
            'is_enabled' => 'boolean',
            'status' => 'in:draft,published',
            'is_shared' => 'boolean',
        ]);
        if (($data['status'] ?? null) === 'published') {
            $data['published_at'] = now();
        }
        $item->update($data);

        return $this->success($item->fresh());
    }

    public function navigationDestroy(CmsNavigationItem $item): JsonResponse
    {
        $item->delete();

        return $this->success(null, 'Deleted');
    }

    // ── Settings / SEO ────────────────────────────────────────────────

    public function settingsIndex(Request $request): JsonResponse
    {
        $q = CmsSetting::query()->orderBy('grp')->orderBy('key');
        if ($request->market) {
            $q->where('market_code', $request->market);
        }

        return $this->success($q->get());
    }

    public function settingsUpsert(Request $request): JsonResponse
    {
        $data = $request->validate([
            'market_code' => 'required|string|max:16',
            'locale_code' => 'nullable|string|max:16',
            'key' => 'required|string|max:255',
            'value' => 'nullable|string',
            'type' => 'nullable|string|max:32',
            'label' => 'nullable|string|max:255',
            'grp' => 'nullable|string|max:64',
            'is_shared' => 'boolean',
        ]);

        $row = CmsSetting::updateOrCreate(
            [
                'market_code' => $data['market_code'],
                'locale_code' => $data['locale_code'] ?? null,
                'key' => $data['key'],
            ],
            $data
        );

        return $this->success($row);
    }

    public function seoIndex(Request $request): JsonResponse
    {
        $q = CmsSeoEntry::query()->orderBy('path');
        if ($request->market) {
            $q->where('market_code', $request->market);
        }
        if ($request->locale) {
            $q->where('locale_code', $request->locale);
        }

        return $this->success($q->get());
    }

    public function seoUpsert(Request $request): JsonResponse
    {
        $data = $request->validate([
            'market_code' => 'required|string|max:16',
            'locale_code' => 'required|string|max:16',
            'path' => 'required|string|max:500',
            'title' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'keywords' => 'nullable|string',
            'canonical_url' => 'nullable|string|max:1000',
            'og_title' => 'nullable|string|max:500',
            'og_description' => 'nullable|string',
            'og_image' => 'nullable|string|max:1000',
            'og_locale' => 'nullable|string|max:32',
            'noindex' => 'boolean',
            'hreflang' => 'nullable|array',
            'status' => 'in:draft,published',
            'is_shared' => 'boolean',
        ]);
        if (($data['status'] ?? 'draft') === 'published') {
            $data['published_at'] = now();
        }

        $row = CmsSeoEntry::updateOrCreate(
            [
                'market_code' => $data['market_code'],
                'locale_code' => $data['locale_code'],
                'path' => $data['path'],
            ],
            $data
        );

        return $this->success($row);
    }

    // ── Blog ──────────────────────────────────────────────────────────

    public function blogCategoriesIndex(Request $request): JsonResponse
    {
        $q = CmsBlogCategory::query()->orderBy('sort_order');
        if ($request->market) {
            $q->where('market_code', $request->market);
        }

        return $this->success($q->get());
    }

    public function blogCategoriesStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'market_code' => 'required|string|max:16',
            'locale_code' => 'required|string|max:16',
            'slug' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'integer|min:0',
            'is_enabled' => 'boolean',
            'status' => 'in:draft,published',
            'is_shared' => 'boolean',
        ]);
        if (($data['status'] ?? 'draft') === 'published') {
            $data['published_at'] = now();
        }

        return $this->success(CmsBlogCategory::create($data), 'Created', 201);
    }

    public function blogPostsIndex(Request $request): JsonResponse
    {
        $q = CmsBlogPost::query()->orderByDesc('id');
        if ($request->market) {
            $q->where('market_code', $request->market);
        }
        if ($request->locale) {
            $q->where('locale_code', $request->locale);
        }

        return $this->success($q->paginate(30));
    }

    public function blogPostsStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'market_code' => 'required|string|max:16',
            'locale_code' => 'required|string|max:16',
            'slug' => 'required|string|max:255',
            'title' => 'required|string|max:500',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'image_url' => 'nullable|string|max:1000',
            'image_alt' => 'nullable|string|max:500',
            'category_id' => 'nullable|integer|exists:cms_blog_categories,id',
            'author' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'related_slugs' => 'nullable|array',
            'seo_title' => 'nullable|string|max:500',
            'seo_description' => 'nullable|string',
            'canonical_url' => 'nullable|string|max:1000',
            'og_image' => 'nullable|string|max:1000',
            'media_type' => 'nullable|string|max:32',
            'video_url' => 'nullable|string|max:1000',
            'duration' => 'nullable|string|max:16',
            'show_on_homepage' => 'boolean',
            'sort_order' => 'integer|min:0',
            'is_enabled' => 'boolean',
            'status' => 'in:draft,published',
            'is_shared' => 'boolean',
            'noindex' => 'boolean',
            'translation_status' => 'nullable|in:ready,translation_required,review,needs_review',
        ]);
        if (($data['status'] ?? 'draft') === 'published') {
            $data['published_at'] = now();
        }

        return $this->success(CmsBlogPost::create($data), 'Created', 201);
    }

    public function blogPostsUpdate(Request $request, CmsBlogPost $post): JsonResponse
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:500',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'image_url' => 'nullable|string|max:1000',
            'image_alt' => 'nullable|string|max:500',
            'category_id' => 'nullable|integer|exists:cms_blog_categories,id',
            'author' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'related_slugs' => 'nullable|array',
            'seo_title' => 'nullable|string|max:500',
            'seo_description' => 'nullable|string',
            'canonical_url' => 'nullable|string|max:1000',
            'og_image' => 'nullable|string|max:1000',
            'media_type' => 'nullable|string|max:32',
            'video_url' => 'nullable|string|max:1000',
            'duration' => 'nullable|string|max:16',
            'show_on_homepage' => 'boolean',
            'sort_order' => 'integer|min:0',
            'is_enabled' => 'boolean',
            'status' => 'in:draft,published',
            'is_shared' => 'boolean',
            'noindex' => 'boolean',
            'translation_status' => 'nullable|in:ready,translation_required,review,needs_review',
        ]);
        if (($data['status'] ?? null) === 'published') {
            $data['published_at'] = now();
        }
        $post->update($data);

        return $this->success($post->fresh());
    }

    public function blogPostsDestroy(CmsBlogPost $post): JsonResponse
    {
        $post->delete();

        return $this->success(null, 'Deleted');
    }

    // ── Media ─────────────────────────────────────────────────────────

    public function mediaIndex(Request $request): JsonResponse
    {
        $q = CmsMedia::query()->orderByDesc('id');
        if ($request->market) {
            $q->where('market_code', $request->market);
        }

        return $this->success($q->paginate(40));
    }

    public function mediaUpload(Request $request): JsonResponse
    {
        $maxKb = (int) env('CMS_MEDIA_MAX_KB', 102400); // 100 MB default for video
        $request->validate([
            'file' => 'required|file|max:'.$maxKb.'|mimetypes:image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf,video/mp4,video/webm',
            'alt_text' => 'nullable|string|max:500',
            'caption' => 'nullable|string|max:500',
            'title' => 'nullable|string|max:255',
            'poster_url' => 'nullable|string|max:500',
            'market_code' => 'nullable|string|max:16',
            'locale_code' => 'nullable|string|max:16',
            'duration_seconds' => 'nullable|integer|min:0',
            'width' => 'nullable|integer|min:0',
            'height' => 'nullable|integer|min:0',
        ]);

        $file = $request->file('file');
        $mime = $file->getMimeType() ?: '';
        $isVideo = str_starts_with($mime, 'video/');
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->extension());
        $safeName = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) ?: 'asset';
        $filename = $safeName.'-'.Str::random(8).'.'.$ext;
        $dir = ($isVideo ? 'cms-media/videos/' : 'cms-media/images/').date('Y/m');
        $path = $file->storeAs($dir, $filename, 'public');
        $url = Storage::disk('public')->url($path);

        $width = $request->integer('width') ?: null;
        $height = $request->integer('height') ?: null;
        if (! $isVideo && function_exists('getimagesize') && str_starts_with($mime, 'image/') && $mime !== 'image/svg+xml') {
            $info = @getimagesize($file->getRealPath());
            if ($info) {
                $width = $info[0] ?? $width;
                $height = $info[1] ?? $height;
            }
        }

        $media = CmsMedia::create([
            'market_code' => $request->input('market_code'),
            'locale_code' => $request->input('locale_code'),
            'disk' => 'public',
            'path' => $path,
            'url' => $url,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $mime,
            'media_kind' => $isVideo ? 'video' : (str_contains($mime, 'pdf') ? 'document' : 'image'),
            'size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
            'duration_seconds' => $isVideo ? $request->integer('duration_seconds') ?: null : null,
            'alt_text' => $isVideo ? null : $request->input('alt_text'),
            'caption' => $request->input('caption') ?: ($isVideo ? $request->input('title') : null),
            'poster_url' => $isVideo ? $request->input('poster_url') : null,
            'title' => $request->input('title') ?: $file->getClientOriginalName(),
            'uploaded_by' => $request->user()->id,
        ]);

        return $this->success($media, 'Uploaded', 201);
    }

    public function mediaUpdate(Request $request, CmsMedia $media): JsonResponse
    {
        $data = $request->validate([
            'alt_text' => 'nullable|string|max:500',
            'caption' => 'nullable|string|max:500',
            'title' => 'nullable|string|max:255',
            'poster_url' => 'nullable|string|max:500',
            'market_code' => 'nullable|string|max:16',
            'locale_code' => 'nullable|string|max:16',
        ]);
        $media->update($data);

        return $this->success($media->fresh());
    }

    public function mediaDestroy(Request $request, CmsMedia $media): JsonResponse
    {
        $inUse = CmsSection::where('media_id', $media->id)->exists()
            || CmsSection::where('image_url', $media->url)->exists()
            || CmsBlogPost::where('image_url', $media->url)->exists()
            || CmsBlogPost::where('video_url', $media->url)->exists();

        if ($inUse && ! $request->boolean('force')) {
            return $this->error('Media is in use. Pass force=1 to delete anyway.', 409);
        }

        Storage::disk($media->disk)->delete($media->path);
        $media->delete();

        return $this->success(null, 'Deleted');
    }

    public function signedPreview(Request $request): JsonResponse
    {
        $data = $request->validate([
            'path' => 'required|string|max:500',
            'market' => 'required|string|max:16',
            'locale' => 'required|string|max:16',
            'ttl' => 'nullable|integer|min:60|max:86400',
        ]);
        $ttl = $data['ttl'] ?? 1800;
        $token = \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'cms.draft-preview',
            now()->addSeconds($ttl),
            [
                'path' => $data['path'],
                'market' => $data['market'],
                'locale' => $data['locale'],
            ]
        );

        return $this->success([
            'preview_url' => $token,
            'expires_in' => $ttl,
            'label' => 'Draft preview (authenticated signed link)',
        ]);
    }

    // ── Inquiries ─────────────────────────────────────────────────────

    public function inquiriesIndex(Request $request): JsonResponse
    {
        $q = CmsInquiry::query()->orderByDesc('id');
        if ($request->market) {
            $q->where('market_code', $request->market);
        }
        if ($request->type) {
            $q->where('type', $request->type);
        }
        if ($request->status) {
            $q->where('status', $request->status);
        }

        return $this->success($q->paginate(40));
    }

    public function inquiriesShow(CmsInquiry $inquiry): JsonResponse
    {
        return $this->success($inquiry);
    }

    public function inquiriesUpdate(Request $request, CmsInquiry $inquiry): JsonResponse
    {
        $data = $request->validate([
            'status' => 'sometimes|string|max:32',
            'admin_notes' => 'nullable|string',
        ]);
        if (($data['status'] ?? null) === 'replied') {
            $data['replied_at'] = now();
        }
        $inquiry->update($data);

        return $this->success($inquiry->fresh());
    }
}
