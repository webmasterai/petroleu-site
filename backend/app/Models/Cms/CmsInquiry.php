<?php

namespace App\Models\Cms;

use Illuminate\Database\Eloquent\Model;

class CmsInquiry extends Model
{
    protected $table = 'cms_inquiries';

    protected $fillable = [
        'type', 'market_code', 'locale_code', 'source',
        'full_name', 'email', 'phone', 'company', 'stations',
        'city', 'address', 'fuel_brand', 'message',
        'status', 'admin_notes', 'ip_address', 'user_agent', 'replied_at',
    ];

    protected function casts(): array
    {
        return ['replied_at' => 'datetime'];
    }
}
