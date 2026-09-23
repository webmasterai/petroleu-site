<?php

namespace Database\Seeders;

use App\Models\Cms\CmsLocale;
use App\Models\Cms\CmsMarket;
use App\Models\Cms\CmsNavigationItem;
use App\Models\Cms\CmsPage;
use App\Models\Cms\CmsSection;
use App\Models\Cms\CmsSeoEntry;
use App\Models\Cms\CmsSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CmsPakistanContentSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        CmsLocale::upsert([
            ['code' => 'en-PK', 'name' => 'English (Pakistan)', 'native_name' => 'English', 'dir' => 'ltr', 'font_stack' => 'Inter', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'fa-AF', 'name' => 'Dari (Afghanistan)', 'native_name' => 'دری', 'dir' => 'rtl', 'font_stack' => 'Noto Naskh Arabic', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'ps-AF', 'name' => 'Pashto (Afghanistan)', 'native_name' => 'پښتو', 'dir' => 'rtl', 'font_stack' => 'Noto Naskh Arabic', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'en-AF', 'name' => 'English (Afghanistan)', 'native_name' => 'English', 'dir' => 'ltr', 'font_stack' => 'Inter', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'en', 'name' => 'English (shared)', 'native_name' => 'English', 'dir' => 'ltr', 'font_stack' => 'Inter', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ], ['code'], ['name', 'native_name', 'dir', 'font_stack', 'is_active', 'updated_at']);

        CmsMarket::upsert([
            [
                'code' => 'shared',
                'name' => 'Shared',
                'default_locale' => 'en',
                'currency' => null,
                'phone' => null,
                'phone_tel' => null,
                'whatsapp' => null,
                'email' => 'info@petroleu.com',
                'sales_email' => 'sales@petroleu.com',
                'support_email' => 'support@petroleu.com',
                'address' => null,
                'inquiry_recipients' => null,
                'form_source' => 'website-shared',
                'social_links' => json_encode([]),
                'regional_settings' => json_encode([]),
                'is_active' => true,
                'is_shared' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'code' => 'pk',
                'name' => 'Pakistan',
                'default_locale' => 'en-PK',
                'currency' => 'PKR',
                'phone' => '0325 7865000',
                'phone_tel' => '+923257865000',
                'whatsapp' => '923257865000',
                'email' => 'sales@petroleu.com',
                'sales_email' => 'sales@petroleu.com',
                'support_email' => 'support@petroleu.com',
                'address' => 'Karachi, Pakistan.',
                'inquiry_recipients' => env('CMS_PK_INQUIRY_RECIPIENTS', ''),
                'form_source' => 'website-pk',
                'social_links' => json_encode([]),
                'regional_settings' => json_encode(['country' => 'Pakistan']),
                'is_active' => true,
                'is_shared' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'code' => 'af',
                'name' => 'Afghanistan',
                'default_locale' => 'fa-AF',
                'currency' => 'AFN',
                'phone' => null,
                'phone_tel' => null,
                'whatsapp' => null,
                'email' => null,
                'sales_email' => null,
                'support_email' => null,
                'address' => null,
                'inquiry_recipients' => env('CMS_AF_INQUIRY_RECIPIENTS', ''),
                'form_source' => 'website-af',
                'social_links' => json_encode([]),
                'regional_settings' => json_encode(['country' => 'Afghanistan']),
                'is_active' => true,
                'is_shared' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ], ['code'], [
            'name', 'default_locale', 'currency', 'phone', 'phone_tel', 'whatsapp',
            'email', 'sales_email', 'support_email', 'address', 'inquiry_recipients',
            'form_source', 'social_links', 'regional_settings', 'is_active', 'is_shared', 'updated_at',
        ]);

        DB::table('cms_market_locale')->upsert([
            ['market_code' => 'pk', 'locale_code' => 'en-PK', 'is_default' => true, 'is_active' => true, 'sort_order' => 0, 'created_at' => $now, 'updated_at' => $now],
            ['market_code' => 'af', 'locale_code' => 'fa-AF', 'is_default' => true, 'is_active' => true, 'sort_order' => 0, 'created_at' => $now, 'updated_at' => $now],
            ['market_code' => 'af', 'locale_code' => 'ps-AF', 'is_default' => false, 'is_active' => true, 'sort_order' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['market_code' => 'af', 'locale_code' => 'en-AF', 'is_default' => false, 'is_active' => true, 'sort_order' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['market_code' => 'shared', 'locale_code' => 'en', 'is_default' => true, 'is_active' => true, 'sort_order' => 0, 'created_at' => $now, 'updated_at' => $now],
        ], ['market_code', 'locale_code'], ['is_default', 'is_active', 'sort_order', 'updated_at']);

        $this->seedPakistanPagesAndSections($now);
        $this->seedNavigation($now);
        $this->seedSettings($now);
        $this->seedSeo($now);
        $this->seedAfghanistanPlaceholders($now);
    }

    protected function published(array $base): array
    {
        return array_merge($base, [
            'is_enabled' => true,
            'status' => 'published',
            'is_shared' => false,
            'published_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    protected function seedPakistanPagesAndSections($now): void
    {
        $m = 'pk';
        $l = 'en-PK';

        foreach (['home', 'features', 'pricing', 'about', 'contact', 'faq', 'blog', 'legal'] as $slug) {
            CmsPage::updateOrCreate(
                ['market_code' => $m, 'locale_code' => $l, 'slug' => $slug],
                [
                    'title' => ucfirst($slug),
                    'description' => 'Pakistan '.$slug.' page',
                    'template' => 'default',
                    'is_enabled' => true,
                    'status' => 'published',
                    'published_at' => $now,
                ]
            );
        }

        // Clear existing PK seeded sections for idempotent re-seed of core keys
        CmsSection::where('market_code', $m)->where('locale_code', $l)->delete();

        $sections = [];

        $sections[] = $this->published([
            'market_code' => $m, 'locale_code' => $l, 'page_slug' => 'home', 'section_key' => 'hero', 'sort_order' => 0,
            'title' => 'Petrol Pump Software',
            'description' => 'Run your fuel station smarter with Petroleu. Manage nozzle readings, tank stock, credit customers, daily closing, accounts, reports, and mobile monitoring from one system.',
            'image_url' => 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PetroleuDashboard-45o0LNfASWEDxtDgDI6KSRExrYyMNC.png',
            'image_alt' => 'Petroleu dashboard',
            'link_label' => 'See it in Action',
            'link_url' => '/contact',
            'data' => [
                'badge' => 'Best Petrol Pump Management Software',
                'title_highlight' => 'Pakistan',
                'cta2_text' => 'View Pricing',
                'cta2_link' => '/pricing',
                'dashboard_url' => 'app.petroleu.com/dashboard',
                'features' => [
                    'Nozzle reading management',
                    'Tank dipping and stock control',
                    'Cash and credit sale tracking',
                    'Customer ledgers and vehicle-wise billing',
                    'Daily closing and shift reports',
                    'Mobile owner dashboard',
                ],
            ],
        ]);

        $stats = [
            ['500+', 'Stations Active'],
            ['99.9%', 'Uptime'],
            ['10M+', 'Transactions Logged'],
            ['24/7', 'Support'],
        ];
        foreach ($stats as $i => [$value, $label]) {
            $sections[] = $this->published([
                'market_code' => $m, 'locale_code' => $l, 'page_slug' => 'home', 'section_key' => 'stat', 'sort_order' => $i,
                'title' => $value,
                'description' => $label,
                'data' => ['value' => $value, 'label' => $label],
            ]);
        }

        $sections[] = $this->published([
            'market_code' => $m, 'locale_code' => $l, 'page_slug' => 'home', 'section_key' => 'logo', 'sort_order' => 0,
            'title' => 'Trusted logos',
            'image_url' => 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-04-25%20at%2010.54.14%E2%80%AFPM-tCsoz7x0MUzpqAy3VGnkK5P2cKj1bN.png',
            'image_alt' => 'Trusted oil marketing companies',
            'data' => ['name' => 'Trusted brands strip'],
        ]);

        $features = [
            ['Nozzle Reading Management', 'Record opening and closing nozzle readings, calculate fuel sale quantity, and review nozzle-wise daily sales without manual register work.', 'Core'],
            ['Tank Dipping & Stock Control', 'Track tank stock, purchases, sales, dip readings, and dip gain/loss for petrol, diesel, HOBC, and lubricants.', 'Core'],
            ['Cash & Credit Sales', 'Separate cash sales, credit sales, card sales, and bulk sales so daily closing stays clear and easy to verify.', null],
            ['Customer Credit Management', 'Maintain customer ledgers, vehicle-wise billing, monthly credit bills, payments, and outstanding balances.', 'Popular'],
            ['Daily Closing Reports', 'Review sales, stock, cash, credit, expenses, and shift-wise closing reports from one dashboard.', null],
            ['Accounts & Ledgers', 'Manage cash book, ledgers, supplier payments, receivables, payables, profit/loss, and balance sheet reports.', null],
            ['Mobile Owner Dashboard', 'Check sales, stock, cash, credit, and reports from mobile without staying at the station all day.', null],
            ['Automation Station Monitoring', 'Support for dispenser integration and ATG tank monitoring can help track live nozzle sales and tank stock.', null],
            ['AI Reporting & Business Analysis', 'Use smart reports to review station performance, stock movement, receivables, and business trends.', 'AI Powered'],
        ];
        foreach ($features as $i => [$title, $desc, $badge]) {
            $sections[] = $this->published([
                'market_code' => $m, 'locale_code' => $l, 'page_slug' => 'home', 'section_key' => 'feature:card', 'sort_order' => $i,
                'title' => $title,
                'description' => $desc,
                'data' => ['badge' => $badge],
            ]);
        }

        $plans = [
            ['Starter', '4,999', '49,999', 'Perfect for single station owners', false, ['1 Fuel Station', 'Up to 4 Nozzles', 'Basic Reports', 'Email Support', 'Mobile App Access']],
            ['Professional', '9,999', '99,999', 'For growing fuel businesses', true, ['Up to 3 Stations', 'Unlimited Nozzles', 'Advanced Reports', 'Priority Support', 'WhatsApp Integration', 'Credit Management', 'Multi-user Access']],
            ['Enterprise', 'Custom', 'Custom', 'For large fuel networks', false, ['Unlimited Stations', 'Dedicated Account Manager', 'Custom Integrations', 'On-site Training', 'SLA Guarantee', 'API Access', 'White-label Option']],
        ];
        foreach ($plans as $i => [$name, $price, $yearly, $desc, $popular, $feats]) {
            $sections[] = $this->published([
                'market_code' => $m, 'locale_code' => $l, 'page_slug' => 'pricing', 'section_key' => 'plan', 'sort_order' => $i,
                'title' => $name,
                'description' => $desc,
                'link_label' => 'Get Started',
                'link_url' => '/contact',
                'data' => [
                    'price' => $price,
                    'price_yearly' => $yearly,
                    'period' => 'month',
                    'is_popular' => $popular,
                    'features' => $feats,
                ],
            ]);
        }

        $faqs = [
            ['What is Petroleu?', 'Petroleu is petrol pump management software for fuel stations in Pakistan — covering nozzle readings, tank stock, credit customers, accounts, and reports.'],
            ['Who is Petroleu for?', 'Independent pumps, dealer networks, and multi-station operators who need reliable daily closing and stock control.'],
            ['Does Petroleu support Urdu?', 'Yes. Station staff can work in Urdu or English depending on your configuration.'],
            ['How do I request a demo?', 'Use the contact form or WhatsApp on this website and our team will schedule a walkthrough.'],
        ];
        foreach ($faqs as $i => [$q, $a]) {
            $sections[] = $this->published([
                'market_code' => $m, 'locale_code' => $l, 'page_slug' => 'home', 'section_key' => 'faq', 'sort_order' => $i,
                'title' => $q,
                'description' => $a,
                'content' => $a,
                'data' => ['question' => $q, 'answer' => $a],
            ]);
        }

        $how = [
            ['Share your station details', 'Tell us about your pumps, tanks, and current workflow.'],
            ['We configure Petroleu', 'Our team sets up products, tanks, users, and reporting for your site.'],
            ['Train your staff', 'Attendants and managers learn daily closing, dipping, and credit billing.'],
            ['Go live with support', 'Run live operations with onboarding support from Petroleu.'],
        ];
        foreach ($how as $i => [$title, $desc]) {
            $sections[] = $this->published([
                'market_code' => $m, 'locale_code' => $l, 'page_slug' => 'home', 'section_key' => 'how-it-works', 'sort_order' => $i,
                'title' => $title,
                'description' => $desc,
                'data' => ['step_number' => $i + 1],
            ]);
        }

        $ctas = [
            ['home-mid', 'Ready to modernize your petrol pump?', 'Talk to Petroleu about nozzle, stock, credit, and reporting needs.', 'Contact Sales', '/contact', 'WhatsApp', 'https://wa.me/923257865000'],
            ['home-bottom', 'Start with Petroleu today', 'Request a demo and see daily closing, dipping, and credit tools in action.', 'Get Started', '/get-started', 'View Pricing', '/pricing'],
            ['features', 'See every module in action', 'Request a walkthrough tailored to your station.', 'Contact Us', '/contact', null, null],
            ['about', 'Work with the Petroleu team', 'We help fuel stations across Pakistan run cleaner daily operations.', 'Contact', '/contact', null, null],
            ['contact', 'Prefer WhatsApp?', 'Message our sales team for a quick response.', 'WhatsApp', 'https://wa.me/923257865000', null, null],
        ];
        foreach ($ctas as $i => [$page, $heading, $sub, $b1, $l1, $b2, $l2]) {
            $sections[] = $this->published([
                'market_code' => $m, 'locale_code' => $l, 'page_slug' => $page, 'section_key' => 'cta', 'sort_order' => 0,
                'title' => $heading,
                'description' => $sub,
                'link_label' => $b1,
                'link_url' => $l1,
                'data' => ['btn1_text' => $b1, 'btn1_link' => $l1, 'btn2_text' => $b2, 'btn2_link' => $l2],
            ]);
        }

        foreach (['features', 'about', 'contact'] as $page) {
            $sections[] = $this->published([
                'market_code' => $m, 'locale_code' => $l, 'page_slug' => $page, 'section_key' => 'hero', 'sort_order' => 0,
                'title' => match ($page) {
                    'features' => 'Everything your petrol pump needs',
                    'about' => 'About Petroleu',
                    default => 'Contact Petroleu',
                },
                'description' => match ($page) {
                    'features' => 'From nozzle readings to accounts — modules built for Pakistan fuel stations.',
                    'about' => 'Digital Softs builds Petroleu for petrol pump owners and managers.',
                    default => 'Send a message and our team will respond within one business day.',
                },
                'data' => ['badge' => 'Petroleu'],
            ]);
        }

        $why = [
            ['Built for Pakistan pumps', 'Workflows match local nozzle, dipping, and credit practices.'],
            ['Reliable daily closing', 'Cash, credit, and stock figures stay tied together.'],
            ['Owner visibility', 'Check station health from mobile without being on-site all day.'],
            ['Supported onboarding', 'Training and setup help your team start with confidence.'],
        ];
        foreach ($why as $i => [$title, $desc]) {
            $sections[] = $this->published([
                'market_code' => $m, 'locale_code' => $l, 'page_slug' => 'home', 'section_key' => 'why-choose', 'sort_order' => $i,
                'title' => $title,
                'description' => $desc,
            ]);
        }

        $brands = ['PSO', 'Shell', 'Total', 'Attock', 'Independent'];
        foreach ($brands as $i => $name) {
            $sections[] = $this->published([
                'market_code' => $m, 'locale_code' => $l, 'page_slug' => 'home', 'section_key' => 'supported-brand', 'sort_order' => $i,
                'title' => $name,
                'data' => ['name' => $name],
            ]);
        }

        $industries = [
            ['Retail Petrol Pumps', 'Daily nozzle, stock, and credit tools for retail forecourts.'],
            ['Dealer Networks', 'Multi-station visibility for dealers and distributors.'],
            ['Fleet & Credit Customers', 'Vehicle-wise billing and receivables tracking.'],
        ];
        foreach ($industries as $i => [$title, $desc]) {
            $sections[] = $this->published([
                'market_code' => $m, 'locale_code' => $l, 'page_slug' => 'home', 'section_key' => 'industry', 'sort_order' => $i,
                'title' => $title,
                'description' => $desc,
            ]);
        }

        $mobile = [
            ['Live sales snapshot', 'See cash and credit sales without waiting for paper reports.'],
            ['Stock alerts', 'Spot low tanks before you run out.'],
            ['Shift status', 'Review attendant closing figures on the go.'],
        ];
        foreach ($mobile as $i => [$title, $desc]) {
            $sections[] = $this->published([
                'market_code' => $m, 'locale_code' => $l, 'page_slug' => 'home', 'section_key' => 'mobile-feature', 'sort_order' => $i,
                'title' => $title,
                'description' => $desc,
            ]);
        }

        $analytics = [
            ['Margin trends', 'Track buying vs selling rates and profitability.'],
            ['Station compare', 'Compare outlets across your network.'],
            ['Credit recovery', 'Focus on customers with rising outstanding balances.'],
        ];
        foreach ($analytics as $i => [$title, $desc]) {
            $sections[] = $this->published([
                'market_code' => $m, 'locale_code' => $l, 'page_slug' => 'home', 'section_key' => 'analytics-card', 'sort_order' => $i,
                'title' => $title,
                'description' => $desc,
            ]);
        }

        $testimonials = [
            ['Urdu interface helps our attendants with nozzle entry and shift closing.', 'Station Manager', 'Lahore'],
            ['Credit customers like receiving WhatsApp invoice details after fills.', 'Owner', 'Karachi'],
            ['Daily closing is faster since stock and sales stay in one system.', 'Operations Lead', 'Islamabad'],
        ];
        foreach ($testimonials as $i => [$quote, $role, $city]) {
            $sections[] = $this->published([
                'market_code' => $m, 'locale_code' => $l, 'page_slug' => 'home', 'section_key' => 'testimonial', 'sort_order' => $i,
                'title' => $role,
                'description' => $quote,
                'content' => $quote,
                'data' => [
                    'quote' => $quote,
                    'author_name' => $role,
                    'author_role' => $role,
                    'author_company' => $city,
                    'city' => $city,
                    'rating' => 5,
                ],
            ]);
        }

        $missions = [
            ['Accuracy', 'Reduce register mistakes with structured nozzle and stock entry.'],
            ['Visibility', 'Give owners clear mobile insight into station performance.'],
            ['Support', 'Help teams adopt Petroleu with practical training.'],
        ];
        foreach ($missions as $i => [$title, $desc]) {
            $sections[] = $this->published([
                'market_code' => $m, 'locale_code' => $l, 'page_slug' => 'about', 'section_key' => 'mission', 'sort_order' => $i,
                'title' => $title,
                'description' => $desc,
            ]);
        }

        $sections[] = $this->published([
            'market_code' => $m, 'locale_code' => $l, 'page_slug' => 'about', 'section_key' => 'story', 'sort_order' => 0,
            'title' => 'Our story',
            'content' => 'Petroleu is built by Digital Softs for petrol pump operators who need reliable stock, sales, credit, and accounting tools.',
            'description' => 'Petroleu is built by Digital Softs for petrol pump operators who need reliable stock, sales, credit, and accounting tools.',
        ]);

        $sections[] = $this->published([
            'market_code' => $m, 'locale_code' => $l, 'page_slug' => 'legal', 'section_key' => 'privacy-policy', 'sort_order' => 0,
            'title' => 'Privacy Policy',
            'content' => "Petroleu respects your privacy.\n\nWe collect contact details you submit through forms to respond to sales and support requests. We do not sell personal data. Contact sales@petroleu.com for privacy questions.",
            'description' => 'Privacy Policy',
        ]);

        foreach ($sections as $row) {
            // encode JSON fields for create
            if (isset($row['data']) && is_array($row['data'])) {
                // Eloquent casts handle array
            }
            CmsSection::create($row);
        }
    }

    protected function seedNavigation($now): void
    {
        CmsNavigationItem::where('market_code', 'pk')->delete();
        $items = [
            ['Features', '/features'],
            ['Pricing', '/pricing'],
            ['Industries', '/industries'],
            ['About', '/about'],
            ['Blog', '/blog'],
            ['FAQ', '/faq'],
            ['Contact', '/contact'],
        ];
        foreach ($items as $i => [$label, $url]) {
            CmsNavigationItem::create([
                'market_code' => 'pk',
                'locale_code' => 'en-PK',
                'location' => 'header',
                'label' => $label,
                'url' => $url,
                'sort_order' => $i,
                'is_enabled' => true,
                'status' => 'published',
                'published_at' => $now,
            ]);
        }

        // AF header placeholders remain draft
        foreach ([['صفحه اصلی', '/af'], ['تماس', '/af/contact']] as $i => [$label, $url]) {
            CmsNavigationItem::create([
                'market_code' => 'af',
                'locale_code' => 'fa-AF',
                'location' => 'header',
                'label' => $label,
                'url' => $url,
                'sort_order' => $i,
                'is_enabled' => true,
                'status' => 'draft',
            ]);
        }
    }

    protected function seedSettings($now): void
    {
        $settings = [
            ['site_name', 'Petroleu', 'text', 'Site Name', 'general'],
            ['site_tagline', 'Modern fuel station management software for Pakistan.', 'text', 'Site Tagline', 'general'],
            ['sales_email', 'sales@petroleu.com', 'email', 'Sales Email', 'contact'],
            ['primary_email', 'support@petroleu.com', 'email', 'Support Email', 'contact'],
            ['contact_email', 'sales@petroleu.com', 'email', 'Contact Email', 'contact'],
            ['phone', '0325 7865000', 'text', 'Phone', 'contact'],
            ['whatsapp', '923257865000', 'text', 'WhatsApp', 'contact'],
            ['address', 'Karachi, Pakistan.', 'text', 'Address', 'contact'],
            ['address_pk', 'Karachi, Pakistan.', 'text', 'Address PK', 'contact'],
            ['currency', 'PKR', 'text', 'Currency', 'regional'],
            ['demo_admin_emails', env('CMS_PK_INQUIRY_RECIPIENTS', ''), 'textarea', 'Admin Notification Emails', 'demo'],
            ['facebook_url', '', 'url', 'Facebook', 'social'],
            ['instagram_url', '', 'url', 'Instagram', 'social'],
            ['linkedin_url', '', 'url', 'LinkedIn', 'social'],
            ['youtube_url', '', 'url', 'YouTube', 'social'],
        ];
        foreach ($settings as [$key, $value, $type, $label, $grp]) {
            CmsSetting::updateOrCreate(
                ['market_code' => 'pk', 'locale_code' => null, 'key' => $key],
                ['value' => $value, 'type' => $type, 'label' => $label, 'grp' => $grp, 'is_shared' => false]
            );
        }

        CmsSetting::updateOrCreate(
            ['market_code' => 'af', 'locale_code' => null, 'key' => 'currency'],
            ['value' => 'AFN', 'type' => 'text', 'label' => 'Currency', 'grp' => 'regional', 'is_shared' => false]
        );
        CmsSetting::updateOrCreate(
            ['market_code' => 'af', 'locale_code' => null, 'key' => 'site_name'],
            ['value' => 'Petroleu Afghanistan', 'type' => 'text', 'label' => 'Site Name', 'grp' => 'general', 'is_shared' => false]
        );
    }

    protected function seedSeo($now): void
    {
        $pages = [
            ['/', 'Petroleu — Petrol Pump Software Pakistan', 'Petrol pump management software for Pakistan — stock, nozzle sales, credit, payroll & reports.'],
            ['/features', 'Features | Petroleu', 'Explore Petroleu modules for petrol pump operations in Pakistan.'],
            ['/pricing', 'Pricing | Petroleu', 'Petroleu pricing for Pakistani petrol pumps.'],
            ['/contact', 'Contact | Petroleu', 'Contact Petroleu sales and support.'],
            ['/about', 'About | Petroleu', 'About Petroleu and Digital Softs.'],
        ];
        foreach ($pages as [$path, $title, $desc]) {
            CmsSeoEntry::updateOrCreate(
                ['market_code' => 'pk', 'locale_code' => 'en-PK', 'path' => $path],
                [
                    'title' => $title,
                    'description' => $desc,
                    'canonical_url' => 'https://petroleu.com'.$path,
                    'og_title' => $title,
                    'og_description' => $desc,
                    'og_locale' => 'en_PK',
                    'noindex' => false,
                    'hreflang' => [
                        ['hreflang' => 'en-pk', 'href' => 'https://petroleu.com'.$path],
                        ['hreflang' => 'x-default', 'href' => 'https://petroleu.com'.$path],
                    ],
                    'status' => 'published',
                    'published_at' => $now,
                ]
            );
        }

        // AF SEO shells remain draft / noindex
        foreach (['/af', '/af/ps', '/af/en'] as $path) {
            CmsSeoEntry::updateOrCreate(
                ['market_code' => 'af', 'locale_code' => str_contains($path, '/ps') ? 'ps-AF' : (str_contains($path, '/en') ? 'en-AF' : 'fa-AF'), 'path' => $path],
                [
                    'title' => 'Petroleu Afghanistan (Coming Soon)',
                    'description' => 'Petroleu Afghanistan market page — content unpublished pending review.',
                    'canonical_url' => 'https://petroleu.com'.$path,
                    'og_locale' => str_contains($path, '/ps') ? 'ps_AF' : (str_contains($path, '/en') ? 'en_AF' : 'fa_AF'),
                    'noindex' => true,
                    'status' => 'draft',
                    'published_at' => null,
                ]
            );
        }
    }

    protected function seedAfghanistanPlaceholders($now): void
    {
        CmsPage::updateOrCreate(
            ['market_code' => 'af', 'locale_code' => 'fa-AF', 'slug' => 'home'],
            [
                'title' => 'خانه',
                'description' => 'Afghanistan home (draft)',
                'status' => 'draft',
                'is_enabled' => false,
            ]
        );

        // Draft-only hero so public API returns nothing for AF until published
        CmsSection::updateOrCreate(
            [
                'market_code' => 'af',
                'locale_code' => 'fa-AF',
                'page_slug' => 'home',
                'section_key' => 'hero',
                'sort_order' => 0,
            ],
            [
                'title' => 'نرم‌افزار مدیریت پطرول پمپ',
                'description' => 'پیش‌نویس — منتشر نشده',
                'status' => 'draft',
                'is_enabled' => false,
                'data' => ['badge' => 'Petroleu Afghanistan', 'title_highlight' => 'افغانستان'],
            ]
        );
    }
}
