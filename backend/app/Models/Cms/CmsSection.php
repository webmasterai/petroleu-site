<?php

namespace App\Models\Cms;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CmsSection extends Model
{
    use SoftDeletes;

    protected $table = 'cms_sections';

    protected $fillable = [
        'market_code', 'locale_code', 'page_slug', 'section_key', 'frontend_path',
        'title', 'description', 'content', 'data',
        'image_url', 'image_alt', 'media_id',
        'link_label', 'link_url', 'sort_order',
        'is_enabled', 'status', 'is_shared', 'published_at', 'translation_status',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'is_enabled' => 'boolean',
            'is_shared' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function publish(): void
    {
        $this->status = 'published';
        $this->published_at = now();
        $this->is_enabled = true;
        $this->save();
    }

    public function unpublish(): void
    {
        $this->status = 'draft';
        $this->published_at = null;
        $this->save();
    }

    public function duplicate(): self
    {
        $copy = $this->replicate(['published_at']);
        $copy->title = ($this->title ? $this->title.' (copy)' : null);
        $copy->status = 'draft';
        $copy->published_at = null;
        $copy->sort_order = (int) $this->sort_order + 1;
        $copy->save();

        return $copy;
    }
}
