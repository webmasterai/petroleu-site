<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CmsPakistanContentSeeder::class,
            CmsCoverageCompletionSeeder::class,
            CmsAfghanistanFullSiteSeeder::class,
            CmsAfghanistanLocaleTranslationsSeeder::class,
            CmsAfghanistanParityCompletionSeeder::class,
        ]);
    }
}
