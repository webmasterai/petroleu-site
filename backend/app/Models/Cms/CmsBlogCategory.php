<?php

namespace App\Models\Cms;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CmsBlogCategory extends Model
{
    protected $table = 'cms_blog_categories';

    protected $fillable = [
        'market_code', 'locale_code', 'slug', 'name', 'description',
        'sort_order', 'is_enabled', 'status', 'is_shared', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'is_shared' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function posts(): HasMany
    {
        return $this->hasMany(CmsBlogPost::class, 'category_id');
    }
}
