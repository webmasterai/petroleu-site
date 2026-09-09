<?php

namespace Database\Seeders;

use App\Models\Cms\CmsNavigationItem;
use App\Models\Cms\CmsPage;
use App\Models\Cms\CmsSection;
use App\Models\Cms\CmsSeoEntry;
use App\Models\Cms\CmsSetting;
use App\Support\MarketContentResolver;
use Illuminate\Database\Seeder;

/**
 * Clone published Pakistan content into Afghanistan locales so /af renders
 * the full Petroleu site. en-AF is adapted English; fa-AF/ps-AF are published
 * with translation_status=needs_review (temporary English body until human Dari/Pashto).
 */
class CmsAfghanistanFullSiteSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedAfghanistanSettings();
        $this->clonePagesAndSections();
        $this->seedAfghanistanNavigation();
        $this->seedAfghanistanSeo();
    }

    protected function seedAfghanistanSettings(): void
    {
        $settings = [
            ['site_name', 'Petroleu', 'Site Name', 'general'],
            ['site_tagline', 'Modern fuel station management software for Afghanistan.', 'Site Tagline', 'general'],
            ['footer_description', 'Petroleu helps fuel station owners run nozzle sales, tank stock, credit, and reporting from one system.', 'Footer description', 'footer'],
            ['footer_credit', 'Petroleu', 'Footer credit line', 'footer'],
            ['country_label', 'Afghanistan', 'Country label', 'regional'],
            ['currency', 'AFN', 'Currency', 'regional'],
            ['sales_email', 'sales@petroleu.com', 'Sales Email', 'contact'],
            ['primary_email', 'support@petroleu.com', 'Support Email', 'contact'],
            ['contact_email', 'sales@petroleu.com', 'Contact Email', 'contact'],
            // Intentionally empty — hide when unset rather than leaking PK numbers/address
            ['phone', '', 'Phone', 'contact'],
            ['phone_tel', '', 'Phone tel', 'contact'],
            ['whatsapp', '', 'WhatsApp', 'contact'],
            ['address', '', 'Address', 'contact'],
            ['announcement_text', 'Petroleu — Fuel station software for Afghanistan', 'Announcement', 'header'],
            ['demo_admin_emails', env('CMS_AF_INQUIRY_RECIPIENTS', ''), 'Inquiry emails', 'demo'],
        ];

        foreach ($settings as [$key, $value, $label, $grp]) {
            CmsSetting::updateOrCreate(
                ['market_code' => 'af', 'locale_code' => null, 'key' => $key],
                ['value' => $value, 'type' => 'text', 'label' => $label, 'grp' => $grp, 'is_shared' => false]
            );
        }
    }

    protected function clonePagesAndSections(): void
    {
        $pkPages = CmsPage::where('market_code', 'pk')->where('locale_code', 'en-PK')->get();
        foreach (['en-AF', 'fa-AF', 'ps-AF'] as $locale) {
            foreach ($pkPages as $page) {
                $prefix = $locale === 'fa-AF' ? '/af' : ($locale === 'ps-AF' ? '/af/ps' : '/af/en');
                $path = $page->slug === 'home' ? $prefix : $prefix.'/'.ltrim($page->frontend_path ?: $page->slug, '/');
                if ($page->slug === 'product-reports') {
                    $path = $prefix.'/product/reports';
                }

                CmsPage::updateOrCreate(
                    ['market_code' => 'af', 'locale_code' => $locale, 'slug' => $page->slug],
                    [
                        'title' => MarketContentResolver::adaptPakistanTextToAfghanistan($page->title),
                        'description' => MarketContentResolver::adaptPakistanTextToAfghanistan((string) $page->description),
                        'template' => $page->template,
                        'frontend_path' => $path,
                        'sort_order' => $page->sort_order ?? 0,
                        'is_enabled' => true,
                        'status' => 'published',
                        'published_at' => now(),
                        'translation_status' => $locale === 'en-AF' ? 'ready' : 'needs_review',
                        'is_shared' => false,
                    ]
                );
            }
        }

        $pkSections = CmsSection::where('market_code', 'pk')
            ->where('locale_code', 'en-PK')
            ->where('status', 'published')
            ->get();

        foreach (['en-AF', 'fa-AF', 'ps-AF'] as $locale) {
            foreach ($pkSections as $section) {
                $data = $section->data;
                if (is_array($data)) {
                    array_walk_recursive($data, function (&$v) {
                        if (is_string($v)) {
                            $v = MarketContentResolver::adaptPakistanTextToAfghanistan($v);
                        }
                    });
                }

                $prefix = $locale === 'fa-AF' ? '/af' : ($locale === 'ps-AF' ? '/af/ps' : '/af/en');
                $frontend = $section->frontend_path
                    ? ($prefix.($section->frontend_path === '/' ? '' : $section->frontend_path))
                    : $prefix;

                CmsSection::updateOrCreate(
                    [
                        'market_code' => 'af',
                        'locale_code' => $locale,
                        'page_slug' => $section->page_slug,
                        'section_key' => $section->section_key,
                        'sort_order' => $section->sort_order,
                    ],
                    [
                        'title' => $section->title
                            ? MarketContentResolver::adaptPakistanTextToAfghanistan($section->title)
                            : null,
                        'description' => $section->description
                            ? MarketContentResolver::adaptPakistanTextToAfghanistan($section->description)
                            : null,
                        'content' => $section->content
                            ? MarketContentResolver::adaptPakistanTextToAfghanistan($section->content)
                            : null,
                        'data' => $data,
                        'image_url' => $section->image_url,
                        'image_alt' => $section->image_alt
                            ? MarketContentResolver::adaptPakistanTextToAfghanistan($section->image_alt)
                            : null,
                        'media_id' => $section->media_id,
                        'link_label' => $section->link_label,
                        'link_url' => $this->adaptLink($section->link_url, $prefix),
                        'frontend_path' => $frontend,
                        'is_enabled' => true,
                        'status' => 'published',
                        'published_at' => now(),
                        'translation_status' => $locale === 'en-AF' ? 'ready' : 'needs_review',
                        'is_shared' => false,
                    ]
                );
            }
        }
    }

    protected function adaptLink(?string $url, string $prefix): ?string
    {
        if (! $url) {
            return $url;
        }
        if (str_starts_with($url, 'http') || str_starts_with($url, 'mailto:') || str_starts_with($url, 'tel:') || str_starts_with($url, 'https://wa.me')) {
            return $url;
        }
        if ($url === '/' || $url === '') {
            return $prefix;
        }
        if (str_starts_with($url, '/af')) {
            return $url;
        }
        if (str_starts_with($url, '/#')) {
            return $prefix.$url;
        }
        if (str_starts_with($url, '#')) {
            return $prefix.'/'.$url;
        }
        if (str_starts_with($url, '/')) {
            return $prefix.$url;
        }

        return $url;
    }

    protected function seedAfghanistanNavigation(): void
    {
        CmsNavigationItem::where('market_code', 'af')->delete();

        $locales = [
            'fa-AF' => '/af',
            'ps-AF' => '/af/ps',
            'en-AF' => '/af/en',
        ];

        $items = [
            ['Features', '/features'],
            ['Pricing', '/pricing'],
            ['FAQ', '/faq'],
            ['Mobile App', '/#mobile'],
            ['About', '/about'],
            ['Blog', '/blog'],
            ['Contact', '/contact'],
        ];

        $resources = [
            ['Analytics', '/analytics'],
            ['Reports', '/product/reports'],
            ['FAQ', '/faq'],
            ['Docs', '/docs'],
        ];

        foreach ($locales as $locale => $prefix) {
            foreach ($items as $i => [$label, $path]) {
                CmsNavigationItem::create([
                    'market_code' => 'af',
                    'locale_code' => $locale,
                    'location' => 'header',
                    'menu_group' => 'primary',
                    'label' => $label,
                    'url' => $path === '/#mobile' ? $prefix.'/#mobile' : $prefix.$path,
                    'sort_order' => $i,
                    'is_enabled' => true,
                    'status' => 'published',
                    'published_at' => now(),
                ]);
            }
            foreach ($resources as $i => [$label, $path]) {
                CmsNavigationItem::create([
                    'market_code' => 'af',
                    'locale_code' => $locale,
                    'location' => 'mega',
                    'menu_group' => 'resources',
                    'label' => $label,
                    'url' => $prefix.$path,
                    'sort_order' => $i,
                    'is_enabled' => true,
                    'status' => 'published',
                    'published_at' => now(),
                ]);
            }
            CmsNavigationItem::create([
                'market_code' => 'af',
                'locale_code' => $locale,
                'location' => 'announcement',
                'menu_group' => 'announcement',
                'label' => 'Petroleu — Fuel station software for Afghanistan',
                'url' => null,
                'sort_order' => 0,
                'is_enabled' => true,
                'status' => 'published',
                'published_at' => now(),
            ]);
        }
    }

    protected function seedAfghanistanSeo(): void
    {
        $map = [
            'fa-AF' => '/af',
            'ps-AF' => '/af/ps',
            'en-AF' => '/af/en',
        ];
        foreach ($map as $locale => $path) {
            CmsSeoEntry::updateOrCreate(
                ['market_code' => 'af', 'locale_code' => $locale, 'path' => $path],
                [
                    'title' => 'Petroleu — Petrol Pump Software Afghanistan',
                    'description' => 'Fuel station management software for Afghanistan — stock, nozzle sales, credit, and reports.',
                    'canonical_url' => 'https://petroleu.com'.$path,
                    'og_title' => 'Petroleu Afghanistan',
                    'og_description' => 'Run your fuel station with Petroleu.',
                    'og_locale' => str_replace('-', '_', $locale),
                    'noindex' => false,
                    'status' => 'published',
                    'published_at' => now(),
                    'hreflang' => [
                        ['hreflang' => 'fa-af', 'href' => 'https://petroleu.com/af'],
                        ['hreflang' => 'ps-af', 'href' => 'https://petroleu.com/af/ps'],
                        ['hreflang' => 'en-af', 'href' => 'https://petroleu.com/af/en'],
                        ['hreflang' => 'en-pk', 'href' => 'https://petroleu.com/'],
                        ['hreflang' => 'x-default', 'href' => 'https://petroleu.com/'],
                    ],
                ]
            );
        }
    }
}
