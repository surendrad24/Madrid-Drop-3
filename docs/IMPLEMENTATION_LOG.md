# Implementation Log

This file is the running record of custom feature changes, rollout rules, and merchant instructions.

## How To Use This Log
- Add a new entry at the top for each implemented feature/change.
- Include date, summary, files changed, behavior, and admin instructions.
- Keep entries short but actionable.

## Entry Template
- Date:
- Feature:
- Summary:
- Files changed:
- Rules/logic:
- Shopify admin instructions:
- QA checklist:

---

## 2026-03-26 - Variant Grouped Media + Preorder Button Override

### Feature A: Out-of-stock preorder text override for selected products
- Summary: Added tag-based override so products can show `ADD TO BASKET` text instead of `PRE ORDER` when preorder flow is active.
- Files changed:
- `sections/ph-product-page.liquid`
- `sections/ph-letter-product-page.liquid`
- Rules/logic:
- Existing preorder behavior remains unchanged.
- If product has tag `custom-pre-order` and is out of stock, preorder flow still runs.
- If product also has tag `force-add-to-basket`, button text shows `ADD TO BASKET` (instead of `PRE ORDER` / `PRE ORDER 2`) where applicable.
- Shopify admin instructions:
- Add tag `force-add-to-basket` on product to enable text override.
- Keep existing preorder metafields (`preorder_limit`, `preorder_limit_2`, dispatch dates) as-is.

### Feature B: Grouped product media by image alt text
- Summary: Product media now shows default image group on page load and switches to variant group after option selection.
- Files changed:
- `sections/ph-product-page.liquid`
- `sections/ph-letter-product-page.liquid`
- Rules/logic:
- On page load: show images with `group:default`.
- On variant selection: show images with `group:<variant-option-1>`.
- Matching is case-insensitive and normalized to handle format (spaces/symbols become `-`).
- If no matching group exists, fallback to default group.
- If a media item has no `group:` marker, it is treated as default.
- Alt format parser: reads `group:<value>` from alt text.
- Shopify admin instructions:
- In product media alt text, use values like:
- `group:default`
- `group:silver`
- `group:gold-vermeil`
- `group:rose-gold`
- Use option-1 value equivalents in handle format where possible.

### Feature C: GitHub auto-deploy pipeline
- Summary: Deploy pipeline now automatically promotes successful staging deploys to live.
- Workflows:
- `.github/workflows/shopify-staging-deploy.yml`
- `.github/workflows/shopify-live-deploy.yml`
- Rules/logic:
- Push to `main`/`master` -> staging deploy.
- If staging succeeds -> live deploy auto-triggers.
- Manual live deploy remains available as fallback with `DEPLOY_LIVE` input.
- Required GitHub secrets:
- `SHOPIFY_FLAG_STORE`
- `SHOPIFY_CLI_THEME_TOKEN`
- `SHOPIFY_FLAG_STAGING_THEME_ID`
- `SHOPIFY_FLAG_THEME_ID`
