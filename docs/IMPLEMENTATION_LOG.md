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
