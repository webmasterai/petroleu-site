<?php

namespace Database\Seeders;

use App\Models\Cms\CmsNavigationItem;
use App\Models\Cms\CmsPage;
use App\Models\Cms\CmsSection;
use App\Models\Cms\CmsSeoEntry;
use App\Models\Cms\CmsSetting;
use Illuminate\Database\Seeder;

/**
 * Apply professional Afghan Dari (fa-AF) and Pashto (ps-AF) translations
 * onto existing Afghanistan CMS rows. Does not touch Pakistan content.
 */
class CmsAfghanistanLocaleTranslationsSeeder extends Seeder
{
    protected array $maps = [];

    public function run(): void
    {
        $path = database_path('seeders/data/af_locale_string_maps.json');
        $this->maps = json_decode(file_get_contents($path), true) ?: [];

        $this->translateLocale('fa-AF', 'fa', '/af');
        $this->translateLocale('ps-AF', 'ps', '/af/ps');
        $this->seedLocaleSettings();
        $this->sanitizeAfghanistanContactLeakage();
        $this->unpublishUnverifiedSocialProof();
    }

    protected function translateLocale(string $locale, string $mapKey, string $prefix): void
    {
        $map = $this->maps[$mapKey] ?? [];

        CmsPage::where('market_code', 'af')->where('locale_code', $locale)->each(function (CmsPage $page) use ($map, $prefix) {
            $page->title = $this->t($page->title, $map);
            $page->description = $this->t((string) $page->description, $map);
            $path = $page->slug === 'home'
                ? $prefix
                : ($page->slug === 'product-reports'
                    ? $prefix.'/product/reports'
                    : $prefix.'/'.ltrim((string) ($page->frontend_path ?: $page->slug), '/'));
            // Normalize path away from /af/en
            $path = preg_replace('#^/af/en#', $prefix === '/af' ? '/af' : $prefix, (string) $page->frontend_path) ?: $path;
            if ($page->slug === 'home') {
                $path = $prefix;
            } elseif ($page->slug === 'product-reports') {
                $path = $prefix.'/product/reports';
            } else {
                $path = $prefix.'/'.$page->slug;
            }
            $page->frontend_path = $path;
            $page->translation_status = 'needs_review';
            $page->status = 'published';
            $page->published_at = $page->published_at ?: now();
            $page->save();
        });

        CmsSection::where('market_code', 'af')->where('locale_code', $locale)->each(function (CmsSection $section) use ($map, $prefix) {
            // Skip incomplete placeholder blog/legal shells that still say translation required
            $blob = strtolower(($section->title ?? '').' '.($section->description ?? ''));
            if (str_contains($blob, '[translation required]') || str_contains($blob, 'translation required — unpublished')) {
                $section->status = 'draft';
                $section->published_at = null;
                $section->translation_status = 'needs_review';
                $section->title = $this->t(preg_replace('/^\[Translation required\]\s*/i', '', (string) $section->title) ?: $section->title, $map);
                $section->description = $this->t((string) $section->description, $map);
                $section->save();

                return;
            }

            $section->title = $this->t($section->title, $map);
            $section->description = $this->t($section->description, $map);
            $section->content = $this->t($section->content, $map);
            $section->link_label = $this->t($section->link_label, $map);
            $section->image_alt = $this->t($section->image_alt, $map);
            $section->link_url = $this->remapUrl($section->link_url, $prefix);
            $section->frontend_path = $this->remapUrl($section->frontend_path, $prefix);
            if (is_array($section->data)) {
                $section->data = $this->walk($section->data, $map, $prefix);
            }
            if ($section->section_key === 'hero') {
                $data = is_array($section->data) ? $section->data : [];
                if (empty($data['cta_text'])) {
                    $data['cta_text'] = $this->t('See it in Action', $map);
                }
                if (empty($data['cta2_text'])) {
                    $data['cta2_text'] = $this->t('View Pricing', $map);
                }
                $section->data = $data;
            }
            $section->translation_status = 'needs_review';
            $section->status = 'published';
            $section->published_at = $section->published_at ?: now();
            $section->save();
        });

        CmsNavigationItem::where('market_code', 'af')->where('locale_code', $locale)->each(function (CmsNavigationItem $item) use ($map, $prefix) {
            $item->label = $this->t($item->label, $map);
            $item->url = $this->remapUrl($item->url, $prefix);
            $item->status = 'published';
            $item->published_at = $item->published_at ?: now();
            $item->save();
        });

        CmsSeoEntry::where('market_code', 'af')->where('locale_code', $locale)->each(function (CmsSeoEntry $seo) use ($map, $prefix) {
            $seo->title = $this->t(preg_replace('/^\[Translation required\]\s*/i', '', (string) $seo->title), $map);
            $seo->description = $this->t((string) $seo->description, $map);
            if (str_contains(strtolower((string) $seo->description), 'translation required')) {
                $seo->description = $this->t('Fuel station management software for Afghanistan — stock, nozzle sales, credit, and reports.', $map);
            }
            $seo->og_title = $this->t($seo->og_title, $map) ?: $seo->title;
            $seo->og_description = $this->t($seo->og_description, $map) ?: $seo->description;
            $seo->path = $this->remapUrl($seo->path, $prefix) ?: $prefix;
            $seo->canonical_url = 'https://petroleu.com'.($seo->path ?: $prefix);
            $seo->og_locale = str_replace('-', '_', $seo->locale_code);
            $seo->noindex = false;
            $seo->status = 'published';
            $seo->published_at = $seo->published_at ?: now();
            $seo->save();
        });
    }

    protected function seedLocaleSettings(): void
    {
        $pairs = [
            'fa-AF' => [
                'site_tagline' => 'نرم‌افزار مدرن مدیریت پمپ تیل برای افغانستان.',
                'footer_description' => 'Petroleu به مالکان پمپ تیل کمک می‌کند فروش نوزل، موجودی تانک، اعتبار و گزارش‌دهی را از یک سیستم اداره کنند.',
                'announcement_text' => 'Petroleu — نرم‌افزار پمپ تیل برای افغانستان',
                'footer_credit' => 'Petroleu',
                'ui_see_demo' => 'در عمل ببینید',
                'ui_view_pricing' => 'دیدن قیمت‌ها',
                'ui_resources' => 'منابع',
                'ui_product' => 'محصول',
                'ui_company' => 'شرکت',
                'ui_legal' => 'حقوقی',
                'ui_login' => 'ورود',
                'ui_start_trial' => 'آغاز آزمایش رایگان',
            ],
            'ps-AF' => [
                'site_tagline' => 'د افغانستان لپاره عصري د تیل پمپ مدیریت سافټویر.',
                'footer_description' => 'Petroleu د تیل پمپ مالکانو سره مرسته کوي چې نوزل پلور، ټانک موجودي، اعتبار او راپورونه له یوه سیستم اداره کړي.',
                'announcement_text' => 'Petroleu — د افغانستان لپاره د تیل پمپ سافټویر',
                'footer_credit' => 'Petroleu',
                'ui_see_demo' => 'په عمل کې وګورئ',
                'ui_view_pricing' => 'بیې وګورئ',
                'ui_resources' => 'سرچینې',
                'ui_product' => 'محصول',
                'ui_company' => 'شرکت',
                'ui_legal' => 'حقوقي',
                'ui_login' => 'ننوتل',
                'ui_start_trial' => 'وړیا ازموینه پیل کړئ',
            ],
            'en-AF' => [
                'site_tagline' => 'Modern fuel station management software for Afghanistan.',
                'footer_description' => 'Petroleu helps fuel station owners run nozzle sales, tank stock, credit, and reporting from one system.',
                'announcement_text' => 'Petroleu — Fuel station software for Afghanistan',
                'footer_credit' => 'Petroleu',
                'ui_see_demo' => 'See it in Action',
                'ui_view_pricing' => 'View Pricing',
                'ui_resources' => 'Resources',
                'ui_product' => 'Product',
                'ui_company' => 'Company',
                'ui_legal' => 'Legal',
                'ui_login' => 'Login',
                'ui_start_trial' => 'Start Free Trial',
            ],
        ];

        foreach ($pairs as $locale => $settings) {
            foreach ($settings as $key => $value) {
                CmsSetting::updateOrCreate(
                    ['market_code' => 'af', 'locale_code' => $locale, 'key' => $key],
                    ['value' => $value, 'type' => 'text', 'label' => $key, 'grp' => 'ui', 'is_shared' => false]
                );
            }
        }
    }

    protected function sanitizeAfghanistanContactLeakage(): void
    {
        // Clear PK WhatsApp / phone leakage from AF section data and settings
        CmsSection::where('market_code', 'af')->each(function (CmsSection $section) {
            $changed = false;
            if (is_string($section->link_url) && str_contains($section->link_url, '923257865000')) {
                $section->link_url = null;
                $changed = true;
            }
            if (is_array($section->data)) {
                $data = $section->data;
                array_walk_recursive($data, function (&$v) use (&$changed) {
                    if (is_string($v) && (str_contains($v, '923257865000') || str_contains($v, 'Karachi') || str_contains($v, 'Pakistan'))) {
                        if (str_contains($v, '923257865000') || str_starts_with($v, 'https://wa.me/')) {
                            $v = null;
                            $changed = true;
                        } elseif (str_contains($v, 'Pakistan') || str_contains($v, 'Karachi')) {
                            $v = str_replace(['Pakistan', 'Karachi', 'Lahore', 'Islamabad'], ['Afghanistan', 'Afghanistan', 'Afghanistan', 'Afghanistan'], $v);
                            $changed = true;
                        }
                    }
                });
                $section->data = $data;
            }
            if ($changed) {
                $section->save();
            }
        });

        CmsSetting::where('market_code', 'af')->whereIn('key', ['phone', 'phone_tel', 'whatsapp', 'address'])->update(['value' => '']);
    }

    protected function unpublishUnverifiedSocialProof(): void
    {
        // Do not invent / show PK testimonials on AF until market-approved
        CmsSection::where('market_code', 'af')
            ->whereIn('section_key', ['testimonial', 'logo', 'supported-brand'])
            ->update([
                'status' => 'draft',
                'published_at' => null,
                'translation_status' => 'needs_review',
            ]);

        // Pricing plans may carry inherited PK commercial figures — keep as draft until AF sales approve
        CmsSection::where('market_code', 'af')
            ->where('section_key', 'plan')
            ->update([
                'status' => 'draft',
                'published_at' => null,
                'translation_status' => 'needs_review',
            ]);
    }

    protected function t(?string $text, array $map): ?string
    {
        if ($text === null) {
            return null;
        }
        $trim = trim($text);
        if ($trim === '') {
            return $text;
        }
        if (isset($map[$trim])) {
            return $map[$trim];
        }
        // Strip translation-required prefix then retry
        $clean = preg_replace('/^\[Translation required\]\s*/i', '', $trim);
        if ($clean !== $trim && isset($map[$clean])) {
            return $map[$clean];
        }

        return $text;
    }

    protected function walk(mixed $value, array $map, string $prefix): mixed
    {
        if (is_string($value)) {
            if (str_starts_with($value, '/') || str_starts_with($value, 'http')) {
                return $this->remapUrl($value, $prefix);
            }

            return $this->t($value, $map) ?? $value;
        }
        if (is_array($value)) {
            $out = [];
            foreach ($value as $k => $v) {
                $out[$k] = $this->walk($v, $map, $prefix);
            }

            return $out;
        }

        return $value;
    }

    protected function remapUrl(?string $url, string $prefix): ?string
    {
        if ($url === null || $url === '') {
            return $url;
        }
        if (str_starts_with($url, 'https://wa.me/923') || str_contains($url, '923257865000')) {
            return null;
        }
        if (str_starts_with($url, 'http') || str_starts_with($url, 'mailto:') || str_starts_with($url, 'tel:')) {
            return $url;
        }
        $url = preg_replace('#^/af/en#', $prefix === '/af' ? '/af' : $prefix, $url);
        $url = preg_replace('#^/af/ps#', $prefix === '/af/ps' ? '/af/ps' : $prefix, $url);
        $url = preg_replace('#^/af(?!/ps|/en)#', $prefix === '/af' ? '/af' : $prefix, $url);
        if ($url === '/' || $url === '') {
            return $prefix;
        }
        if (str_starts_with($url, '/#') ) {
            return $prefix.$url;
        }
        if (str_starts_with($url, '#') ) {
            return $prefix.'/'.$url;
        }
        if (preg_match('#^/(features|pricing|faq|about|blog|contact|analytics|docs|developers|industries|get-started|privacy-policy|product)#', $url)) {
            return $prefix.$url;
        }

        return $url;
    }
}
