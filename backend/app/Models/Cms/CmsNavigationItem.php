<?php

namespace App\Models\Cms;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CmsNavigationItem extends Model
{
    use SoftDeletes;

    protected $table = 'cms_navigation_items';

    protected $fillable = [
        'market_code', 'locale_code', 'location', 'menu_group', 'label', 'url',
        'parent_id', 'children_data', 'sort_order',
        'is_enabled', 'status', 'is_shared', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'children_data' => 'array',
            'is_enabled' => 'boolean',
            'is_shared' => 'boolean',
            'published_at' => 'datetime',
        ];
    }
}
