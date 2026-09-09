<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Tests\TestCase;

class CmsMediaUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_media_upload_validation_and_success(): void
    {
        Storage::fake('public');
        $this->seed(\Database\Seeders\CmsPakistanContentSeeder::class);

        $admin = User::factory()->create([
            'password' => 'password-password',
            'role' => 'cms_admin',
            'is_active' => true,
        ]);

        $login = $this->postJson('/api/cms/admin/login', [
            'email' => $admin->email,
            'password' => 'password-password',
        ]);
        $token = $login->json('data.token');

        $this->withToken($token)
            ->post('/api/cms/admin/media', [
                'file' => UploadedFile::fake()->create('notes.txt', 100, 'text/plain'),
            ], ['Accept' => 'application/json'])
            ->assertStatus(422);

        $ok = $this->withToken($token)->post('/api/cms/admin/media', [
            'file' => UploadedFile::fake()->image('hero.jpg', 200, 100),
            'alt_text' => 'Hero image',
            'market_code' => 'pk',
        ], ['Accept' => 'application/json']);
        $ok->assertCreated();
        $this->assertDatabaseHas('cms_media', ['alt_text' => 'Hero image', 'market_code' => 'pk']);
    }
}
