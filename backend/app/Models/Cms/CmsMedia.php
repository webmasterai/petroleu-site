<?php

namespace App\Models\Cms;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CmsMedia extends Model
{
    use SoftDeletes;

    protected $table = 'cms_media';

    protected $fillable = [
        'market_code', 'locale_code', 'source', 'disk', 'path', 'url', 'original_name',
        'mime_type', 'media_kind', 'size', 'width', 'height', 'duration_seconds',
        'alt_text', 'caption', 'poster_url', 'title', 'uploaded_by',
    ];

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
