<?php

namespace App\Models\Cms;

use Illuminate\Database\Eloquent\Model;

class CmsMarket extends Model
{
    protected $table = 'cms_markets';

    protected $fillable = [
        'code', 'name', 'default_locale', 'currency', 'phone', 'phone_tel',
        'whatsapp', 'email', 'sales_email', 'support_email', 'address',
        'inquiry_recipients', 'form_source', 'social_links', 'regional_settings',
        'is_active', 'is_shared',
    ];

    protected function casts(): array
    {
        return [
            'social_links' => 'array',
            'regional_settings' => 'array',
            'is_active' => 'boolean',
            'is_shared' => 'boolean',
        ];
    }
}
