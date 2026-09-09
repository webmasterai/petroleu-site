# Petroleu developer resources

Integrate with Petroleu using our read-only public API. These endpoints expose product information, features, pricing, FAQs, and contact details suitable for AI agents, partner integrations, and developer tooling.

Write APIs, customer data, station sales, accounts, invoices, and admin CMS endpoints require Sanctum authentication and are not available through the public API. API keys for write access require partnership approval.

## API overview

Base URL: https://www.petroleu.com/api/public

All public endpoints return JSON. Rate limit: 120 requests per minute per IP.

- GET /api/public/product — product overview
- GET /api/public/features — feature list
- GET /api/public/pricing — pricing plans
- GET /api/public/faqs — FAQ categories
- GET /api/public/contact — contact information
- GET /api/public/health — health check

## OpenAPI specification

Download the machine-readable OpenAPI 3.1 specification:

- https://www.petroleu.com/openapi.json
- https://www.petroleu.com/api/public/openapi.json

## Example requests

curl -s https://www.petroleu.com/api/public/product

- curl -s https://www.petroleu.com/api/public/features
- curl -s https://www.petroleu.com/api/public/pricing
- curl -s https://www.petroleu.com/api/public/health

## Error format

Errors return JSON with code, message, resolution, status, and optional requestId. Example: RESOURCE_NOT_FOUND for unknown API paths.

## Support

Email sales@petroleu.com for partnership API access or integration questions.

Canonical: https://www.petroleu.com/developers
