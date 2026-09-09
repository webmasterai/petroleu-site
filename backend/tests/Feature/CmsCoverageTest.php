<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsCoverageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\CmsPakistanContentSeeder::class);
        $this->seed(\Database\Seeders\CmsCoverageCompletionSeeder::class);
    }

    public function test_blog_posts_seeded_and_public(): void
    {
        $res = $this->getJson('/api/cms/blog?market=pk&locale=en-PK');
        $res->assertOk();
        $this->assertGreaterThanOrEqual(15, count($res->json('data')));
    }

    public function test_media_imported(): void
    {
        $this->assertGreaterThan(0, \App\Models\Cms\CmsMedia::count());
    }

    public function test_header_navigation_published_for_pk(): void
    {
        $res = $this->getJson('/api/cms/navigation?market=pk&locale=en-PK&location=header');
        $res->assertOk();
        $this->assertNotEmpty($res->json('data'));
    }

    public function test_afghanistan_drafts_not_public(): void
    {
        $this->getJson('/api/cms/hero/home?market=af&locale=fa-AF')->assertStatus(404);
        $this->assertTrue(
            \App\Models\Cms\CmsPage::where('market_code', 'af')->where('status', 'draft')->exists()
        );
    }

    public function test_afghanistan_full_site_published_when_seeded(): void
    {
        $this->seed(\Database\Seeders\CmsAfghanistanFullSiteSeeder::class);
        $this->getJson('/api/cms/hero/home?market=af&locale=fa-AF')->assertOk();
        $features = $this->getJson('/api/cms/features?market=af&locale=en-AF&page=home&type=card')->json('data');
        $this->assertNotEmpty($features);
    }

    public function test_af_features_empty_not_pk(): void
    {
        $res = $this->getJson('/api/cms/features?market=af&locale=fa-AF&page=home&type=card');
        $res->assertOk();
        $this->assertSame([], $res->json('data'));
    }
}
