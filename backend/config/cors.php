<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Origins come only from environment — no hardcoded production domains.
    | Set FRONTEND_URL and optionally CORS_ALLOWED_ORIGINS (comma-separated).
    |
    | CMS clients use Bearer tokens (Authorization). Cookie credentials are off.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_values(array_unique(array_filter(array_merge(
        [env('FRONTEND_URL')],
        array_map('trim', explode(',', (string) env('CORS_ALLOWED_ORIGINS', '')))
    )))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'Origin',
        'X-Requested-With',
        'X-XSRF-TOKEN',
    ],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
