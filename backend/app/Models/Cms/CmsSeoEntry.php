<?php

namespace App\Models\Cms;

use Illuminate\Database\Eloquent\Model;

class CmsSeoEntry extends Model
{
    protected $table = 'cms_seo_entries';

    protected $fillable = [
        'market_code', 'locale_code', 'path', 'title', 'description', 'keywords',
        'canonical_url', 'og_title', 'og_description', 'og_image', 'og_locale',
        'noindex', 'hreflang', 'status', 'is_shared', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'hreflang' => 'array',
            'noindex' => 'boolean',
            'is_shared' => 'boolean',
            'published_at' => 'datetime',
        ];
    }
}
