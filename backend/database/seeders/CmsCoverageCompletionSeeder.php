<?php

namespace Database\Seeders;

use App\Models\Cms\CmsBlogCategory;
use App\Models\Cms\CmsBlogPost;
use App\Models\Cms\CmsMedia;
use App\Models\Cms\CmsNavigationItem;
use App\Models\Cms\CmsPage;
use App\Models\Cms\CmsSection;
use App\Models\Cms\CmsSeoEntry;
use App\Models\Cms\CmsSetting;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CmsCoverageCompletionSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedMedia();
        $this->seedBlog();
        $this->seedHeaderNavAndAnnouncement();
        $this->seedModuleAndIndustryPages();
        $this->seedAfghanistanDraftStructure();
    }

    protected function seedMedia(): void
    {
        $path = database_path('seeders/data/media_assets.json');
        if (! is_file($path)) {
            return;
        }
        $assets = json_decode(file_get_contents($path), true) ?: [];
        foreach ($assets as $asset) {
            CmsMedia::updateOrCreate(
                ['url' => $asset['url'], 'market_code' => $asset['market_code'] ?? 'pk'],
                [
                    'disk' => 'public',
                    'path' => $asset['url'],
                    'original_name' => $asset['title'] ?? basename(parse_url($asset['url'], PHP_URL_PATH) ?: 'asset'),
                    'mime_type' => str_ends_with($asset['url'], '.mp4') ? 'video/mp4' : 'image/jpeg',
                    'size' => 0,
                    'alt_text' => $asset['alt'] ?? null,
                    'title' => $asset['title'] ?? null,
                    'source' => $asset['source'] ?? 'imported',
                    'locale_code' => 'en-PK',
                ]
            );
        }
    }

    protected function seedBlog(): void
    {
        $path = database_path('seeders/data/blog_posts.json');
        if (! is_file($path)) {
            return;
        }
        $posts = json_decode(file_get_contents($path), true) ?: [];

        $cat = CmsBlogCategory::updateOrCreate(
            ['market_code' => 'pk', 'locale_code' => 'en-PK', 'slug' => 'video'],
            [
                'name' => 'Video',
                'description' => 'Petroleu product videos and guides',
                'sort_order' => 0,
                'is_enabled' => true,
                'status' => 'published',
                'published_at' => now(),
            ]
        );

        foreach ($posts as $p) {
            $publishedAt = null;
            try {
                $publishedAt = Carbon::parse($p['date'] ?? now());
            } catch (\Throwable) {
                $publishedAt = now();
            }

            CmsBlogPost::updateOrCreate(
                ['market_code' => 'pk', 'locale_code' => 'en-PK', 'slug' => $p['slug']],
                [
                    'title' => $p['title'],
                    'excerpt' => $p['excerpt'] ?? null,
                    'content' => $p['content'] ?? null,
                    'image_url' => $p['image_url'] ?? null,
                    'image_alt' => $p['title'] ?? null,
                    'category_id' => $cat->id,
                    'author' => $p['author'] ?? 'Petroleu',
                    'tags' => $p['tags'] ?? ['Video'],
                    'related_slugs' => [],
                    'seo_title' => ($p['title'] ?? '').' | Petroleu Blog',
                    'seo_description' => $p['excerpt'] ?? null,
                    'canonical_url' => 'https://petroleu.com/blog/'.($p['slug'] ?? ''),
                    'og_image' => $p['image_url'] ?? null,
                    'media_type' => $p['media_type'] ?? 'video',
                    'video_url' => $p['video_url'] ?? null,
                    'duration' => $p['duration'] ?? null,
                    'show_on_homepage' => (bool) ($p['show_on_homepage'] ?? false),
                    'sort_order' => (int) ($p['sort_order'] ?? 0),
                    'is_enabled' => true,
                    'status' => ! empty($p['published']) ? 'published' : 'draft',
                    'noindex' => false,
                    'published_at' => ! empty($p['published']) ? $publishedAt : null,
                    'translation_status' => 'ready',
                ]
            );
        }

        // Wire related posts: previous/next by sort
        $ordered = CmsBlogPost::where('market_code', 'pk')->where('locale_code', 'en-PK')->orderBy('sort_order')->get();
        foreach ($ordered as $i => $post) {
            $related = [];
            if ($i > 0) {
                $related[] = $ordered[$i - 1]->slug;
            }
            if ($i < $ordered->count() - 1) {
                $related[] = $ordered[$i + 1]->slug;
            }
            $post->update(['related_slugs' => $related]);
        }
    }

    protected function seedHeaderNavAndAnnouncement(): void
    {
        CmsNavigationItem::where('market_code', 'pk')->whereIn('location', ['header', 'mega', 'announcement', 'footer'])->delete();

        $header = [
            ['Features', '/features'],
            ['Pricing', '/pricing'],
            ['FAQ', '/faq'],
            ['Mobile App', '/#mobile'],
            ['About', '/about'],
            ['Blog', '/blog'],
            ['Contact', '/contact'],
        ];
        foreach ($header as $i => [$label, $url]) {
            CmsNavigationItem::create([
                'market_code' => 'pk',
                'locale_code' => 'en-PK',
                'location' => 'header',
                'menu_group' => 'primary',
                'label' => $label,
                'url' => $url,
                'sort_order' => $i,
                'is_enabled' => true,
                'status' => 'published',
                'published_at' => now(),
            ]);
        }

        $resources = [
            ['Analytics', '/analytics'],
            ['Reports', '/product/reports'],
            ['FAQ', '/faq'],
            ['Docs', '/docs'],
        ];
        foreach ($resources as $i => [$label, $url]) {
            CmsNavigationItem::create([
                'market_code' => 'pk',
                'locale_code' => 'en-PK',
                'location' => 'mega',
                'menu_group' => 'resources',
                'label' => $label,
                'url' => $url,
                'sort_order' => $i,
                'is_enabled' => true,
                'status' => 'published',
                'published_at' => now(),
            ]);
        }

        CmsNavigationItem::create([
            'market_code' => 'pk',
            'locale_code' => 'en-PK',
            'location' => 'announcement',
            'menu_group' => 'announcement',
            'label' => 'Petroleu — Modern Petrol Pump Software',
            'url' => null,
            'sort_order' => 0,
            'is_enabled' => true,
            'status' => 'published',
            'published_at' => now(),
            'children_data' => ['visible' => true],
        ]);

        CmsSetting::updateOrCreate(
            ['market_code' => 'pk', 'locale_code' => null, 'key' => 'announcement_text'],
            ['value' => 'Petroleu — Modern Petrol Pump Software', 'type' => 'text', 'label' => 'Top announcement', 'grp' => 'header']
        );
    }

    protected function seedModuleAndIndustryPages(): void
    {
        foreach (['analytics', 'industries', 'product-reports', 'faq', 'developers', 'docs'] as $slug) {
            CmsPage::updateOrCreate(
                ['market_code' => 'pk', 'locale_code' => 'en-PK', 'slug' => $slug],
                [
                    'title' => Str::headline($slug),
                    'frontend_path' => match ($slug) {
                        'product-reports' => '/product/reports',
                        default => '/'.$slug,
                    },
                    'description' => 'Pakistan '.$slug.' page',
                    'is_enabled' => true,
                    'status' => 'published',
                    'published_at' => now(),
                    'translation_status' => 'ready',
                ]
            );
        }

        // Industry detail cards as CMS sections for industries page
        $industries = [
            ['Retail Petrol Pumps', 'Daily nozzle, stock, and credit tools for retail forecourts.'],
            ['Dealer Networks', 'Multi-station visibility for dealers and distributors.'],
            ['Fleet & Credit Customers', 'Vehicle-wise billing and receivables tracking.'],
            ['Wholesale & Supply', 'Track wholesale fuel deliveries and supplier accounts.'],
        ];
        CmsSection::where('market_code', 'pk')->where('page_slug', 'industries')->where('section_key', 'industry-card')->delete();
        foreach ($industries as $i => [$title, $desc]) {
            CmsSection::create([
                'market_code' => 'pk',
                'locale_code' => 'en-PK',
                'page_slug' => 'industries',
                'section_key' => 'industry-card',
                'frontend_path' => '/industries',
                'title' => $title,
                'description' => $desc,
                'sort_order' => $i,
                'is_enabled' => true,
                'status' => 'published',
                'published_at' => now(),
                'translation_status' => 'ready',
                'data' => ['title' => $title, 'description' => $desc],
            ]);
        }

        // Analytics modules
        CmsSection::where('market_code', 'pk')->where('page_slug', 'analytics')->where('section_key', 'module-card')->delete();
        $modules = [
            ['Sales Analytics', 'Track product-wise and station-wise sales performance.'],
            ['Stock Analytics', 'Monitor tank levels, dips, and variance trends.'],
            ['Credit Analytics', 'See outstanding balances and recovery patterns.'],
        ];
        foreach ($modules as $i => [$title, $desc]) {
            CmsSection::create([
                'market_code' => 'pk',
                'locale_code' => 'en-PK',
                'page_slug' => 'analytics',
                'section_key' => 'module-card',
                'frontend_path' => '/analytics',
                'title' => $title,
                'description' => $desc,
                'sort_order' => $i,
                'is_enabled' => true,
                'status' => 'published',
                'published_at' => now(),
                'translation_status' => 'ready',
            ]);
        }

        // FAQ page categories as sections
        CmsSection::where('market_code', 'pk')->where('page_slug', 'faq')->where('section_key', 'faq')->delete();
        $faqs = [
            ['What is Petroleu?', 'Petroleu is petrol pump management software for fuel stations in Pakistan.'],
            ['How does pricing work?', 'Plans are available monthly and yearly. Contact sales for multi-station quotes.'],
            ['Is training included?', 'Yes. Setup guidance and training are part of onboarding.'],
            ['Can I request a demo?', 'Yes. Use the contact form or WhatsApp on the website.'],
        ];
        foreach ($faqs as $i => [$q, $a]) {
            CmsSection::create([
                'market_code' => 'pk',
                'locale_code' => 'en-PK',
                'page_slug' => 'faq',
                'section_key' => 'faq',
                'frontend_path' => '/faq',
                'title' => $q,
                'description' => $a,
                'content' => $a,
                'sort_order' => $i,
                'is_enabled' => true,
                'status' => 'published',
                'published_at' => now(),
                'data' => ['question' => $q, 'answer' => $a],
                'translation_status' => 'ready',
            ]);
        }
    }

    protected function seedAfghanistanDraftStructure(): void
    {
        $pages = [
            ['home', '/af', 'خانه'],
            ['features', '/af/features', 'ویژگی‌ها'],
            ['pricing', '/af/pricing', 'قیمت'],
            ['about', '/af/about', 'درباره'],
            ['contact', '/af/contact', 'تماس'],
            ['faq', '/af/faq', 'پرسش‌ها'],
            ['blog', '/af/blog', 'بلاگ'],
        ];

        foreach (['fa-AF', 'ps-AF', 'en-AF'] as $locale) {
            $prefix = $locale === 'fa-AF' ? '/af' : ($locale === 'ps-AF' ? '/af/ps' : '/af/en');
            foreach ($pages as [$slug, $_, $titleFa]) {
                $path = $slug === 'home' ? $prefix : $prefix.'/'.$slug;
                $title = match ($locale) {
                    'en-AF' => '[Translation required] '.Str::headline($slug),
                    'ps-AF' => '[Translation required] '.$titleFa,
                    default => '[Translation required] '.$titleFa,
                };

                CmsPage::updateOrCreate(
                    ['market_code' => 'af', 'locale_code' => $locale, 'slug' => $slug],
                    [
                        'title' => $title,
                        'description' => 'Afghanistan draft — professional translation required. Not published.',
                        'frontend_path' => $path,
                        'is_enabled' => false,
                        'status' => 'draft',
                        'translation_status' => 'translation_required',
                        'published_at' => null,
                    ]
                );

                CmsSection::updateOrCreate(
                    [
                        'market_code' => 'af',
                        'locale_code' => $locale,
                        'page_slug' => $slug,
                        'section_key' => 'hero',
                        'sort_order' => 0,
                    ],
                    [
                        'title' => $title,
                        'description' => 'Translation required — unpublished Afghanistan draft. Do not use Iranian Persian as approved Dari.',
                        'frontend_path' => $path,
                        'status' => 'draft',
                        'is_enabled' => false,
                        'translation_status' => 'translation_required',
                        'data' => [
                            'badge' => 'Petroleu Afghanistan',
                            'title_highlight' => $locale === 'en-AF' ? 'Afghanistan' : 'افغانستان',
                            'translation_required' => true,
                        ],
                    ]
                );

                CmsSeoEntry::updateOrCreate(
                    ['market_code' => 'af', 'locale_code' => $locale, 'path' => $path],
                    [
                        'title' => $title.' | Petroleu',
                        'description' => 'Afghanistan market page — draft, translation required, noindex until published.',
                        'canonical_url' => 'https://petroleu.com'.$path,
                        'og_locale' => str_replace('-', '_', $locale),
                        'noindex' => true,
                        'status' => 'draft',
                        'hreflang' => [
                            ['hreflang' => 'fa-af', 'href' => 'https://petroleu.com/af'],
                            ['hreflang' => 'ps-af', 'href' => 'https://petroleu.com/af/ps'],
                            ['hreflang' => 'en-af', 'href' => 'https://petroleu.com/af/en'],
                            ['hreflang' => 'x-default', 'href' => 'https://petroleu.com/'],
                        ],
                    ]
                );
            }

            // Draft AF header nav
            CmsNavigationItem::updateOrCreate(
                [
                    'market_code' => 'af',
                    'locale_code' => $locale,
                    'location' => 'header',
                    'label' => $locale === 'en-AF' ? 'Home' : 'خانه',
                    'url' => $prefix,
                ],
                [
                    'menu_group' => 'primary',
                    'sort_order' => 0,
                    'is_enabled' => true,
                    'status' => 'draft',
                ]
            );
        }

        CmsSetting::updateOrCreate(
            ['market_code' => 'af', 'locale_code' => null, 'key' => 'currency'],
            ['value' => 'AFN', 'type' => 'text', 'label' => 'Currency', 'grp' => 'regional']
        );
        CmsSetting::updateOrCreate(
            ['market_code' => 'af', 'locale_code' => null, 'key' => 'translation_note'],
            ['value' => 'Professional Afghan Dari and Pashto translations required before publish. Do not use Iranian Persian as approved Dari.', 'type' => 'textarea', 'label' => 'Translation note', 'grp' => 'general']
        );
    }
}
