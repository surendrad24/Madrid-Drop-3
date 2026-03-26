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
- **Live auto deploy after successful staging**: `.github/workflows/shopify-live-deploy.yml`
- **Manual live fallback**: same live workflow with input `DEPLOY_LIVE`

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
4. Live deploy auto-triggers after staging succeeds

## Notes for Future Developers
- JSON templates in `templates/*.json` are Shopify-generated and can be overwritten by theme editor actions
- Many storefront behaviors depend on correctly populated metafields; verify metafield definitions before refactors
- The repo currently contains some duplicate/legacy asset files (`copy` variants) that should be cleaned only with regression testing

## Where To Edit What (Quick Map)

### Global layout, scripts, and theme settings
- Global HTML shell + shared script includes: `layout/theme.liquid`
- Theme editor schema (all configurable global settings): `config/settings_schema.json`
- Current live setting values (Shopify-generated): `config/settings_data.json`
- Main global CSS/utility styles: `assets/base.css`

### Header and footer
- Phoria custom header: `sections/ph-header.liquid`
- Default header (fallback/base): `sections/header.liquid`
- Header snippets (menu/localization/logo variants): `snippets/header-*.liquid`, `snippets/mega-menu*.liquid`
- Phoria custom footer: `sections/ph-footer.liquid`
- Default footer (fallback/base): `sections/footer.liquid`

### Product detail pages (PDP)
- Main custom PDP: `sections/ph-product-page.liquid`
- Letter-product custom PDP: `sections/ph-letter-product-page.liquid`
- Base Madrid PDP section: `sections/main-product.liquid`
- Product templates wiring sections/blocks:
- `templates/product.json`
- `templates/product.alphabet-letter.json`
- `templates/product.gift-card.json`

### Collection pages and product grids
- Custom collection description blocks:
- `sections/ph-collection-description.liquid`
- `sections/ph-collection-descriptionV1.liquid`
- Collection hero/banner modules: `sections/ph-collection-banner.liquid`
- Primary custom merchandising grid: `sections/ph-product-grid-v2.liquid`
- Alternate custom grid/row modules:
- `sections/ph-product-grid.liquid`
- `sections/ph-product-row.liquid`
- Base collection grid (fallback): `sections/main-collection-product-grid.liquid`

### Product cards and merchandising snippets
- Base product card markup: `snippets/product-card.liquid`
- Horizontal product card: `snippets/product-card-horizontal.liquid`
- Variant options in cards: `snippets/product-card-variant-options.liquid`
- Pricing markup: `snippets/price.liquid`

### Cart and drawer behavior
- Cart page section: `sections/main-cart-items.liquid`
- Cart drawer section: `sections/cart-drawer.liquid`
- Cart drawer snippet: `snippets/cart-drawer.liquid`
- Cart JS behavior:
- `assets/cart.js`
- `assets/cart-drawer.js`

### Search
- Custom search experience: `sections/ph-main-search.liquid`
- Base search section: `sections/main-search.liquid`
- Search scripts:
- `assets/search-form.js`
- `assets/search-modal.js`
- `assets/predictive-search.js`

### Account pages
- Account templates: `templates/customers/*.json`
- Account section wrappers:
- `sections/main-account.liquid`
- `sections/main-addresses.liquid`
- `sections/main-order.liquid`
- Custom account logic/snippets:
- `sections/customer-account.liquid`
- `snippets/ph-account-details-snippet.liquid`
- `snippets/ph-orders-snippet.liquid`
- `snippets/ph-addresses-snippet.liquid`

### Educational / sizing / editorial pages (custom modules)
- Ring guides: `sections/ph-ring-*.liquid`
- Earring guides: `sections/ph-earring-*.liquid`
- Necklace guides: `sections/ph-necklace-*.liquid`, `sections/ph-modular-necklace-*.liquid`
- Bracelet guides: `sections/ph-bracelets-*.liquid`, `sections/ph-bracelet-note.liquid`
- Generic rich content modules:
- `sections/ph-image-text.liquid`
- `sections/ph-heading-text.liquid`
- `sections/ph-accordion.liquid`
- `sections/ph-Anchor-text.liquid`

### Homepage composition
- Homepage template: `templates/index.json`
- Common homepage custom modules:
- `sections/ph-featured-collections.liquid`
- `sections/custom-product-slider.liquid`
- `sections/product-slider.liquid`
- `sections/logo-marquee.liquid`

### Styling and JS for custom modules
- Section-specific CSS files generally follow: `assets/section-*.css`
- Section-specific JS files generally follow: `assets/*.js` (matching feature names)
- Key interaction libraries:
- `assets/gsap.min.js`
- `assets/ScrollTrigger.min.js`
- `assets/swiper-bundle.min.js`

### Deployments and environments
- Staging deploy workflow (auto on push): `.github/workflows/shopify-staging-deploy.yml`
- Live deploy workflow (auto after staging success): `.github/workflows/shopify-live-deploy.yml`

### Safe editing notes
- Prefer editing section/snippet `.liquid` files over direct changes in `templates/*.json`
- `templates/*.json` are Shopify-generated and may be overwritten by Theme Editor saves
- If a storefront behavior looks data-driven, check product/collection/page metafields before changing logic


## Implementation Record
- Running feature/change log: `docs/IMPLEMENTATION_LOG.md`
- Add one entry per change (date, files, behavior, Shopify instructions, QA checklist).
