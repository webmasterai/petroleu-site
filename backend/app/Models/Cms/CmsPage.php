<?php

namespace App\Models\Cms;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CmsPage extends Model
{
    use SoftDeletes;

    protected $table = 'cms_pages';

    protected $fillable = [
        'market_code', 'locale_code', 'slug', 'title', 'description',
        'template', 'frontend_path', 'sort_order',
        'is_enabled', 'status', 'is_shared', 'published_at', 'translation_status',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'is_shared' => 'boolean',
            'published_at' => 'datetime',
        ];
    }
}
