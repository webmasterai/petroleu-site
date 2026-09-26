import { NextRequest, NextResponse } from 'next/server'
import { getGoogleReviews } from '../../../lib/googleReviews'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Public Google reviews endpoint (server-cached).
 * Never returns OAuth secrets or API keys.
 */
export async function GET(req: NextRequest) {
  const force = req.nextUrl.searchParams.get('refresh') === '1'
  try {
    const payload = await getGoogleReviews({ forceRefresh: force })
    return NextResponse.json({
      success: true,
      data: {
        source: payload.source,
        enabled: payload.enabled,
        rating: payload.rating,
        totalReviewCount: payload.totalReviewCount,
        listingUrl: payload.listingUrl,
        reviews: payload.reviews,
        pagesFetched: payload.pagesFetched,
        fetchedAt: payload.fetchedAt,
        limitation: payload.limitation,
        // surface soft errors for admin debugging without crashing UI
        error: payload.error,
      },
    })
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to load Google reviews',
        data: {
          source: 'unavailable',
          enabled: false,
          rating: null,
          totalReviewCount: null,
          listingUrl: null,
          reviews: [],
          pagesFetched: 0,
          fetchedAt: null,
          limitation: null,
          error: err instanceof Error ? err.message : String(err),
        },
      },
      { status: 200 },
    )
  }
}
