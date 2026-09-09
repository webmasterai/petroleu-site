<?php

namespace App\Models\Cms;

use Illuminate\Database\Eloquent\Model;

class CmsSetting extends Model
{
    protected $table = 'cms_settings';

    protected $fillable = [
        'market_code', 'locale_code', 'key', 'value', 'type', 'label', 'grp', 'is_shared',
    ];

    protected function casts(): array
    {
        return ['is_shared' => 'boolean'];
    }
}
