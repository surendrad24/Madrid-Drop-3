# Madrid-Drop-3

Shopify theme repository for **Phoria Jewellery**:
https://www.phoriajewellery.com/

## Theme Base + Scope
- Base theme: **Madrid** (`config/settings_schema.json` shows version `1.0.5`, author `Apparent Collective`)
- This repo contains a heavily customized implementation for Phoria storefront experience
- Current code includes both generic Madrid sections and a large set of `ph-*` custom sections/components

## High-Level Architecture
- `layout/`: global layout and app/script bootstrapping
- `templates/`: route-level JSON templates for homepage, product, collections, account, policy pages, etc.
- `sections/`: reusable page sections (core + custom `ph-*` modules)
- `snippets/`: shared UI pieces (cards, icons, header/footer fragments, account snippets)
- `assets/`: CSS/JS, sliders, animation libraries, custom fonts, interaction scripts
- `config/`: theme settings schema + live settings data

## Custom-Coded Functionalities (Phoria)
- **Custom Product Detail Page** via `sections/ph-product-page.liquid`
- **Custom Alphabet Letter PDP variant** via `sections/ph-letter-product-page.liquid`
- PDP option handling for plating/material, stone/color, size, and add-to-bag flow
- PDP accordions for fit notes, composition/care, warranty, delivery/returns, and FAQs
- PDP bundle logic using product metafields (`custom_bundle`) with multi-item add-to-cart behavior
- PDP preorder handling via variant metafields (`preorder_limit`, dispatch dates)
- Variant-size based media switching logic on product pages
- Custom collection layouts using `ph-collection-description`, `ph-collection-banner`, and `ph-product-grid-v2`
- `ph-product-grid-v2` supports image/video thumbnails, custom finish labels, custom title/price behavior, and per-item media scaling
- Specialized guides/education modules for rings, earrings, necklaces, bracelets, and size/style pages
- Custom search UI via `sections/ph-main-search.liquid`
- Custom header/footer variants via `sections/ph-header.liquid` and `sections/ph-footer.liquid`
- Footer dynamic media driven by page/product/collection metafields (`footer_image`, `footer_image_link`)
- Custom account snippets and newsletter preference handling (Klaviyo form integration)
- Bundle builder page template exists at `templates/page.bundle-builder.liquid` (static combo handles in current implementation)

## Content + Metafield-Driven Features
- Product cards and PDP consume custom metafields such as:
- `badges`, `finish`, `stone`, `product_information`
- `finish_also_available`, `stone_also_available`
- `custom_products_size_placeholder`, `custom_bundle`
- `preorder_limit`, `preorder_dispatch_date`
- Collection/page/product-level footer media metafields are used in custom footer behavior

## Third-Party / App Integrations Found
- Microsoft Clarity script in `layout/theme.liquid`
- Klarna on-site messaging app block in product templates
- Shop login button app block in product templates
- Gift note app block in `templates/product.gift-card.json`
- Klaviyo hooks/forms in account/product/contact-related templates/snippets

## Frontend Libraries / Interaction Stack
- GSAP + ScrollTrigger (`assets/gsap.min.js`, `assets/ScrollTrigger.min.js`)
- Swiper (`assets/swiper-bundle.min.js` + CSS)
- Motion (`motion.js` via CDN in layout)
- jQuery present (`assets/jquery-3.6.0.js`)
- Multiple custom scripts for cart drawer, quick view, product grid, sliders, banners, countdowns, and search

## Current Deployment Flow (GitHub Actions)
- **Staging auto deploy on push**: `.github/workflows/shopify-staging-deploy.yml`
- **Live deploy manual only**: `.github/workflows/shopify-live-deploy.yml` (requires `DEPLOY_LIVE` confirmation)

Required GitHub Secrets:
- `SHOPIFY_FLAG_STORE`
- `SHOPIFY_CLI_THEME_TOKEN`
- `SHOPIFY_FLAG_STAGING_THEME_ID`
- `SHOPIFY_FLAG_THEME_ID`

## Local Development
Run local preview:

```bash
shopify theme dev --store nu5ejy-vd.myshopify.com
```

Common workflow:
1. Edit in VS Code
2. Test in local preview URL
3. Commit + push to `main` (auto deploys to staging)
4. Manually trigger live deploy workflow when approved

## Notes for Future Developers
- JSON templates in `templates/*.json` are Shopify-generated and can be overwritten by theme editor actions
- Many storefront behaviors depend on correctly populated metafields; verify metafield definitions before refactors
- The repo currently contains some duplicate/legacy asset files (`copy` variants) that should be cleaned only with regression testing
