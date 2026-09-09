<?php

namespace Database\Seeders;

use App\Models\Cms\CmsBlogPost;
use App\Models\Cms\CmsSection;
use App\Models\Cms\CmsSeoEntry;
use App\Models\Cms\CmsSetting;
use Illuminate\Database\Seeder;

/**
 * Completes Afghanistan CMS parity: section headings, demo blocks, pricing
 * (contact-quote), logos caption, blog shells, SEO, footer UI strings.
 * Does not invent customer testimonials or real AF contact details.
 */
class CmsAfghanistanParityCompletionSeeder extends Seeder
{
    protected array $maps = [];

    public function run(): void
    {
        $path = database_path('seeders/data/af_locale_string_maps.json');
        $this->maps = json_decode(file_get_contents($path), true) ?: [];

        $this->seedHeadings();
        $this->seedDemoBlocks();
        $this->publishNeutralPricingAndLogos();
        $this->seedBlogPosts();
        $this->seedFooterAndFormUi();
        $this->fixSeo();
        $this->seedPageHeadings();
        $this->seedDocsAndDevelopers();
        $this->seedInnerPageHeroes();
    }

    protected function locales(): array
    {
        return [
            'en-AF' => 'en',
            'fa-AF' => 'fa',
            'ps-AF' => 'ps',
        ];
    }

    protected function t(string $localeKey, string $en): string
    {
        if ($localeKey === 'en') {
            return $en;
        }
        $map = $this->maps[$localeKey] ?? [];

        return $map[$en] ?? $en;
    }

    protected function upsertHeading(string $locale, string $mapKey, string $key, array $en): void
    {
        $prefix = $locale === 'fa-AF' ? '/af' : ($locale === 'ps-AF' ? '/af/ps' : '/af/en');
        CmsSection::updateOrCreate(
            [
                'market_code' => 'af',
                'locale_code' => $locale,
                'page_slug' => 'home',
                'section_key' => 'heading:'.$key,
                'sort_order' => 0,
            ],
            [
                'title' => $this->t($mapKey, $en['title']),
                'description' => $this->t($mapKey, $en['subtitle']),
                'data' => [
                    'badge' => $this->t($mapKey, $en['eyebrow']),
                    'eyebrow' => $this->t($mapKey, $en['eyebrow']),
                ],
                'link_label' => isset($en['cta']) ? $this->t($mapKey, $en['cta']) : null,
                'link_url' => $en['cta_url'] ?? null,
                'frontend_path' => $prefix,
                'is_enabled' => true,
                'status' => 'published',
                'published_at' => now(),
                'translation_status' => $locale === 'en-AF' ? 'ready' : 'needs_review',
                'is_shared' => false,
            ]
        );
    }

    protected function seedHeadings(): void
    {
        $blocks = [
            'features' => [
                'eyebrow' => 'Features',
                'title' => 'Everything your petrol pump needs',
                'subtitle' => 'From nozzle readings to accounts — modules built for Afghanistan fuel stations.',
            ],
            'getting-started' => [
                'eyebrow' => 'Getting Started',
                'title' => 'Supported onboarding',
                'subtitle' => 'Training and setup help your team start with confidence.',
                'cta' => 'Get Started',
                'cta_url' => '/get-started',
            ],
            'industries' => [
                'eyebrow' => 'Industries',
                'title' => 'Built for fuel businesses',
                'subtitle' => 'Independent pumps, dealer networks, and multi-station operators who need reliable daily closing and stock control.',
            ],
            'mobile' => [
                'eyebrow' => 'Mobile App',
                'title' => 'Mobile Owner Dashboard',
                'subtitle' => 'Check sales, stock, cash, credit, and reports from mobile without staying at the station all day.',
            ],
            'analytics' => [
                'eyebrow' => 'Analytics',
                'title' => 'Sales Analytics',
                'subtitle' => 'Use smart reports to review station performance, stock movement, receivables, and business trends.',
            ],
            'faq' => [
                'eyebrow' => 'FAQ',
                'title' => 'Common Questions',
                'subtitle' => 'Everything your petrol pump needs',
            ],
            'pricing' => [
                'eyebrow' => 'Pricing',
                'title' => 'Plans are available monthly and yearly. Contact sales for multi-station quotes.',
                'subtitle' => 'Plans are available monthly and yearly. Contact sales for multi-station quotes.',
            ],
            'testimonials' => [
                'eyebrow' => 'Testimonials',
                'title' => 'Work with the Petroleu team',
                'subtitle' => 'We help fuel stations across Afghanistan run cleaner daily operations.',
            ],
            'blog' => [
                'eyebrow' => 'Blog',
                'title' => 'Latest From Petroleu',
                'subtitle' => 'Guides and product updates for fuel station operators.',
                'cta' => 'View All Resources',
            ],
            'invoice' => [
                'eyebrow' => 'Invoicing',
                'title' => 'Cash & Credit Sales',
                'subtitle' => 'Separate cash sales, credit sales, card sales, and bulk sales so daily closing stays clear and easy to verify.',
                'cta' => 'View Pricing',
                'cta_url' => '/pricing',
            ],
            'reports' => [
                'eyebrow' => 'Reports',
                'title' => 'Daily Closing Reports',
                'subtitle' => 'Review sales, stock, cash, credit, expenses, and shift-wise closing reports from one dashboard.',
                'cta' => 'See every module in action',
                'cta_url' => '/features',
            ],
            'why-choose' => [
                'eyebrow' => 'Why Petroleu',
                'title' => 'Built for Afghanistan pumps',
                'subtitle' => 'Workflows match local nozzle, dipping, and credit practices.',
            ],
            'logos' => [
                'eyebrow' => 'Partners',
                'title' => 'Trusted oil marketing companies',
                'subtitle' => 'Trusted brands strip',
            ],
        ];

        // Extend translation maps in-memory for new English phrases
        $extraFa = [
            'Features' => 'امکانات',
            'Getting Started' => 'شروع کار',
            'Built for fuel businesses' => 'ساخته‌شده برای تجارت‌های تیل',
            'Industries' => 'صنایع',
            'Common Questions' => 'پرسش‌های رایج',
            'Invoicing' => 'بل‌دهی',
            'Why Petroleu' => 'چرا Petroleu',
            'Partners' => 'شرکا',
            'Latest From Petroleu' => 'تازه‌ها از Petroleu',
            'Guides and product updates for fuel station operators.' => 'راهنماها و به‌روزرسانی محصول برای اپراتورهای پمپ تیل.',
            'Monthly' => 'ماهانه',
            'Yearly' => 'سالانه',
            'Contact Sales' => 'تماس با فروش',
            'Most Popular' => 'محبوب‌ترین',
            'Save 2 Months' => '۲ ماه صرفه‌جویی',
            'Custom quote' => 'پیشنهاد سفارشی',
            'Contact us for Afghanistan pricing.' => 'برای قیمت‌گذاری افغانستان با ما تماس بگیرید.',
            'Privacy Policy' => 'سیاست حریم خصوصی',
            'Admin Login' => 'ورود مدیر',
            'Available on both Android and iOS' => 'موجود برای Android و iOS',
            'STEP' => 'گام',
            'Ready to start?' => 'آماده شروع هستید؟',
            'Start Free Trial' => 'آغاز آزمایش رایگان',
            'Sample Fuel Station' => 'پمپ تیل نمونه',
            'Sample invoice preview' => 'پیش‌نمایش بل نمونه',
            'Credit Account' => 'حساب اعتباری',
            'Tank dipping sample' => 'نمونه دیپ تانک',
            'Nozzle readings sample' => 'نمونه قرائت نوزل',
            'View All Resources' => 'مشاهده همه منابع',
            'FUEL INVOICE' => 'بل تیل',
            'Date' => 'تاریخ',
            'Customer' => 'مشتری',
            'Amount Due' => 'مبلغ قابل پرداخت',
            'Vehicle' => 'موتر',
            'Fuel' => 'تیل',
            'Qty (L)' => 'مقدار (ل)',
            'Amount' => 'مبلغ',
            'Subtotal' => 'جمع فرعی',
            'Previous Balance' => 'بیلانس قبلی',
            'Total' => 'مجموع',
            'Print' => 'چاپ',
            'Tank' => 'تانک',
            'Nozzle' => 'نوزل',
            'Tank Dipping Report' => 'گزارش دیپ تانک',
            'Track fuel stock levels across all tanks with variance detection.' => 'سطح موجودی تیل را در همه تانک‌ها با تشخیص تفاوت پیگیری کنید.',
            'Daily Tank Summary' => 'خلاصه روزانه تانک',
            'Nozzle Readings' => 'قرائت نوزل',
            'Track sales from each nozzle with opening and closing readings.' => 'فروش هر نوزل را با قرائت آغاز و پایان پیگیری کنید.',
            'Shift-wise Readings' => 'قرائت بر اساس شیفت',
            'TANK' => 'تانک',
            'OPEN' => 'آغاز',
            'RECV' => 'رسید',
            'SALES' => 'فروش',
            'CLOSE' => 'پایان',
            'VAR' => 'تفاوت',
            'NOZZLE' => 'نوزل',
            'SALES (L)' => 'فروش (ل)',
            'AMOUNT' => 'مبلغ',
            'Access all reports anytime, anywhere' => 'همه گزارش‌ها را هر زمان و هر جا ببینید',
            'See every module in action' => 'همه ماژول‌ها را در عمل ببینید',
        ];
        $extraPs = [
            'Features' => 'ځانګړتیاوې',
            'Getting Started' => 'پیل',
            'Built for fuel businesses' => 'د تیل سوداګریو لپاره جوړ شوی',
            'Industries' => 'صنایع',
            'Common Questions' => 'عامې پوښتنې',
            'Invoicing' => 'بل ورکول',
            'Why Petroleu' => 'ولې Petroleu',
            'Partners' => 'شریکان',
            'Latest From Petroleu' => 'د Petroleu تازه خبرونه',
            'Guides and product updates for fuel station operators.' => 'د تیل پمپ چلوونکو لپاره لارښودونه او محصول تازه معلومات.',
            'Monthly' => 'میاشتنی',
            'Yearly' => 'کلنی',
            'Contact Sales' => 'له پلور سره اړیکه',
            'Most Popular' => 'ډېر مشهور',
            'Save 2 Months' => '۲ میاشتې سپما',
            'Custom quote' => 'دودیز وړاندیز',
            'Contact us for Afghanistan pricing.' => 'د افغانستان بیو لپاره له موږ سره اړیکه ونیسئ.',
            'Privacy Policy' => 'د محرمیت تګلاره',
            'Admin Login' => 'د مدیر ننوتل',
            'Available on both Android and iOS' => 'په Android او iOS دواړو شته',
            'STEP' => 'ګام',
            'Ready to start?' => 'چمتو یاست چې پیل کړئ؟',
            'Start Free Trial' => 'وړیا ازموینه پیل کړئ',
            'Sample Fuel Station' => 'د نمونې تیل پمپ',
            'Sample invoice preview' => 'د نمونې بل مخکتنه',
            'Credit Account' => 'اعتباري حساب',
            'Tank dipping sample' => 'د ټانک ډیپ نمونه',
            'Nozzle readings sample' => 'د نوزل لوستلو نمونه',
            'View All Resources' => 'ټولې سرچینې وګورئ',
            'FUEL INVOICE' => 'د تیل بل',
            'Date' => 'نېټه',
            'Customer' => 'پیرودونکی',
            'Amount Due' => 'د ورکړې وړ مبلغ',
            'Vehicle' => 'موټر',
            'Fuel' => 'تیل',
            'Qty (L)' => 'مقدار (ل)',
            'Amount' => 'مبلغ',
            'Subtotal' => 'فرعي مجموعه',
            'Previous Balance' => 'پخوانی بیلانس',
            'Total' => 'ټول',
            'Print' => 'چاپ',
            'Tank' => 'ټانک',
            'Nozzle' => 'نوزل',
            'Tank Dipping Report' => 'د ټانک ډیپ راپور',
            'Track fuel stock levels across all tanks with variance detection.' => 'په ټولو ټانکونو کې د تیل موجودي د توپیر کشف سره تعقیب کړئ.',
            'Daily Tank Summary' => 'د ورځني ټانک لنډیز',
            'Nozzle Readings' => 'د نوزل لوستل',
            'Track sales from each nozzle with opening and closing readings.' => 'د هر نوزل پلور د پرانیست او تړلو لوستلو سره تعقیب کړئ.',
            'Shift-wise Readings' => 'د شفټ لوستل',
            'TANK' => 'ټانک',
            'OPEN' => 'پرانیست',
            'RECV' => 'ترلاسه',
            'SALES' => 'پلور',
            'CLOSE' => 'تړل',
            'VAR' => 'توپیر',
            'NOZZLE' => 'نوزل',
            'SALES (L)' => 'پلور (ل)',
            'AMOUNT' => 'مبلغ',
            'Access all reports anytime, anywhere' => 'ټول راپورونه هر وخت او هرځای وګورئ',
            'See every module in action' => 'هر ماډیول په عمل کې وګورئ',
        ];
        $this->maps['fa'] = array_merge($this->maps['fa'] ?? [], $extraFa);
        $this->maps['ps'] = array_merge($this->maps['ps'] ?? [], $extraPs);

        foreach ($this->locales() as $locale => $mapKey) {
            foreach ($blocks as $key => $en) {
                $this->upsertHeading($locale, $mapKey, $key, $en);
            }
        }
    }

    protected function seedDemoBlocks(): void
    {
        foreach ($this->locales() as $locale => $mapKey) {
            $prefix = $locale === 'fa-AF' ? '/af' : ($locale === 'ps-AF' ? '/af/ps' : '/af/en');

            CmsSection::updateOrCreate(
                [
                    'market_code' => 'af',
                    'locale_code' => $locale,
                    'page_slug' => 'home',
                    'section_key' => 'demo:invoice',
                    'sort_order' => 0,
                ],
                [
                    'title' => $this->t($mapKey, 'Cash & Credit Sales'),
                    'description' => $this->t($mapKey, 'Separate cash sales, credit sales, card sales, and bulk sales so daily closing stays clear and easy to verify.'),
                    'data' => [
                        'badge' => $this->t($mapKey, 'Invoicing'),
                        'stationName' => $this->t($mapKey, 'Sample Fuel Station'),
                        'stationAddress' => '',
                        'invoiceNumber' => 'INV-DEMO-001',
                        'date' => '2026-01-15',
                        'customerName' => $this->t($mapKey, 'Credit Account'),
                        'customerAccount' => '#DEMO',
                        'amountDue' => '—',
                        'rows' => [
                            ['vehicle' => 'VEH-01', 'fuel' => 'HSD', 'qty' => '250', 'amount' => '—'],
                            ['vehicle' => 'VEH-02', 'fuel' => 'Petrol', 'qty' => '40', 'amount' => '—'],
                        ],
                        'subtotal' => '—',
                        'previousBalance' => '—',
                        'total' => '—',
                        'is_sample' => true,
                        'labels' => [
                            'badge' => $this->t($mapKey, 'FUEL INVOICE'),
                            'date' => $this->t($mapKey, 'Date'),
                            'customer' => $this->t($mapKey, 'Customer'),
                            'amountDue' => $this->t($mapKey, 'Amount Due'),
                            'vehicle' => $this->t($mapKey, 'Vehicle'),
                            'fuel' => $this->t($mapKey, 'Fuel'),
                            'qty' => $this->t($mapKey, 'Qty (L)'),
                            'amount' => $this->t($mapKey, 'Amount'),
                            'subtotal' => $this->t($mapKey, 'Subtotal'),
                            'previousBalance' => $this->t($mapKey, 'Previous Balance'),
                            'total' => $this->t($mapKey, 'Total'),
                            'print' => $this->t($mapKey, 'Print'),
                            'pdf' => 'PDF',
                            'whatsapp' => 'WhatsApp',
                        ],
                    ],
                    'link_label' => $this->t($mapKey, 'View Pricing'),
                    'link_url' => $prefix.'/pricing',
                    'frontend_path' => $prefix,
                    'is_enabled' => true,
                    'status' => 'published',
                    'published_at' => now(),
                    'translation_status' => $locale === 'en-AF' ? 'ready' : 'needs_review',
                ]
            );

            CmsSection::updateOrCreate(
                [
                    'market_code' => 'af',
                    'locale_code' => $locale,
                    'page_slug' => 'home',
                    'section_key' => 'demo:reports',
                    'sort_order' => 0,
                ],
                [
                    'title' => $this->t($mapKey, 'Daily Closing Reports'),
                    'description' => $this->t($mapKey, 'Review sales, stock, cash, credit, expenses, and shift-wise closing reports from one dashboard.'),
                    'data' => [
                        'badge' => $this->t($mapKey, 'Reports'),
                        'tankDipping' => [
                            ['tank' => $this->t($mapKey, 'Tank').' 1', 'opening' => '—', 'received' => '—', 'sales' => '—', 'closing' => '—', 'variance' => '—'],
                            ['tank' => $this->t($mapKey, 'Tank').' 2', 'opening' => '—', 'received' => '—', 'sales' => '—', 'closing' => '—', 'variance' => '—'],
                        ],
                        'nozzleReadings' => [
                            ['nozzle' => $this->t($mapKey, 'Nozzle').' 1', 'opening' => '—', 'closing' => '—', 'sales' => '—', 'amount' => '—'],
                            ['nozzle' => $this->t($mapKey, 'Nozzle').' 2', 'opening' => '—', 'closing' => '—', 'sales' => '—', 'amount' => '—'],
                        ],
                        'is_sample' => true,
                        'labels' => [
                            'tankTitle' => $this->t($mapKey, 'Tank Dipping Report'),
                            'tankSubtitle' => $this->t($mapKey, 'Track fuel stock levels across all tanks with variance detection.'),
                            'tankBadge' => $this->t($mapKey, 'Daily Tank Summary'),
                            'nozzleTitle' => $this->t($mapKey, 'Nozzle Readings'),
                            'nozzleSubtitle' => $this->t($mapKey, 'Track sales from each nozzle with opening and closing readings.'),
                            'nozzleBadge' => $this->t($mapKey, 'Shift-wise Readings'),
                            'tank' => $this->t($mapKey, 'TANK'),
                            'open' => $this->t($mapKey, 'OPEN'),
                            'recv' => $this->t($mapKey, 'RECV'),
                            'sales' => $this->t($mapKey, 'SALES'),
                            'close' => $this->t($mapKey, 'CLOSE'),
                            'var' => $this->t($mapKey, 'VAR'),
                            'nozzle' => $this->t($mapKey, 'NOZZLE'),
                            'salesL' => $this->t($mapKey, 'SALES (L)'),
                            'amount' => $this->t($mapKey, 'AMOUNT'),
                            'accessNote' => $this->t($mapKey, 'Access all reports anytime, anywhere'),
                        ],
                    ],
                    'link_label' => $this->t($mapKey, 'See every module in action'),
                    'link_url' => $prefix.'/features',
                    'frontend_path' => $prefix,
                    'is_enabled' => true,
                    'status' => 'published',
                    'published_at' => now(),
                    'translation_status' => $locale === 'en-AF' ? 'ready' : 'needs_review',
                ]
            );
        }
    }

    protected function publishNeutralPricingAndLogos(): void
    {
        foreach ($this->locales() as $locale => $mapKey) {
            // Logos: publish image strip; caption via heading:logos (no Pakistan claim)
            CmsSection::where('market_code', 'af')
                ->where('locale_code', $locale)
                ->where('section_key', 'logo')
                ->update([
                    'status' => 'published',
                    'published_at' => now(),
                    'is_enabled' => true,
                    'title' => $this->t($mapKey, 'Trusted logos'),
                    'description' => $this->t($mapKey, 'Trusted brands strip'),
                    'translation_status' => $locale === 'en-AF' ? 'ready' : 'needs_review',
                ]);

            // Supported brands: publish brand labels (OMC names stay Latin)
            CmsSection::where('market_code', 'af')
                ->where('locale_code', $locale)
                ->where('section_key', 'supported-brand')
                ->update([
                    'status' => 'published',
                    'published_at' => now(),
                    'is_enabled' => true,
                    'translation_status' => $locale === 'en-AF' ? 'ready' : 'needs_review',
                ]);

            // Pricing: publish plans but neutralize currency/amounts — contact quote only
            CmsSection::where('market_code', 'af')
                ->where('locale_code', $locale)
                ->where('section_key', 'plan')
                ->each(function (CmsSection $plan) use ($mapKey, $locale) {
                    $data = is_array($plan->data) ? $plan->data : [];
                    $data['price'] = $this->t($mapKey, 'Custom quote');
                    $data['price_yearly'] = $this->t($mapKey, 'Custom quote');
                    $data['currency'] = '';
                    $data['contact_only'] = true;
                    if (isset($data['features']) && is_array($data['features'])) {
                        $data['features'] = array_map(function ($f) use ($mapKey) {
                            if (is_string($f)) {
                                return $this->t($mapKey, $f);
                            }
                            if (is_array($f) && isset($f['feature_text'])) {
                                $f['feature_text'] = $this->t($mapKey, $f['feature_text']);
                            }

                            return $f;
                        }, $data['features']);
                    }
                    $plan->title = $this->t($mapKey, (string) $plan->title);
                    $plan->description = $this->t($mapKey, (string) $plan->description);
                    $plan->data = $data;
                    $plan->status = 'published';
                    $plan->published_at = now();
                    $plan->is_enabled = true;
                    $plan->translation_status = $locale === 'en-AF' ? 'ready' : 'needs_review';
                    $plan->save();
                });

            // Testimonials remain draft — no invented customers
            // Stats: draft PK-cloned customer counts / review claims (do not invent AF stats)
            CmsSection::where('market_code', 'af')
                ->where('locale_code', $locale)
                ->where('section_key', 'stat')
                ->update([
                    'status' => 'draft',
                    'is_enabled' => false,
                    'published_at' => null,
                    'translation_status' => 'needs_review',
                ]);
        }
    }

    protected function seedBlogPosts(): void
    {
        $pkPosts = CmsBlogPost::where('market_code', 'pk')->where('locale_code', 'en-PK')->where('status', 'published')->get();
        foreach ($this->locales() as $locale => $mapKey) {
            foreach ($pkPosts as $i => $post) {
                $title = $locale === 'en-AF'
                    ? str_replace(['Pakistan', 'Pakistani', 'Karachi', 'Lahore'], ['Afghanistan', 'Afghan', 'Afghanistan', 'Afghanistan'], (string) $post->title)
                    : ($this->t($mapKey, (string) $post->title) !== $post->title
                        ? $this->t($mapKey, (string) $post->title)
                        : ($mapKey === 'fa'
                            ? 'مقاله: '.str_replace(['Pakistan', 'Karachi'], ['افغانستان', 'افغانستان'], (string) $post->title)
                            : 'مقاله: '.str_replace(['Pakistan', 'Karachi'], ['افغانستان', 'افغانستان'], (string) $post->title)));

                // Prefer adapted English body for en-AF; for fa/ps keep excerpt translated and body adapted English marked needs_review
                $excerpt = str_replace(['Pakistan', 'Pakistani', 'Karachi', 'Lahore', 'PKR'], ['Afghanistan', 'Afghan', 'Afghanistan', 'Afghanistan', 'AFN'], (string) ($post->excerpt ?? ''));
                if ($locale !== 'en-AF') {
                    $excerpt = $this->t($mapKey, $excerpt) !== $excerpt ? $this->t($mapKey, $excerpt) : $excerpt;
                }

                $adapted = str_replace(
                    ['Pakistan', 'Pakistani', 'Karachi', 'Lahore', 'PKR'],
                    ['Afghanistan', 'Afghan', 'Afghanistan', 'Afghanistan', 'AFN'],
                    (string) ($post->content ?? '')
                );

                CmsBlogPost::updateOrCreate(
                    [
                        'market_code' => 'af',
                        'locale_code' => $locale,
                        'slug' => $post->slug,
                    ],
                    [
                        'title' => $title,
                        'excerpt' => $excerpt,
                        'content' => $adapted,
                        'category_id' => $post->category_id,
                        'image_url' => $post->image_url,
                        'image_alt' => $post->image_alt,
                        'author' => $post->author,
                        'tags' => $post->tags,
                        'status' => 'published',
                        'is_enabled' => true,
                        'published_at' => now()->subDays($i),
                        'show_on_homepage' => (bool) $post->show_on_homepage,
                        'sort_order' => $post->sort_order ?? $i,
                        'translation_status' => $locale === 'en-AF' ? 'ready' : 'needs_review',
                        'is_shared' => false,
                    ]
                );
            }
        }
    }

    protected function seedFooterAndFormUi(): void
    {
        $ui = [
            'en-AF' => [
                'ui_privacy_policy' => 'Privacy Policy',
                'ui_admin_login' => 'Admin Login',
                'ui_monthly' => 'Monthly',
                'ui_yearly' => 'Yearly',
                'ui_contact_sales' => 'Contact Sales',
                'ui_most_popular' => 'Most Popular',
                'ui_pricing_note' => 'Contact us for Afghanistan pricing.',
                'ui_mobile_platforms' => 'Available on both Android and iOS',
                'ui_ready_to_start' => 'Ready to start?',
                'ui_step' => 'STEP',
                'ui_about_us' => 'About',
                'ui_get_started' => 'Get Started',
                'ui_save_2_months' => 'Save 2 Months',
                'ui_explore_analytics' => 'Explore Analytics',
                'ui_unlock_insights' => 'Unlock powerful station insights today',
                'ui_contact_us' => 'Contact us',
                'ui_phone_label' => 'Phone',
                'ui_email_label' => 'Email',
            ],
            'fa-AF' => [
                'ui_privacy_policy' => 'سیاست حریم خصوصی',
                'ui_admin_login' => 'ورود مدیر',
                'ui_monthly' => 'ماهانه',
                'ui_yearly' => 'سالانه',
                'ui_contact_sales' => 'تماس با فروش',
                'ui_most_popular' => 'محبوب‌ترین',
                'ui_pricing_note' => 'برای قیمت‌گذاری افغانستان با ما تماس بگیرید.',
                'ui_mobile_platforms' => 'موجود برای Android و iOS',
                'ui_ready_to_start' => 'آماده شروع هستید؟',
                'ui_step' => 'گام',
                'ui_about_us' => 'درباره ما',
                'ui_get_started' => 'شروع کنید',
                'ui_save_2_months' => '۲ ماه صرفه‌جویی',
                'ui_explore_analytics' => 'کاوش تحلیل‌ها',
                'ui_unlock_insights' => 'امروز بینش قدرتمند ایستگاه را باز کنید',
                'ui_contact_us' => 'با ما تماس بگیرید',
                'ui_phone_label' => 'تلفن',
                'ui_email_label' => 'ایمیل',
            ],
            'ps-AF' => [
                'ui_privacy_policy' => 'د محرمیت تګلاره',
                'ui_admin_login' => 'د مدیر ننوتل',
                'ui_monthly' => 'میاشتنی',
                'ui_yearly' => 'کلنی',
                'ui_contact_sales' => 'له پلور سره اړیکه',
                'ui_most_popular' => 'ډېر مشهور',
                'ui_pricing_note' => 'د افغانستان بیو لپاره له موږ سره اړیکه ونیسئ.',
                'ui_mobile_platforms' => 'په Android او iOS دواړو شته',
                'ui_ready_to_start' => 'چمتو یاست چې پیل کړئ؟',
                'ui_step' => 'ګام',
                'ui_about_us' => 'زموږ په اړه',
                'ui_get_started' => 'پیل وکړئ',
                'ui_save_2_months' => '۲ میاشتې سپما',
                'ui_explore_analytics' => 'تحلیلونه وپلټئ',
                'ui_unlock_insights' => 'نن د سټیشن پیاوړي بصیرتونه خلاص کړئ',
                'ui_contact_us' => 'له موږ سره اړیکه',
                'ui_phone_label' => 'تلیفون',
                'ui_email_label' => 'برېښنالیک',
            ],
        ];

        foreach ($ui as $locale => $settings) {
            foreach ($settings as $key => $value) {
                CmsSetting::updateOrCreate(
                    ['market_code' => 'af', 'locale_code' => $locale, 'key' => $key],
                    ['value' => $value, 'type' => 'text', 'label' => $key, 'grp' => 'ui', 'is_shared' => false]
                );
            }
        }
    }

    protected function fixSeo(): void
    {
        $titles = [
            'en-AF' => [
                '/af/en' => ['Petroleu — Petrol Pump Software Afghanistan', 'Fuel station management software for Afghanistan — stock, nozzle sales, credit, and reports.'],
                '/af/en/about' => ['About | Petroleu Afghanistan', 'About Petroleu for Afghanistan fuel stations.'],
                '/af/en/blog' => ['Blog | Petroleu Afghanistan', 'Guides for fuel station operators in Afghanistan.'],
                '/af/en/contact' => ['Contact | Petroleu Afghanistan', 'Contact Petroleu about Afghanistan deployments.'],
                '/af/en/faq' => ['FAQ | Petroleu Afghanistan', 'Frequently asked questions about Petroleu.'],
                '/af/en/features' => ['Features | Petroleu Afghanistan', 'Petroleu modules for nozzle, stock, credit, and reports.'],
                '/af/en/pricing' => ['Pricing | Petroleu Afghanistan', 'Contact Petroleu for Afghanistan pricing.'],
            ],
            'fa-AF' => [
                '/af' => ['Petroleu — نرم‌افزار پمپ تیل افغانستان', 'نرم‌افزار مدیریت پمپ تیل برای افغانستان — موجودی، فروش نوزل، اعتبار و گزارش‌ها.'],
                '/af/about' => ['درباره ما | Petroleu', 'درباره Petroleu برای پمپ‌های تیل افغانستان.'],
                '/af/blog' => ['وبلاگ | Petroleu', 'راهنما برای اپراتورهای پمپ تیل در افغانستان.'],
                '/af/contact' => ['تماس | Petroleu', 'تماس با Petroleu درباره افغانستان.'],
                '/af/faq' => ['پرسش‌های متداول | Petroleu', 'پرسش‌های رایج درباره Petroleu.'],
                '/af/features' => ['امکانات | Petroleu', 'ماژول‌های نوزل، موجودی، اعتبار و گزارش.'],
                '/af/pricing' => ['قیمت‌ها | Petroleu', 'برای قیمت‌گذاری افغانستان با Petroleu تماس بگیرید.'],
            ],
            'ps-AF' => [
                '/af/ps' => ['Petroleu — د افغانستان تیل پمپ سافټویر', 'د افغانستان لپاره د تیل پمپ مدیریت سافټویر — موجودي، نوزل پلور، اعتبار او راپورونه.'],
                '/af/ps/about' => ['زموږ په اړه | Petroleu', 'د افغانستان تیل پمپونو لپاره د Petroleu په اړه.'],
                '/af/ps/blog' => ['بلاګ | Petroleu', 'د افغانستان تیل پمپ چلوونکو لپاره لارښودونه.'],
                '/af/ps/contact' => ['اړیکه | Petroleu', 'د افغانستان په اړه له Petroleu سره اړیکه.'],
                '/af/ps/faq' => ['پوښتنې | Petroleu', 'د Petroleu په اړه عامې پوښتنې.'],
                '/af/ps/features' => ['ځانګړتیاوې | Petroleu', 'نوزل، موجودي، اعتبار او راپور ماډیولونه.'],
                '/af/ps/pricing' => ['بیې | Petroleu', 'د افغانستان بیو لپاره له Petroleu سره اړیکه ونیسئ.'],
            ],
        ];

        foreach ($titles as $locale => $paths) {
            foreach ($paths as $path => [$title, $desc]) {
                CmsSeoEntry::updateOrCreate(
                    ['market_code' => 'af', 'locale_code' => $locale, 'path' => $path],
                    [
                        'title' => $title,
                        'description' => $desc,
                        'og_title' => $title,
                        'og_description' => $desc,
                        'canonical_url' => 'https://petroleu.com'.$path,
                        'og_locale' => str_replace('-', '_', $locale),
                        'noindex' => false,
                        'status' => 'published',
                        'published_at' => now(),
                    ]
                );
            }
        }
    }

    protected function seedPageHeadings(): void
    {
        // Features marketing page intro
        foreach ($this->locales() as $locale => $mapKey) {
            CmsSection::updateOrCreate(
                [
                    'market_code' => 'af',
                    'locale_code' => $locale,
                    'page_slug' => 'features',
                    'section_key' => 'heading:features-page',
                    'sort_order' => 0,
                ],
                [
                    'title' => $this->t($mapKey, 'Everything your petrol pump needs'),
                    'description' => $this->t($mapKey, 'From nozzle readings to accounts — modules built for Afghanistan fuel stations.'),
                    'data' => ['badge' => $this->t($mapKey, 'Features'), 'eyebrow' => $this->t($mapKey, 'Features')],
                    'is_enabled' => true,
                    'status' => 'published',
                    'published_at' => now(),
                    'translation_status' => $locale === 'en-AF' ? 'ready' : 'needs_review',
                ]
            );
        }
    }

    protected function seedDocsAndDevelopers(): void
    {
        $docsCards = [
            [
                'title' => 'Product overview',
                'description' => 'Petroleu is petrol pump and fuel station management software for Afghanistan — tanks, nozzles, sales, inventory, accounts, shifts, and reporting.',
                'link_label' => 'Open product overview',
                'link_url' => '/',
                'icon' => 'Globe',
            ],
            [
                'title' => 'Public API notes',
                'description' => 'Truthful documentation for the official website API: public CMS reads, contact forms, health, and the OpenAPI specification.',
                'link_label' => 'Open Petroleu API docs',
                'link_url' => '/docs/api',
                'icon' => 'Code2',
            ],
            [
                'title' => 'OpenAPI specification',
                'description' => 'Machine-readable OpenAPI 3.1 document at /openapi.json. It lists only intentionally public website endpoints.',
                'link_label' => 'View openapi.json',
                'link_url' => '/openapi.json',
                'icon' => 'FileJson',
            ],
            [
                'title' => 'Operator guides',
                'description' => 'Module guides for licensed Petroleu PMS operators. These are product manuals, not a public tenant API.',
                'link_label' => 'Open operator documentation',
                'link_url' => '/docs',
                'icon' => 'BookOpen',
            ],
        ];

        $devCards = [
            [
                'title' => 'Petroleu docs',
                'description' => 'Petroleu documentation index — product overview, public API notes, and operator guide links.',
                'link_label' => 'View resource',
                'link_url' => '/docs',
                'icon' => 'BookOpen',
            ],
            [
                'title' => 'Petroleu API docs',
                'description' => 'Truthful public website API notes and the OpenAPI 3.1 specification. Tenant ERP routes stay private.',
                'link_label' => 'View resource',
                'link_url' => '/docs/api',
                'icon' => 'Code2',
            ],
            [
                'title' => 'Public marketing content API',
                'description' => 'Read-only CMS endpoints serve hero sections, pricing, FAQs, and legal pages for the Petroleu website.',
                'link_label' => 'View resource',
                'link_url' => '/api/cms/pricing',
                'icon' => 'Globe',
            ],
            [
                'title' => 'OpenAPI, LLMs & sitemap',
                'description' => 'Machine-readable files: /openapi.json, /llms.txt, and /sitemap.xml for agents and integrators.',
                'link_label' => 'View resource',
                'link_url' => '/openapi.json',
                'icon' => 'FileText',
            ],
        ];

        $extraFa = [
            'Product overview' => 'نمای کلی محصول',
            'Petroleu is petrol pump and fuel station management software for Afghanistan — tanks, nozzles, sales, inventory, accounts, shifts, and reporting.' => 'Petroleu نرم‌افزار مدیریت پمپ تیل برای افغانستان است — تانک، نوزل، فروش، موجودی، حساب‌ها، شیفت‌ها و گزارش‌دهی.',
            'Open product overview' => 'باز کردن نمای محصول',
            'Public API notes' => 'یادداشت‌های API عمومی',
            'Truthful documentation for the official website API: public CMS reads, contact forms, health, and the OpenAPI specification.' => 'مستندات درست برای API وب‌سایت: خواندن CMS عمومی، فرم تماس، سلامت و مشخصات OpenAPI.',
            'Open Petroleu API docs' => 'باز کردن اسناد API',
            'OpenAPI specification' => 'مشخصات OpenAPI',
            'Machine-readable OpenAPI 3.1 document at /openapi.json. It lists only intentionally public website endpoints.' => 'سند OpenAPI 3.1 قابل خواندن توسط ماشین در /openapi.json. فقط نقاط پایانی عمومی عمدی را فهرست می‌کند.',
            'View openapi.json' => 'مشاهده openapi.json',
            'Operator guides' => 'راهنمای اپراتور',
            'Module guides for licensed Petroleu PMS operators. These are product manuals, not a public tenant API.' => 'راهنمای ماژول برای اپراتورهای دارای مجوز Petroleu PMS. این‌ها دفترچه محصول هستند، نه API عمومی.',
            'Open operator documentation' => 'باز کردن اسناد اپراتور',
            'Petroleu Docs' => 'اسناد Petroleu',
            'Petroleu documentation for the official website, public developer resources, and operator guides.' => 'مستندات Petroleu برای وب‌سایت رسمی، منابع توسعه‌دهنده و راهنمای اپراتور.',
            'Petroleu Developer Resources' => 'منابع توسعه‌دهنده Petroleu',
            'Integration notes, public CMS endpoints, operator documentation, and machine-readable indexes for Petroleu — fuel station management software for Afghanistan.' => 'یادداشت یکپارچه‌سازی، نقاط پایانی CMS عمومی، اسناد اپراتور و فهرست‌های قابل خواندن توسط ماشین برای Petroleu — نرم‌افزار مدیریت پمپ تیل برای افغانستان.',
            'Petroleu docs' => 'اسناد Petroleu',
            'Petroleu documentation index — product overview, public API notes, and operator guide links.' => 'فهرست مستندات Petroleu — نمای محصول، یادداشت API و پیوندهای راهنمای اپراتور.',
            'View resource' => 'مشاهده منبع',
            'Petroleu API docs' => 'اسناد API Petroleu',
            'Truthful public website API notes and the OpenAPI 3.1 specification. Tenant ERP routes stay private.' => 'یادداشت‌های API عمومی وب‌سایت و مشخصات OpenAPI 3.1. مسیرهای ERP مستأجر خصوصی می‌مانند.',
            'Public marketing content API' => 'API محتوای بازاریابی عمومی',
            'Read-only CMS endpoints serve hero sections, pricing, FAQs, and legal pages for the Petroleu website.' => 'نقاط پایانی فقط‌خواندنی CMS بخش‌های هیرو، قیمت، پرسش و صفحات حقوقی را ارائه می‌دهند.',
            'OpenAPI, LLMs & sitemap' => 'OpenAPI، LLM و نقشه سایت',
            'Machine-readable files: /openapi.json, /llms.txt, and /sitemap.xml for agents and integrators.' => 'فایل‌های قابل خواندن توسط ماشین: /openapi.json، /llms.txt و /sitemap.xml برای عامل‌ها و یکپارچه‌سازان.',
            'What is not public' => 'چه چیزی عمومی نیست',
            'Developer resources' => 'منابع توسعه‌دهنده',
            'Contact' => 'تماس',
        ];
        $extraPs = [
            'Product overview' => 'د محصول کتنه',
            'Petroleu is petrol pump and fuel station management software for Afghanistan — tanks, nozzles, sales, inventory, accounts, shifts, and reporting.' => 'Petroleu د افغانستان لپاره د تیل پمپ مدیریت سافټویر دی — ټانک، نوزل، پلور، موجودي، حسابونه، شفټونه او راپورونه.',
            'Open product overview' => 'د محصول کتنه پرانیزئ',
            'Public API notes' => 'د عامه API یادښتونه',
            'Truthful documentation for the official website API: public CMS reads, contact forms, health, and the OpenAPI specification.' => 'د رسمي ویب پاڼې API لپاره سم اسناد: عامه CMS لوستل، د اړیکې فورمې، روغتیا او OpenAPI مشخصات.',
            'Open Petroleu API docs' => 'د Petroleu API اسناد پرانیزئ',
            'OpenAPI specification' => 'د OpenAPI مشخصات',
            'Machine-readable OpenAPI 3.1 document at /openapi.json. It lists only intentionally public website endpoints.' => 'په /openapi.json کې د ماشین لوستلو وړ OpenAPI 3.1 سند. یوازې عمدي عامه پای ټکي لیست کوي.',
            'View openapi.json' => 'openapi.json وګورئ',
            'Operator guides' => 'د چلوونکي لارښودونه',
            'Module guides for licensed Petroleu PMS operators. These are product manuals, not a public tenant API.' => 'د جواز لرونکو Petroleu PMS چلوونکو لپاره د ماډیول لارښودونه. دا د محصول لارښودونه دي، نه عامه کرایه API.',
            'Open operator documentation' => 'د چلوونکي اسناد پرانیزئ',
            'Petroleu Docs' => 'د Petroleu اسناد',
            'Petroleu documentation for the official website, public developer resources, and operator guides.' => 'د رسمي ویب پاڼې، عامه پراختیایي سرچینو او د چلوونکي لارښودونو لپاره د Petroleu اسناد.',
            'Petroleu Developer Resources' => 'د Petroleu پراختیایي سرچینې',
            'Integration notes, public CMS endpoints, operator documentation, and machine-readable indexes for Petroleu — fuel station management software for Afghanistan.' => 'د یوځای کولو یادښتونه، عامه CMS پای ټکي، د چلوونکي اسناد او د ماشین لوستلو وړ فهرستونه د Petroleu لپاره — د افغانستان تیل پمپ مدیریت سافټویر.',
            'Petroleu docs' => 'د Petroleu اسناد',
            'Petroleu documentation index — product overview, public API notes, and operator guide links.' => 'د Petroleu اسنادو فهرست — د محصول کتنه، عامه API یادښتونه او د چلوونکي لینکونه.',
            'View resource' => 'سرچینه وګورئ',
            'Petroleu API docs' => 'د Petroleu API اسناد',
            'Truthful public website API notes and the OpenAPI 3.1 specification. Tenant ERP routes stay private.' => 'د عامه ویب پاڼې API یادښتونه او د OpenAPI 3.1 مشخصات. د کرایه ERP لارې شخصي پاتې کیږي.',
            'Public marketing content API' => 'د عامه بازارموندنې مینځپانګې API',
            'Read-only CMS endpoints serve hero sections, pricing, FAQs, and legal pages for the Petroleu website.' => 'یوازې لوستلو CMS پای ټکي د هیرو برخې، بیې، پوښتنې او حقوقي پاڼې وړاندې کوي.',
            'OpenAPI, LLMs & sitemap' => 'OpenAPI، LLM او سایټ میپ',
            'Machine-readable files: /openapi.json, /llms.txt, and /sitemap.xml for agents and integrators.' => 'د ماشین لوستلو وړ فایلونه: /openapi.json، /llms.txt او /sitemap.xml د اجنټانو او یوځای کوونکو لپاره.',
            'What is not public' => 'څه شی عامه نه دي',
            'Developer resources' => 'پراختیایي سرچینې',
            'Contact' => 'اړیکه',
        ];
        $this->maps['fa'] = array_merge($this->maps['fa'] ?? [], $extraFa);
        $this->maps['ps'] = array_merge($this->maps['ps'] ?? [], $extraPs);

        foreach ($this->locales() as $locale => $mapKey) {
            $prefix = $locale === 'fa-AF' ? '/af' : ($locale === 'ps-AF' ? '/af/ps' : '/af/en');

            CmsSection::updateOrCreate(
                [
                    'market_code' => 'af',
                    'locale_code' => $locale,
                    'page_slug' => 'docs',
                    'section_key' => 'hero',
                    'sort_order' => 0,
                ],
                [
                    'title' => $this->t($mapKey, 'Petroleu Docs'),
                    'description' => $this->t($mapKey, 'Petroleu documentation for the official website, public developer resources, and operator guides.'),
                    'is_enabled' => true,
                    'status' => 'published',
                    'published_at' => now(),
                    'frontend_path' => $prefix.'/docs',
                    'translation_status' => $locale === 'en-AF' ? 'ready' : 'needs_review',
                ]
            );

            CmsSection::updateOrCreate(
                [
                    'market_code' => 'af',
                    'locale_code' => $locale,
                    'page_slug' => 'developers',
                    'section_key' => 'hero',
                    'sort_order' => 0,
                ],
                [
                    'title' => $this->t($mapKey, 'Petroleu Developer Resources'),
                    'description' => $this->t($mapKey, 'Integration notes, public CMS endpoints, operator documentation, and machine-readable indexes for Petroleu — fuel station management software for Afghanistan.'),
                    'is_enabled' => true,
                    'status' => 'published',
                    'published_at' => now(),
                    'frontend_path' => $prefix.'/developers',
                    'translation_status' => $locale === 'en-AF' ? 'ready' : 'needs_review',
                ]
            );

            foreach ($docsCards as $i => $card) {
                CmsSection::updateOrCreate(
                    [
                        'market_code' => 'af',
                        'locale_code' => $locale,
                        'page_slug' => 'docs',
                        'section_key' => 'page-card',
                        'sort_order' => $i,
                    ],
                    [
                        'title' => $this->t($mapKey, $card['title']),
                        'description' => $this->t($mapKey, $card['description']),
                        'link_label' => $this->t($mapKey, $card['link_label']),
                        'link_url' => str_starts_with($card['link_url'], 'http') || str_starts_with($card['link_url'], '/api') || str_starts_with($card['link_url'], '/openapi')
                            ? $card['link_url']
                            : $prefix.($card['link_url'] === '/' ? '' : $card['link_url']),
                        'data' => ['icon' => $card['icon']],
                        'is_enabled' => true,
                        'status' => 'published',
                        'published_at' => now(),
                        'translation_status' => $locale === 'en-AF' ? 'ready' : 'needs_review',
                    ]
                );
            }

            foreach ($devCards as $i => $card) {
                CmsSection::updateOrCreate(
                    [
                        'market_code' => 'af',
                        'locale_code' => $locale,
                        'page_slug' => 'developers',
                        'section_key' => 'page-card',
                        'sort_order' => $i,
                    ],
                    [
                        'title' => $this->t($mapKey, $card['title']),
                        'description' => $this->t($mapKey, $card['description']),
                        'link_label' => $this->t($mapKey, $card['link_label']),
                        'link_url' => str_starts_with($card['link_url'], 'http') || str_starts_with($card['link_url'], '/api') || str_starts_with($card['link_url'], '/openapi')
                            ? $card['link_url']
                            : $prefix.$card['link_url'],
                        'data' => ['icon' => $card['icon']],
                        'is_enabled' => true,
                        'status' => 'published',
                        'published_at' => now(),
                        'translation_status' => $locale === 'en-AF' ? 'ready' : 'needs_review',
                    ]
                );
            }

            CmsSetting::updateOrCreate(
                ['market_code' => 'af', 'locale_code' => $locale, 'key' => 'ui_docs_private_note'],
                [
                    'value' => $this->t($mapKey, 'What is not public'),
                    'type' => 'text',
                    'label' => 'ui_docs_private_note',
                    'grp' => 'ui',
                    'is_shared' => false,
                ]
            );
            CmsSetting::updateOrCreate(
                ['market_code' => 'af', 'locale_code' => $locale, 'key' => 'ui_docs_private_body'],
                [
                    'value' => $locale === 'fa-AF'
                        ? 'API خصوصی ERP، ورود مدیر CMS، و مسیرهای عملیاتی WhatsApp عمومی نیستند. برای یکپارچه‌سازی دارای مجوز با ما تماس بگیرید.'
                        : ($locale === 'ps-AF'
                            ? 'د خصوصي ERP API، د CMS مدیر ننوتل، او د WhatsApp عملیاتي لارې عامه نه دي. د جواز لرونکي یوځای کولو لپاره اړیکه ونیسئ.'
                            : 'The tenant petrol-pump ERP, CMS admin, authentication internals, and operational WhatsApp routes stay private. For licensed integrations, contact us.'),
                    'type' => 'text',
                    'label' => 'ui_docs_private_body',
                    'grp' => 'ui',
                    'is_shared' => false,
                ]
            );
            CmsSetting::updateOrCreate(
                ['market_code' => 'af', 'locale_code' => $locale, 'key' => 'ui_docs_api_btn'],
                [
                    'value' => $locale === 'fa-AF' ? 'اسناد API' : ($locale === 'ps-AF' ? 'د API اسناد' : 'Petroleu API docs'),
                    'type' => 'text',
                    'label' => 'ui_docs_api_btn',
                    'grp' => 'ui',
                    'is_shared' => false,
                ]
            );
            CmsSetting::updateOrCreate(
                ['market_code' => 'af', 'locale_code' => $locale, 'key' => 'ui_developer_resources'],
                [
                    'value' => $this->t($mapKey, 'Developer resources'),
                    'type' => 'text',
                    'label' => 'ui_developer_resources',
                    'grp' => 'ui',
                    'is_shared' => false,
                ]
            );
        }
    }

    protected function seedInnerPageHeroes(): void
    {
        $heroes = [
            'faq' => [
                'badge' => 'FAQ',
                'title' => 'Frequently Asked Questions',
                'description' => 'Answers to common questions about Petroleu petrol pump management software.',
            ],
            'pricing' => [
                'badge' => 'Pricing',
                'title' => 'Affordable Petrol Pump Software Pricing Plans',
                'description' => 'Contact Petroleu for Afghanistan pricing covering nozzle sales, tank stock, credit, reports, and mobile monitoring.',
            ],
            'analytics' => [
                'badge' => 'Analytics',
                'title' => 'Real-Time Insights for Smarter Decisions',
                'description' => 'Dashboards, variance detection, and shift-aware reports that turn pump data into clear daily action.',
            ],
            'industries' => [
                'badge' => 'Industries',
                'title' => 'Built for every fuel business',
                'description' => 'From single-pump retailers to multi-site distributors, Petroleu adapts to how fuel businesses actually work.',
            ],
            'product-reports' => [
                'badge' => 'Reports',
                'title' => 'Reports that actually answer your questions',
                'description' => 'Sales, financials, stock — reports a fuel station needs, ready to review and share.',
            ],
        ];

        $extraFa = [
            'Frequently Asked Questions' => 'پرسش‌های متداول',
            'Answers to common questions about Petroleu petrol pump management software.' => 'پاسخ به پرسش‌های رایج درباره نرم‌افزار مدیریت پمپ تیل Petroleu.',
            'Affordable Petrol Pump Software Pricing Plans' => 'پلان‌های قیمت‌گذاری نرم‌افزار پمپ تیل',
            'Contact Petroleu for Afghanistan pricing covering nozzle sales, tank stock, credit, reports, and mobile monitoring.' => 'برای قیمت‌گذاری افغانستان با Petroleu تماس بگیرید — فروش نوزل، موجودی تانک، اعتبار، گزارش و نظارت موبایل.',
            'Real-Time Insights for Smarter Decisions' => 'بینش لحظه‌ای برای تصمیم‌های هوشمندتر',
            'Dashboards, variance detection, and shift-aware reports that turn pump data into clear daily action.' => 'داشبوردها، تشخیص تفاوت و گزارش‌های شیفت‌محور که داده‌های پمپ را به اقدام روزانه تبدیل می‌کنند.',
            'Built for every fuel business' => 'ساخته‌شده برای هر تجارت تیل',
            'From single-pump retailers to multi-site distributors, Petroleu adapts to how fuel businesses actually work.' => 'از خرده‌فروشان تک‌پمپ تا توزیع‌کنندگان چندسایته، Petroleu با نحوه کار تجارت تیل سازگار می‌شود.',
            'Reports that actually answer your questions' => 'گزارش‌هایی که واقعاً به سوال‌های شما پاسخ می‌دهند',
            'Sales, financials, stock — reports a fuel station needs, ready to review and share.' => 'فروش، مالی، موجودی — گزارش‌هایی که پمپ تیل نیاز دارد، آماده بررسی و اشتراک.',
        ];
        $extraPs = [
            'Frequently Asked Questions' => 'په مکرر پوښتل شوې پوښتنې',
            'Answers to common questions about Petroleu petrol pump management software.' => 'د Petroleu تیل پمپ مدیریت سافټویر په اړه د عامو پوښتنو ځوابونه.',
            'Affordable Petrol Pump Software Pricing Plans' => 'د تیل پمپ سافټویر د بیو پلانونه',
            'Contact Petroleu for Afghanistan pricing covering nozzle sales, tank stock, credit, reports, and mobile monitoring.' => 'د افغانستان بیو لپاره له Petroleu سره اړیکه ونیسئ — نوزل پلور، ټانک موجودي، اعتبار، راپورونه او موبایل څارنه.',
            'Real-Time Insights for Smarter Decisions' => 'د هوښیارو پرېکړو لپاره لحظه‌يي بصیرتونه',
            'Dashboards, variance detection, and shift-aware reports that turn pump data into clear daily action.' => 'ډشبورډونه، د توپیر کشف او د شفټ راپورونه چې د پمپ معلومات په ورځني عمل بدلوي.',
            'Built for every fuel business' => 'د هر تیل سوداګرۍ لپاره جوړ شوی',
            'From single-pump retailers to multi-site distributors, Petroleu adapts to how fuel businesses actually work.' => 'له یو پمپ پلورونکو څخه تر څو سایټو توزیع کوونکو پورې، Petroleu د تیل سوداګرۍ له کار سره سمون خوري.',
            'Reports that actually answer your questions' => 'هغه راپورونه چې واقعاً ستاسو پوښتنو ته ځواب ورکوي',
            'Sales, financials, stock — reports a fuel station needs, ready to review and share.' => 'پلور، مالي، موجودي — هغه راپورونه چې تیل پمپ ورته اړتیا لري.',
        ];
        $this->maps['fa'] = array_merge($this->maps['fa'] ?? [], $extraFa);
        $this->maps['ps'] = array_merge($this->maps['ps'] ?? [], $extraPs);

        foreach ($this->locales() as $locale => $mapKey) {
            $prefix = $locale === 'fa-AF' ? '/af' : ($locale === 'ps-AF' ? '/af/ps' : '/af/en');
            foreach ($heroes as $page => $en) {
                CmsSection::updateOrCreate(
                    [
                        'market_code' => 'af',
                        'locale_code' => $locale,
                        'page_slug' => $page,
                        'section_key' => 'hero',
                        'sort_order' => 0,
                    ],
                    [
                        'title' => $this->t($mapKey, $en['title']),
                        'description' => $this->t($mapKey, $en['description']),
                        'data' => [
                            'badge' => $this->t($mapKey, $en['badge']),
                            'eyebrow' => $this->t($mapKey, $en['badge']),
                        ],
                        'frontend_path' => $prefix.'/'.str_replace('product-reports', 'product/reports', $page === 'product-reports' ? 'product/reports' : $page),
                        'is_enabled' => true,
                        'status' => 'published',
                        'published_at' => now(),
                        'translation_status' => $locale === 'en-AF' ? 'ready' : 'needs_review',
                    ]
                );
            }
        }
    }
}
