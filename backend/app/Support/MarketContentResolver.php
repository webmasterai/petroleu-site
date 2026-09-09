<?php

namespace App\Support;

use App\Models\Cms\CmsSection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class MarketContentResolver
{
    /**
     * Strict market + locale isolation.
     * AF: exact locale only — never fall back to en-AF (or any other AF locale).
     * PK: requested → shared only if is_shared.
     */
    public static function fallbackChain(string $market, string $locale, ?string $marketDefaultLocale = null): array
    {
        $chain = [
            ['market' => $market, 'locale' => $locale],
        ];

        if ($market === 'af') {
            // Dari / Pashto / AF English must never silently substitute each other.
            return $chain;
        }

        if ($marketDefaultLocale && $marketDefaultLocale !== $locale) {
            $chain[] = ['market' => $market, 'locale' => $marketDefaultLocale];
        }

        // Pakistan / shared: allow explicit shared market rows only
        $chain[] = ['market' => 'shared', 'locale' => $locale];
        if (! in_array($locale, ['en', 'en-PK', 'en-AF'], true)) {
            $chain[] = ['market' => 'shared', 'locale' => 'en'];
        }

        return $chain;
    }

    public static function publishedSectionsQuery(
        string $market,
        string $locale,
        ?string $pageSlug = null,
        ?string $sectionKey = null,
        ?string $defaultLocale = null,
        bool $allowShared = true,
    ): Collection {
        $chain = $allowShared
            ? self::fallbackChain($market, $locale, $defaultLocale)
            : [['market' => $market, 'locale' => $locale]];

        foreach ($chain as $step) {
            if ($step['market'] !== $market && $step['market'] !== 'shared') {
                continue;
            }
            // Never resolve AF from PK or vice versa
            if ($market === 'af' && $step['market'] !== 'af') {
                continue;
            }
            if ($market === 'pk' && $step['market'] === 'af') {
                continue;
            }

            $q = CmsSection::query()
                ->where('market_code', $step['market'])
                ->where('locale_code', $step['locale'])
                ->where('status', 'published')
                ->where('is_enabled', true)
                ->orderBy('sort_order');

            if ($step['market'] === 'shared') {
                $q->where('is_shared', true);
            }
            if ($pageSlug) {
                $q->where('page_slug', $pageSlug);
            }
            if ($sectionKey) {
                $q->where('section_key', $sectionKey);
            }

            if ($sectionKey) {
                $row = $q->first();
                if ($row) {
                    return collect([$row]);
                }
                continue;
            }

            $batch = $q->get();
            if ($batch->isNotEmpty()) {
                return $batch;
            }
        }

        return collect();
    }

    public static function firstPublishedSection(
        string $market,
        string $locale,
        string $pageSlug,
        string $sectionKey,
        ?string $defaultLocale = null,
    ): ?CmsSection {
        $batch = self::publishedSectionsQuery($market, $locale, $pageSlug, $sectionKey, $defaultLocale);

        return $batch->first();
    }

    public static function applyPublishedScope(Builder $query): Builder
    {
        return $query->where('status', 'published')->where('is_enabled', true);
    }

    public static function adaptPakistanTextToAfghanistan(string $text): string
    {
        $replacements = [
            'Pakistan' => 'Afghanistan',
            'Pakistani' => 'Afghan',
            'Karachi' => 'Afghanistan',
            'Lahore' => 'Afghanistan',
            'Islamabad' => 'Afghanistan',
            'PKR' => 'AFN',
            'en-PK' => 'en-AF',
            'Made with care in Pakistan' => 'Built for fuel stations in Afghanistan',
            'petrol pump software for Pakistan' => 'petrol pump software for Afghanistan',
            'fuel stations in Pakistan' => 'fuel stations in Afghanistan',
            'across Pakistan' => 'across Afghanistan',
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $text);
    }
}
