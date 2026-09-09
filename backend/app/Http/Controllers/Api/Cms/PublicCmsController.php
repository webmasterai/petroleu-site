<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Cms\CmsBlogPost;
use App\Models\Cms\CmsInquiry;
use App\Models\Cms\CmsMarket;
use App\Models\Cms\CmsNavigationItem;
use App\Models\Cms\CmsSection;
use App\Models\Cms\CmsSeoEntry;
use App\Models\Cms\CmsSetting;
use App\Support\MarketContentResolver;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PublicCmsController extends Controller
{
    use ApiResponse;

    protected function resolveContext(Request $request): array
    {
        $market = $request->query('market', 'pk');
        $locale = $request->query('locale', $market === 'af' ? 'fa-AF' : 'en-PK');

        $marketRow = CmsMarket::where('code', $market)->where('is_active', true)->first();
        $defaultLocale = $marketRow?->default_locale;

        return compact('market', 'locale', 'defaultLocale', 'marketRow');
    }

    protected function sectionData(?CmsSection $section): ?array
    {
        if (! $section) {
            return null;
        }

        $data = $section->data ?? [];

        return array_merge([
            'id' => $section->id,
            'title' => $section->title,
            'heading' => $section->title,
            'description' => $section->description,
            'subheading' => $section->description,
            'content' => $section->content,
            'image_url' => $section->image_url,
            'dashboard_image_url' => $section->image_url,
            'image_alt' => $section->image_alt,
            'link_label' => $section->link_label,
            'link_url' => $section->link_url,
            'cta_text' => $section->link_label,
            'cta_link' => $section->link_url,
            'sort_order' => $section->sort_order,
        ], is_array($data) ? $data : []);
    }

    protected function listByKey(Request $request, string $pageSlug, string $sectionKey): JsonResponse
    {
        $ctx = $this->resolveContext($request);
        $rows = MarketContentResolver::publishedSectionsQuery(
            $ctx['market'],
            $ctx['locale'],
            $pageSlug,
            $sectionKey,
            $ctx['defaultLocale'],
        );

        // When section_key filter returns first match only for singles; for lists use page+key without early return
        $rows = CmsSection::query()
            ->where('status', 'published')
            ->where('is_enabled', true)
            ->where('page_slug', $pageSlug)
            ->where('section_key', $sectionKey)
            ->orderBy('sort_order')
            ->get();

        $filtered = $this->filterByMarketLocale($rows, $ctx);

        return $this->success($filtered->map(fn ($s) => $this->sectionData($s))->values());
    }

    protected function filterByMarketLocale($rows, array $ctx)
    {
        foreach (MarketContentResolver::fallbackChain($ctx['market'], $ctx['locale'], $ctx['defaultLocale']) as $step) {
            if ($step['market'] !== $ctx['market'] && $step['market'] !== 'shared') {
                continue;
            }

            $batch = $rows->filter(function ($row) use ($step) {
                if ($row->market_code !== $step['market'] || $row->locale_code !== $step['locale']) {
                    return false;
                }
                if ($step['market'] === 'shared' && ! $row->is_shared) {
                    return false;
                }

                return true;
            });

            if ($batch->isNotEmpty()) {
                return $batch->values();
            }
        }

        return collect();
    }

    public function hero(Request $request, string $page): JsonResponse
    {
        $ctx = $this->resolveContext($request);
        $section = MarketContentResolver::firstPublishedSection(
            $ctx['market'], $ctx['locale'], $page, 'hero', $ctx['defaultLocale']
        );
        if (! $section) {
            return $this->error('Not found', 404);
        }

        return $this->success($this->sectionData($section));
    }

    public function features(Request $request): JsonResponse
    {
        $page = $request->query('page', 'home');
        $type = $request->query('type', 'card');

        return $this->listByKey($request, $page, 'feature:'.$type);
    }

    public function logos(Request $request): JsonResponse
    {
        return $this->listByKey($request, 'home', 'logo');
    }

    public function testimonials(Request $request): JsonResponse
    {
        return $this->listByKey($request, 'home', 'testimonial');
    }

    public function pricing(Request $request): JsonResponse
    {
        $ctx = $this->resolveContext($request);
        $rows = CmsSection::where('page_slug', 'pricing')
            ->where('section_key', 'plan')
            ->where('status', 'published')
            ->where('is_enabled', true)
            ->orderBy('sort_order')
            ->get();

        $filtered = $this->filterByMarketLocale($rows, $ctx);

        return $this->success($filtered->map(function ($s) {
            $data = $this->sectionData($s);

            return [
                'id' => $s->id,
                'name' => $s->title,
                'price' => $data['price'] ?? '',
                'price_yearly' => $data['price_yearly'] ?? null,
                'period' => $data['period'] ?? 'month',
                'description' => $s->description,
                'is_popular' => (bool) ($data['is_popular'] ?? false),
                'popular' => (bool) ($data['is_popular'] ?? false),
                'features' => collect($data['features'] ?? [])->map(fn ($f) => [
                    'feature_text' => is_string($f) ? $f : ($f['feature_text'] ?? $f['text'] ?? ''),
                ])->all(),
                'cta_text' => $s->link_label,
                'cta_link' => $s->link_url,
            ];
        })->values());
    }

    public function faq(Request $request): JsonResponse
    {
        $page = $request->query('page', 'home');

        return $this->listByKey($request, $page, 'faq');
    }

    public function stats(Request $request): JsonResponse
    {
        return $this->listByKey($request, 'home', 'stat');
    }

    public function team(Request $request): JsonResponse
    {
        return $this->listByKey($request, 'about', 'team');
    }

    public function cta(Request $request, string $page): JsonResponse
    {
        $ctx = $this->resolveContext($request);
        $section = MarketContentResolver::firstPublishedSection(
            $ctx['market'], $ctx['locale'], $page, 'cta', $ctx['defaultLocale']
        );
        if (! $section) {
            return $this->error('Not found', 404);
        }
        $data = $this->sectionData($section);

        return $this->success([
            'page' => $page,
            'heading' => $section->title,
            'subheading' => $section->description,
            'btn1_text' => $data['btn1_text'] ?? $section->link_label,
            'btn1_link' => $data['btn1_link'] ?? $section->link_url,
            'btn2_text' => $data['btn2_text'] ?? null,
            'btn2_link' => $data['btn2_link'] ?? null,
        ]);
    }

    public function siteSettings(Request $request): JsonResponse
    {
        $ctx = $this->resolveContext($request);
        $settings = [];

        foreach (MarketContentResolver::fallbackChain($ctx['market'], $ctx['locale'], $ctx['defaultLocale']) as $step) {
            if ($step['market'] !== $ctx['market'] && $step['market'] !== 'shared') {
                continue;
            }
            // Prefer exact-locale rows over market-wide (null locale)
            $rows = CmsSetting::where('market_code', $step['market'])
                ->where(function ($q) use ($step) {
                    $q->whereNull('locale_code')->orWhere('locale_code', $step['locale']);
                })
                ->orderByRaw('CASE WHEN locale_code IS NULL THEN 1 ELSE 0 END')
                ->get();
            foreach ($rows as $row) {
                if ($step['market'] === 'shared' && ! $row->is_shared) {
                    continue;
                }
                // Exact locale always wins; null locale fills gaps only
                if ($row->locale_code === $step['locale'] || ! array_key_exists($row->key, $settings)) {
                    $settings[$row->key] = $row->value;
                }
            }
        }

        if ($ctx['marketRow']) {
            $m = $ctx['marketRow'];
            $pick = function (?string $fromSettings, mixed $fromMarket) {
                if ($fromSettings !== null && $fromSettings !== '') {
                    return $fromSettings;
                }
                // Empty string in settings means intentionally hidden (AF)
                if ($fromSettings === '') {
                    return '';
                }

                return $fromMarket;
            };
            $settings = array_merge([
                'site_name' => $settings['site_name'] ?? 'Petroleu',
                'phone' => $pick($settings['phone'] ?? null, $m->phone),
                'whatsapp' => $pick($settings['whatsapp'] ?? null, $m->whatsapp),
                'sales_email' => $pick($settings['sales_email'] ?? null, $m->sales_email),
                'primary_email' => $pick($settings['primary_email'] ?? null, $m->support_email),
                'contact_email' => $pick($settings['contact_email'] ?? null, $m->email),
                'address' => $pick($settings['address'] ?? null, $m->address),
                'currency' => $pick($settings['currency'] ?? null, $m->currency),
            ], $settings);
        }

        return $this->success($settings);
    }

    public function missionValues(Request $request): JsonResponse
    {
        return $this->listByKey($request, 'about', 'mission');
    }

    public function howItWorks(Request $request): JsonResponse
    {
        return $this->listByKey($request, 'home', 'how-it-works');
    }

    public function companyStory(Request $request): JsonResponse
    {
        $ctx = $this->resolveContext($request);

        $storyRows = CmsSection::where('page_slug', 'about')
            ->where('section_key', 'story')
            ->where('status', 'published')
            ->where('is_enabled', true)
            ->orderBy('sort_order')
            ->get();
        $achievementRows = CmsSection::where('page_slug', 'about')
            ->where('section_key', 'achievement')
            ->where('status', 'published')
            ->where('is_enabled', true)
            ->orderBy('sort_order')
            ->get();

        return $this->success([
            'story' => $this->filterByMarketLocale($storyRows, $ctx)->map(fn ($s) => $this->sectionData($s))->values(),
            'achievements' => $this->filterByMarketLocale($achievementRows, $ctx)->map(fn ($s) => $this->sectionData($s))->values(),
        ]);
    }

    public function industries(Request $request): JsonResponse
    {
        return $this->listByKey($request, 'home', 'industry');
    }

    public function mobileFeatures(Request $request): JsonResponse
    {
        return $this->listByKey($request, 'home', 'mobile-feature');
    }

    public function analyticsCards(Request $request): JsonResponse
    {
        return $this->listByKey($request, 'home', 'analytics-card');
    }

    public function whyChooseReasons(Request $request): JsonResponse
    {
        return $this->listByKey($request, 'home', 'why-choose');
    }

    public function supportedBrands(Request $request): JsonResponse
    {
        return $this->listByKey($request, 'home', 'supported-brand');
    }

    /** Section chrome: eyebrow / title / subtitle for marketing blocks. */
    public function sectionHeading(Request $request, string $key): JsonResponse
    {
        $ctx = $this->resolveContext($request);
        $page = $request->query('page', 'home');
        $section = MarketContentResolver::firstPublishedSection(
            $ctx['market'],
            $ctx['locale'],
            $page,
            'heading:'.$key,
            $ctx['defaultLocale'],
        );
        if (! $section) {
            return $this->error('Not found', 404);
        }

        return $this->success($this->sectionData($section));
    }

    /** Structured demo blocks (invoice / reports) — never PK static on AF. */
    public function demoBlock(Request $request, string $key): JsonResponse
    {
        $ctx = $this->resolveContext($request);
        $section = MarketContentResolver::firstPublishedSection(
            $ctx['market'],
            $ctx['locale'],
            'home',
            'demo:'.$key,
            $ctx['defaultLocale'],
        );
        if (! $section) {
            return $this->error('Not found', 404);
        }

        return $this->success($this->sectionData($section));
    }

    /** Card grid for docs / developers / similar marketing pages. */
    public function pageCards(Request $request, string $page): JsonResponse
    {
        return $this->listByKey($request, $page, 'page-card');
    }

    public function legalPage(Request $request, string $slug): JsonResponse
    {
        $ctx = $this->resolveContext($request);
        $section = MarketContentResolver::firstPublishedSection(
            $ctx['market'], $ctx['locale'], 'legal', $slug, $ctx['defaultLocale']
        );
        if (! $section) {
            return $this->error('Not found', 404);
        }

        return $this->success([
            'slug' => $slug,
            'title' => $section->title,
            'body' => $section->content,
            'content' => $section->content,
        ]);
    }

    public function navigation(Request $request): JsonResponse
    {
        $ctx = $this->resolveContext($request);
        $location = $request->query('location', 'header');
        $rows = CmsNavigationItem::where('location', $location)
            ->where('status', 'published')
            ->where('is_enabled', true)
            ->orderBy('sort_order')
            ->get();

        $filtered = $this->filterByMarketLocale($rows, $ctx);

        return $this->success($filtered->values());
    }

    public function seo(Request $request): JsonResponse
    {
        $ctx = $this->resolveContext($request);
        $path = $request->query('path', '/');
        foreach (MarketContentResolver::fallbackChain($ctx['market'], $ctx['locale'], $ctx['defaultLocale']) as $step) {
            if ($step['market'] !== $ctx['market'] && $step['market'] !== 'shared') {
                continue;
            }
            $q = CmsSeoEntry::where('market_code', $step['market'])
                ->where('locale_code', $step['locale'])
                ->where('path', $path)
                ->where('status', 'published');
            if ($step['market'] === 'shared') {
                $q->where('is_shared', true);
            }
            $row = $q->first();
            if ($row) {
                return $this->success($row);
            }
        }

        return $this->error('Not found', 404);
    }

    public function blogIndex(Request $request): JsonResponse
    {
        $ctx = $this->resolveContext($request);
        $q = CmsBlogPost::where('status', 'published')
            ->where('is_enabled', true)
            ->orderBy('sort_order')
            ->orderByDesc('published_at');
        if ($request->boolean('homepage')) {
            $q->where('show_on_homepage', true);
        }
        $rows = $q->get();
        $filtered = $this->filterByMarketLocale($rows, $ctx);

        return $this->success($filtered->values());
    }

    public function blogShow(Request $request, string $slug): JsonResponse
    {
        $ctx = $this->resolveContext($request);
        $rows = CmsBlogPost::where('slug', $slug)
            ->where('status', 'published')
            ->where('is_enabled', true)
            ->get();
        $filtered = $this->filterByMarketLocale($rows, $ctx);
        $post = $filtered->first();
        if (! $post) {
            return $this->error('Not found', 404);
        }

        return $this->success($post);
    }

    public function contact(Request $request): JsonResponse
    {
        $data = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'stations' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'message' => 'nullable|string|max:2000',
            'market' => 'nullable|string|max:16',
            'locale' => 'nullable|string|max:16',
            'source' => 'nullable|string|max:64',
        ]);

        $market = $data['market'] ?? 'pk';
        $marketRow = CmsMarket::where('code', $market)->first();

        $inquiry = CmsInquiry::create([
            'type' => 'contact',
            'market_code' => $market,
            'locale_code' => $data['locale'] ?? ($market === 'af' ? 'fa-AF' : 'en-PK'),
            'source' => $data['source'] ?? ($marketRow?->form_source ?? 'website'),
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'company' => $data['company'] ?? null,
            'stations' => $data['stations'] ?? null,
            'city' => $data['city'] ?? null,
            'address' => $data['address'] ?? null,
            'message' => $data['message'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $this->notifyInquiry($inquiry, $marketRow);

        return $this->success(null, 'Message sent successfully', 201);
    }

    public function demoRequest(Request $request): JsonResponse
    {
        $data = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'company' => 'nullable|string|max:255',
            'fuel_brand' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'message' => 'nullable|string|max:2000',
            'market' => 'nullable|string|max:16',
            'locale' => 'nullable|string|max:16',
            'source' => 'nullable|string|max:64',
        ]);

        $market = $data['market'] ?? 'pk';
        $marketRow = CmsMarket::where('code', $market)->first();

        $inquiry = CmsInquiry::create([
            'type' => 'demo',
            'market_code' => $market,
            'locale_code' => $data['locale'] ?? ($market === 'af' ? 'fa-AF' : 'en-PK'),
            'source' => $data['source'] ?? ($marketRow?->form_source ?? 'website-demo'),
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'company' => $data['company'] ?? null,
            'fuel_brand' => $data['fuel_brand'] ?? null,
            'message' => $data['message'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $this->notifyInquiry($inquiry, $marketRow);

        return $this->success(null, 'Demo request received', 201);
    }

    public function markets(): JsonResponse
    {
        return $this->success(
            CmsMarket::where('is_active', true)->where('code', '!=', 'shared')->orderBy('code')->get()
        );
    }

    /**
     * Signed draft preview — public visitors without a valid signature never see drafts.
     */
    public function draftPreview(Request $request): JsonResponse
    {
        if (! $request->hasValidSignature()) {
            return $this->error('Invalid or expired preview link', 403);
        }

        $market = $request->query('market', 'pk');
        $locale = $request->query('locale', 'en-PK');
        $path = $request->query('path', '/');
        $pageSlug = trim((string) $request->query('page_slug', 'home')) ?: 'home';

        $sections = CmsSection::query()
            ->where('market_code', $market)
            ->where('locale_code', $locale)
            ->where('page_slug', $pageSlug)
            ->where('is_enabled', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (CmsSection $s) => $this->sectionData($s));

        return $this->success([
            'draft_preview' => true,
            'label' => 'Draft preview — not public',
            'market' => $market,
            'locale' => $locale,
            'path' => $path,
            'page_slug' => $pageSlug,
            'sections' => $sections,
        ]);
    }

    protected function notifyInquiry(CmsInquiry $inquiry, ?CmsMarket $market): void
    {
        $raw = $market?->inquiry_recipients
            ?? CmsSetting::where('market_code', $inquiry->market_code)->where('key', 'demo_admin_emails')->value('value')
            ?? '';

        $emails = array_filter(array_map('trim', explode(',', (string) $raw)));
        if (empty($emails)) {
            Log::info('Inquiry stored; no recipient emails configured', ['id' => $inquiry->id]);

            return;
        }

        $from = config('mail.from.address');
        $fromName = config('mail.from.name', 'Petroleu CMS');
        $subject = ($inquiry->type === 'demo' ? 'Demo request' : 'Contact form').' — '.$inquiry->market_code;
        $body = "Name: {$inquiry->full_name}\nEmail: {$inquiry->email}\nPhone: {$inquiry->phone}\nCompany: {$inquiry->company}\nMessage: {$inquiry->message}\nMarket: {$inquiry->market_code}\nLocale: {$inquiry->locale_code}";

        foreach ($emails as $email) {
            try {
                Mail::raw($body, function ($message) use ($email, $subject, $from, $fromName) {
                    $message->to($email)->subject($subject)->from($from, $fromName);
                });
            } catch (\Throwable $e) {
                Log::warning('Inquiry email failed: '.$e->getMessage());
            }
        }
    }
}
