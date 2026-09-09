<?php

namespace App\Models\Cms;

use Illuminate\Database\Eloquent\Model;

class CmsLocale extends Model
{
    protected $table = 'cms_locales';

    protected $fillable = [
        'code', 'name', 'native_name', 'dir', 'font_stack', 'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }
}
