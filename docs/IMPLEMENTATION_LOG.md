# Implementation Log And Playbook

This file is both:
- A step-by-step implementation playbook for recurring storefront features.
- A running record of what was changed and when.

## How To Use
1. For a new feature, first check the playbook section below.
2. Implement using the listed files and admin steps.
3. Add a dated entry in the `Change Log` section.

## Feature Playbook (Step-by-Step)

### 1) Preorder Product Flow (Base Functionality)
- Goal: allow out-of-stock product purchase as preorder with two preorder windows.
- Theme files:
- `sections/ph-product-page.liquid`
- `sections/ph-letter-product-page.liquid`
- Product tag used:
- `custom-pre-order`
- Variant metafields used:
- `preorder_limit`
- `preorder_limit_2`
- `preorder_dispatch_date`
- `preorder_dispatch_date2`

Implementation steps:
1. Add product tag `custom-pre-order`.
2. Open each variant in Shopify admin and set preorder metafields.
3. Keep normal inventory tracking enabled (out-of-stock condition triggers preorder branch).
4. In storefront QA, verify:
- In-stock variant -> `ADD TO BASKET`
- Out-of-stock with limit 1 available -> `PRE ORDER` + dispatch message
- Out-of-stock with limit 2 available -> `PRE ORDER 2` + dispatch message
- Limits exhausted -> out-of-stock state

### 2) Force Add-To-Basket Text On Selected Preorder Products
- Goal: keep preorder mechanics but change CTA text to `ADD TO BASKET` for selected products.
- Theme files:
- `sections/ph-product-page.liquid`
- `sections/ph-letter-product-page.liquid`
- Product tag used:
- `force-add-to-basket`

Implementation steps:
1. Keep base preorder setup (`custom-pre-order` + variant preorder metafields).
2. Add product tag `force-add-to-basket`.
3. QA on product page:
- Out-of-stock preorder states should display `ADD TO BASKET` text where override is applied.
- Behavior (availability/limits/dispatch logic) should remain unchanged.

### 3) Group Product Media By Alt Text Group
- Goal: show default media set on page load, then show selected variant media set.
- Theme files:
- `sections/ph-product-page.liquid`
- `sections/ph-letter-product-page.liquid`
- Alt text convention:
- `group:default` for default media
- `group:<variant-option-1-handle>` for variant media groups

Implementation steps:
1. In Shopify product media, edit alt text per image/video.
2. Set default gallery items to `group:default`.
3. For each variant option-1 value, set matching group alt.
4. Use handle-style keys where possible:
- `18CT GOLD VERMEIL` -> `group:18ct-gold-vermeil`
- `925 Sterling Silver` -> `group:925-sterling-silver`
5. QA:
- On page load only default group is visible.
- On variant select matching group appears.
- If no matching group exists, default group is shown as fallback.

### 4) GitHub Deploy Pipeline (Staging -> Live)
- Goal: automated deployment from GitHub to Shopify theme IDs.
- Workflow files:
- `.github/workflows/shopify-staging-deploy.yml`
- `.github/workflows/shopify-live-deploy.yml`
- Required repo secrets:
- `SHOPIFY_FLAG_STORE`
- `SHOPIFY_CLI_THEME_TOKEN`
- `SHOPIFY_FLAG_STAGING_THEME_ID`
- `SHOPIFY_FLAG_THEME_ID`

Implementation steps:
1. Set all required secrets in GitHub repo settings.
2. Push commit to `main`.
3. Confirm Actions order:
- `Deploy Shopify Staging Theme` success
- `Deploy Shopify Live Theme` auto-triggered and success
4. Keep manual live trigger as fallback using input `DEPLOY_LIVE`.

## Codebase Audit Snapshot (2026-04-09)

Audit scope:
- JS assets scanned: `72`
- Liquid sections scanned: `113`
- Liquid snippets scanned: `102`
- Primary runtime files reviewed for function/feature inventory:
- `assets/global.js`
- `assets/main-product.js`
- `assets/cart.js`
- `assets/cart-drawer.js`
- `sections/ph-product-page.liquid`
- `sections/ph-letter-product-page.liquid`
- `sections/ph-header.liquid`
- `sections/ph-main-search.liquid`
- `sections/customer-account.liquid`

### Global Runtime + Core Components
- `assets/global.js`:
- Slider initializers: `sliderInit`, `subSliderInit`, `quickAddsliderInit`, `popupSliderInit`
- Focus/accessibility helpers: `getFocusableElements`, `trapFocus`, `removeTrapFocus`, `onKeyUpEscape`
- Shared utility helpers: `debounce`, `serializeForm`, `fetchConfig`, `formatMoney`
- Custom elements:
- `quantity-input`
- `menu-drawer`
- `header-drawer`
- `search-modal`
- `account-modal`
- `modal-dialog`
- `modal-opener`
- `deferred-media`
- `variant-selects`
- `variant-radios`
- `product-recommendations`
- `localization-form`

### Product Page Features (Custom PDP)
- `sections/ph-product-page.liquid`:
- Variant selection pipeline:
- Option input sync helpers: `getOptionInputValue`, `setOptionInputValue`, `syncOptionUiFromVariant`
- Selection resolver: `updateVariantSelection(changedOptionIndex, changedValue)`
- Description/titles by variant rules:
- `parseVariantRules`, `resolveRuleValue`, `applyVariantTitleInfoRules`, `applyVariantDescription`
- Stock/CTA behavior:
- `applyStockVisibility`, `updateButtonText`, preorder tag handling
- Notify-me modal + Klaviyo mapping:
- `pushCurrentToForm`, `setKlaviyoName`, `setKlaviyoSku`, hidden property sync
- Sticky add-to-cart:
- mode sync between `ADD TO BASKET` and `Notify me`
- Bundle flow:
- `selectBundleSize`, `checkInventoryForBundle`, `addBundleProductsToCart`
- Media behavior:
- grouped media by `group:...` alt tags + ordered media support
- size image filtering helper block

### Letter PDP Features
- `sections/ph-letter-product-page.liquid`:
- Parallel variant/stock/title-description system adapted for letter products
- Grouped media switching and variant UI application
- Bundle add flow and sticky CTA syncing
- Notify-me modal + preorder handling parity with main custom PDP

### Cart Features
- `assets/cart.js`:
- `cart-remove-button`, `cart-items`, cart note and quantity interactions
- section rendering refresh on cart changes
- `assets/cart-drawer.js`:
- `cart-drawer`, `cart-drawer-items`, cart note and gift note checkbox support
- drawer open/close/focus handling and keyboard escape support

### Header + Navigation
- `sections/ph-header.liquid`:
- desktop drawer toggles + overlay control
- mobile submenu open/close system
- scroll-aware header behavior (`updateHeader`)
- London-time based countdown renderers

### Search + Account
- `sections/ph-main-search.liquid`:
- custom template-driven search layout and filter/sort controls
- `sections/customer-account.liquid`:
- desktop tab system + mobile view state machine
- responsive account navigation switching

### Deploy / Release Automation
- `.github/workflows/shopify-staging-deploy.yml`:
- pushes `main/master` changes to staging theme via Shopify CLI
- `.github/workflows/shopify-live-deploy.yml`:
- auto-deploys live after successful staging
- manual gated trigger supported with `DEPLOY_LIVE`

### Current Known Behavior Notes
- Product templates rely heavily on product/variant metafields and tags.
- `templates/*.json` remain Shopify-managed and may be overwritten by Theme Editor saves.
- Some duplicate legacy files (`copy` variants) still exist and should be cleaned only with regression QA.

## Change Log Template
- Date:
- Feature:
- Summary:
- Files changed:
- Rules/logic:
- Shopify admin instructions:
- QA checklist:

---

## Change Log

### 2026-04-14 - Letter Pendant + Chain Cart Flow + Sticky UI Improvements
- Feature:
- Letter pendant companion chain add-to-cart automation and letter PDP sticky bar UX updates.
- Summary:
- Implemented conditional multi-item add flow for letter pendant test products:
- add pendant always
- add mapped chain variant only when `Necklace Chain` selection is `Small` or `Medium`
- skip chain add when `No Chain` is selected
- Updated add order so pendant appears first in cart list.
- Added sticky necklace chain dropdown (desktop/mobile) on letter PDP and synced it with variant option inputs.
- Applied responsive sticky-bar layout fixes to keep `ADD TO BASKET` fully visible on narrow mobile widths.
- Adjusted letters carousel arrow alignment to sit parallel with alphabet options.
- Updated cart drawer metadata rendering to hide empty `Stone` row.
- Files changed:
- `sections/ph-letter-product-page.liquid`
- `snippets/cart-drawer.liquid`
- `README.md`
- Rules/logic:
- Chain auto-add mapping is currently scoped in code to product handles:
- `letter-pendants-test`
- `test`
- Mapping used:
- Silver + Small -> `52864666730762`
- Silver + Medium -> `52864666763530`
- Gold + Small -> `52864682721546`
- Gold + Medium -> `52864682754314`
- Chain quantity mirrors pendant quantity.
- Shopify admin instructions:
- Ensure test products keep expected option names for matching:
- finish/plating/material option present
- necklace chain option contains values `Small`, `Medium`, `No Chain`
- For live rollout beyond test products, extend handle scope/mapping in `resolveLetterPendantChainVariantId`.
- QA checklist:
- On `letter-pendants-test` and `test`, verify:
- `No Chain` adds only pendant.
- `Small`/`Medium` adds pendant + correct chain variant.
- Cart order shows pendant first, chain second.
- Sticky bar shows both dropdowns and full `ADD TO BASKET` label on mobile.
- Letters carousel side arrows are vertically aligned with alphabet row.
- Drawer hides `Stone` row when metafield is blank.

### 2026-04-09 - PDP Variant Selection Persistence Fix
- Feature:
- Preserve selected size while switching another option (for example finish/plating) on custom PDP.
- Summary:
- Updated variant selection logic to keep the user’s chosen option set when another option changes.
- Added UI sync so hidden `Option*` inputs and selected pills stay aligned with resolved variant.
- Files changed:
- `sections/ph-product-page.liquid`
- Rules/logic:
- `updateVariantSelection` now accepts changed option context and resolves variant from current selection state.
- If direct match is not found from temporary state, resolver falls back to current variant as base and reapplies changed option.
- Option UI is synchronized from the final resolved variant via `syncOptionUiFromVariant`.
- Shopify admin instructions:
- No admin setup required.
- QA checklist:
- Select size (for example `UK I`) then change finish/plating option.
- Confirm size remains selected when combination exists.
- Confirm variant id, price, and add-to-cart availability still update correctly.

### 2026-03-26 - Preorder Override + Grouped Media + Auto Deploy
- Feature:
- Out-of-stock preorder text override
- Grouped media by alt text
- Automated staging to live deploy flow
- Summary:
- Added `force-add-to-basket` tag override on custom PDP templates.
- Implemented `group:...` media grouping with default fallback.
- Automated live deploy after successful staging workflow.
- Files changed:
- `sections/ph-product-page.liquid`
- `sections/ph-letter-product-page.liquid`
- `.github/workflows/shopify-live-deploy.yml`
- `README.md`
- Rules/logic:
- Preorder behavior preserved; only CTA text override for tagged products.
- Media grouping is alt-driven, normalized, and fallback-safe.
- Deploy chain now auto-promotes staging success to live.
- Shopify admin instructions:
- Use `custom-pre-order` and preorder metafields for preorder products.
- Add `force-add-to-basket` when text override is needed.
- Set media alt groups using `group:default` and `group:<variant-key>`.
- QA checklist:
- Verify CTA text and preorder states on both PDP templates.
- Verify media group switching on variant selection.
- Verify both staging and live GitHub workflows complete successfully.
