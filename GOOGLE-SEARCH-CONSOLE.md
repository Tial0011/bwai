# Google Search Console Setup

## 1. Add the website

1. Open Google Search Console.
2. Choose **Add property**.
3. Use the **URL-prefix** property type.
4. Enter the final production website URL.

> Before launch, replace `https://your-domain.example/` in the SEO tags, `robots.txt`, and `sitemap.xml` with the real website domain.

## 2. Verify ownership

Use one of Google's available verification methods. For a static Netlify site, the HTML tag or DNS verification method may be convenient.

Follow the verification instructions shown by Google for the selected property.

## 3. Submit the sitemap

After verification:

1. Open **Sitemaps** in Search Console.
2. Enter `sitemap.xml`.
3. Submit it.
4. Wait for Google to process the sitemap.

## 4. Request indexing

After the production site is live:

1. Open **URL Inspection** in Search Console.
2. Enter the homepage URL.
3. Choose **Request Indexing** if available.

Indexing is not guaranteed immediately. Google decides when and whether a page is indexed.

## Current SEO placeholder

The project currently uses:

`https://your-domain.example/`

This is intentionally a placeholder because the final production domain has not been provided yet.
