<?php

namespace App\Models\Cms;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CmsBlogPost extends Model
{
    use SoftDeletes;

    protected $table = 'cms_blog_posts';

    protected $fillable = [
        'market_code', 'locale_code', 'slug', 'title', 'excerpt', 'content',
        'image_url', 'image_alt', 'category_id', 'author',
        'tags', 'related_slugs', 'seo_title', 'seo_description', 'canonical_url', 'og_image',
        'media_type', 'video_url', 'duration', 'show_on_homepage',
        'sort_order', 'is_enabled', 'status', 'is_shared', 'noindex', 'published_at', 'translation_status',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'related_slugs' => 'array',
            'is_enabled' => 'boolean',
            'is_shared' => 'boolean',
            'noindex' => 'boolean',
            'show_on_homepage' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CmsBlogCategory::class, 'category_id');
    }
}
