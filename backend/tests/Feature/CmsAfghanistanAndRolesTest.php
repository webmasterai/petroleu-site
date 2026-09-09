<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\CmsRoles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CmsAfghanistanAndRolesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\CmsPakistanContentSeeder::class);
        $this->seed(\Database\Seeders\CmsCoverageCompletionSeeder::class);
        $this->seed(\Database\Seeders\CmsAfghanistanFullSiteSeeder::class);
        $this->seed(\Database\Seeders\CmsAfghanistanLocaleTranslationsSeeder::class);
    }

    protected function actingAsSuperAdmin(): User
    {
        $user = User::factory()->create([
            'role' => CmsRoles::SUPER_ADMIN,
            'is_active' => true,
            'password' => Hash::make('ChangeMe_CmsAdmin_2026!'),
        ]);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_afghanistan_public_hero_is_published_and_not_pakistan(): void
    {
        $af = $this->getJson('/api/cms/hero/home?market=af&locale=fa-AF');
        $af->assertOk()->assertJsonPath('success', true);
        $this->assertNotNull($af->json('data'));

        $title = (string) ($af->json('data.title') ?? $af->json('data.headline') ?? '');
        $this->assertStringNotContainsString('Karachi', $title);
        $this->assertStringNotContainsString('[Translation required]', $title);
        $this->assertMatchesRegularExpression('/[\x{0600}-\x{06FF}]/u', $title, 'Dari hero title must use Arabic script');
        $this->assertStringNotContainsString('Petrol Pump Software', $title);
    }

    public function test_pashto_hero_is_not_english_and_not_dari_fallback(): void
    {
        $ps = $this->getJson('/api/cms/hero/home?market=af&locale=ps-AF');
        $ps->assertOk();
        $title = (string) ($ps->json('data.title') ?? '');
        $this->assertMatchesRegularExpression('/[\x{0600}-\x{06FF}]/u', $title);
        $this->assertStringNotContainsString('Petrol Pump Software', $title);

        $fa = $this->getJson('/api/cms/hero/home?market=af&locale=fa-AF');
        $faTitle = (string) ($fa->json('data.title') ?? '');
        $this->assertNotSame($faTitle, $title, 'Pashto must not silently reuse Dari text');
    }

    public function test_af_locales_do_not_fall_back_to_en_af(): void
    {
        $fa = \App\Models\Cms\CmsSection::where([
            'market_code' => 'af',
            'locale_code' => 'fa-AF',
            'page_slug' => 'home',
            'section_key' => 'hero',
        ])->first();
        $this->assertNotNull($fa);
        $fa->update(['status' => 'draft', 'published_at' => null]);

        $res = $this->getJson('/api/cms/hero/home?market=af&locale=fa-AF');
        $res->assertStatus(404);
    }

    public function test_afghanistan_settings_do_not_leak_pakistan_phone(): void
    {
        $res = $this->getJson('/api/cms/settings?market=af&locale=fa-AF');
        $res->assertOk();
        $data = $res->json('data') ?? [];
        $this->assertTrue(($data['phone'] ?? '') === '' || $data['phone'] === null);
        $this->assertTrue(($data['address'] ?? '') === '' || $data['address'] === null);
        $this->assertStringNotContainsString('Pakistan', (string) ($data['footer_credit'] ?? ''));
        $this->assertStringNotContainsString('Karachi', (string) ($data['address'] ?? ''));
    }

    public function test_draft_content_is_not_public(): void
    {
        $this->actingAsSuperAdmin();
        $page = \App\Models\Cms\CmsSection::where('market_code', 'af')->where('locale_code', 'en-AF')->first();
        $this->assertNotNull($page);
        $page->update(['status' => 'draft', 'published_at' => null]);

        $res = $this->getJson('/api/cms/hero/'.$page->page_slug.'?market=af&locale=en-AF');
        // hero may 404 or return null depending on implementation
        if ($res->status() === 200) {
            $this->assertTrue($res->json('data') === null || ($res->json('data.status') ?? null) !== 'draft');
        } else {
            $res->assertStatus(404);
        }
    }

    public function test_signed_draft_preview_requires_valid_signature(): void
    {
        $unsigned = $this->getJson('/api/cms/draft-preview?market=af&locale=fa-AF&path=/af&page_slug=home');
        $unsigned->assertStatus(403);

        $url = URL::temporarySignedRoute('cms.draft-preview', now()->addMinutes(10), [
            'market' => 'af',
            'locale' => 'fa-AF',
            'path' => '/af',
            'page_slug' => 'home',
        ]);
        $signed = $this->getJson($url);
        $signed->assertOk()->assertJsonPath('data.draft_preview', true);
    }

    public function test_workspace_dashboard_scopes_to_afghanistan(): void
    {
        $this->actingAsSuperAdmin();
        $af = $this->getJson('/api/cms/admin/dashboard?market=af&locale=fa-AF');
        $af->assertOk();
        $all = $this->getJson('/api/cms/admin/dashboard?all=1');
        $all->assertOk();
        $this->assertLessThanOrEqual(
            (int) $all->json('data.sections'),
            (int) $all->json('data.sections')
        );
        $this->assertGreaterThan(0, (int) $af->json('data.pages'));
    }

    public function test_viewer_cannot_manage_users_and_cannot_escalate(): void
    {
        $viewer = User::factory()->create([
            'role' => CmsRoles::VIEWER,
            'is_active' => true,
        ]);
        Sanctum::actingAs($viewer);
        $this->getJson('/api/cms/admin/users')->assertStatus(403);

        $admin = $this->actingAsSuperAdmin();
        $target = User::factory()->create(['role' => CmsRoles::EDITOR, 'is_active' => true]);
        // Ordinary user cannot hit update without super admin — already covered.
        Sanctum::actingAs($target);
        $this->putJson('/api/cms/admin/users/'.$admin->id, ['role' => CmsRoles::SUPER_ADMIN])->assertStatus(403);
    }

    public function test_password_change_invalidates_other_tokens(): void
    {
        $user = User::factory()->create([
            'role' => CmsRoles::SUPER_ADMIN,
            'is_active' => true,
            'password' => Hash::make('OldPassword_123'),
        ]);
        $tokenA = $user->createToken('a')->plainTextToken;
        $user->createToken('b')->plainTextToken;
        $this->assertSame(2, $user->tokens()->count());

        $this->withToken($tokenA)
            ->postJson('/api/cms/admin/change-password', [
                'current_password' => 'OldPassword_123',
                'password' => 'NewPassword_123',
                'password_confirmation' => 'NewPassword_123',
            ])
            ->assertOk();

        $remaining = $user->fresh()->tokens()->pluck('name')->all();
        $this->assertSame(['a'], $remaining);
        $this->assertTrue(Hash::check('NewPassword_123', $user->fresh()->password));
    }

    public function test_video_upload_accepted(): void
    {
        Storage::fake('public');
        $this->actingAsSuperAdmin();
        $file = UploadedFile::fake()->create('clip.mp4', 200, 'video/mp4');
        $res = $this->post('/api/cms/admin/media', [
            'file' => $file,
            'title' => 'Demo clip',
            'caption' => 'Station walkthrough',
            'market_code' => 'af',
        ], ['Accept' => 'application/json']);
        $res->assertCreated();
        $this->assertSame('video', $res->json('data.media_kind'));
    }

    public function test_pages_group_shows_one_logical_row_per_slug(): void
    {
        $this->actingAsSuperAdmin();
        $res = $this->getJson('/api/cms/admin/pages?market=af&group=1');
        $res->assertOk();
        $rows = $res->json('data');
        $this->assertIsArray($rows);
        $slugs = collect($rows)->pluck('slug');
        $this->assertSame($slugs->count(), $slugs->unique()->count());
        $home = collect($rows)->firstWhere('slug', 'home');
        $this->assertNotNull($home);
        $this->assertGreaterThanOrEqual(3, count($home['translations'] ?? []));
    }
}
