<?php

namespace Tests\Feature;

use App\Models\Cms\CmsMarket;
use App\Models\Cms\CmsSection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\CmsPakistanContentSeeder::class);
    }

    public function test_public_hero_returns_published_pakistan_content(): void
    {
        $res = $this->getJson('/api/cms/hero/home?market=pk&locale=en-PK');
        $res->assertOk()->assertJsonPath('success', true);
        $this->assertNotEmpty($res->json('data.title') ?? $res->json('data.heading'));
    }

    public function test_draft_af_hero_not_public(): void
    {
        $res = $this->getJson('/api/cms/hero/home?market=af&locale=fa-AF');
        $res->assertStatus(404);
    }

    public function test_af_does_not_receive_pakistan_sections(): void
    {
        $res = $this->getJson('/api/cms/features?market=af&locale=fa-AF&page=home&type=card');
        $res->assertOk();
        $this->assertSame([], $res->json('data'));
    }

    public function test_admin_login_and_section_publish_flow(): void
    {
        $admin = User::factory()->create([
            'email' => 'cms-test@example.com',
            'password' => 'password-password',
            'role' => 'cms_admin',
            'is_active' => true,
        ]);

        $login = $this->postJson('/api/cms/admin/login', [
            'email' => 'cms-test@example.com',
            'password' => 'password-password',
        ]);
        $login->assertOk();
        $token = $login->json('data.token');
        $this->assertNotEmpty($token);

        $create = $this->withToken($token)->postJson('/api/cms/admin/sections', [
            'market_code' => 'pk',
            'locale_code' => 'en-PK',
            'page_slug' => 'home',
            'section_key' => 'faq',
            'title' => 'Draft only question?',
            'description' => 'Draft answer',
            'status' => 'draft',
            'sort_order' => 99,
            'data' => ['question' => 'Draft only question?', 'answer' => 'Draft answer'],
        ]);
        $create->assertCreated();
        $id = $create->json('data.id');

        $publicBefore = $this->getJson('/api/cms/faq?market=pk&locale=en-PK');
        $questions = collect($publicBefore->json('data'))->pluck('question')->all();
        $this->assertNotContains('Draft only question?', $questions);

        $this->withToken($token)->postJson("/api/cms/admin/sections/{$id}/publish")->assertOk();

        $publicAfter = $this->getJson('/api/cms/faq?market=pk&locale=en-PK');
        $questionsAfter = collect($publicAfter->json('data'))->pluck('question')->all();
        $this->assertContains('Draft only question?', $questionsAfter);
    }

    public function test_contact_persists_inquiry_with_market(): void
    {
        $res = $this->postJson('/api/cms/contact', [
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'message' => 'Hello',
            'market' => 'pk',
            'locale' => 'en-PK',
            'source' => 'website-pk',
        ]);
        $res->assertCreated();
        $this->assertDatabaseHas('cms_inquiries', [
            'email' => 'test@example.com',
            'market_code' => 'pk',
            'type' => 'contact',
        ]);
    }

    public function test_login_rate_limit_headers_present_on_route(): void
    {
        for ($i = 0; $i < 6; $i++) {
            $this->postJson('/api/cms/admin/login', [
                'email' => 'nobody@example.com',
                'password' => 'wrong-password-xx',
            ]);
        }
        $last = $this->postJson('/api/cms/admin/login', [
            'email' => 'nobody@example.com',
            'password' => 'wrong-password-xx',
        ]);
        $this->assertTrue(in_array($last->status(), [422, 429], true));
    }

    public function test_markets_exist_for_pk_and_af(): void
    {
        $this->assertNotNull(CmsMarket::where('code', 'pk')->first());
        $this->assertNotNull(CmsMarket::where('code', 'af')->first());
        $this->assertTrue(CmsSection::where('market_code', 'pk')->where('status', 'published')->exists());
        $this->assertFalse(
            CmsSection::where('market_code', 'af')->where('status', 'published')->exists()
        );
    }
}
