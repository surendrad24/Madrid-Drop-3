/**
 * Updates varient_specific_title and varient_specific_extrainfo
 * for all variants of the Letter Pendants Silver product.
 *
 * Usage:
 *   SHOPIFY_TOKEN=<your-admin-api-token> node scripts/update-letter-variant-metafields.mjs
 *
 * Optional overrides:
 *   SHOPIFY_STORE=nu5ejy-vd.myshopify.com   (default)
 *   PRODUCT_HANDLE=letter-pendants-silver    (default)
 */

const STORE    = process.env.SHOPIFY_STORE   || 'nu5ejy-vd.myshopify.com';
const TOKEN    = process.env.SHOPIFY_TOKEN;
const HANDLE   = process.env.PRODUCT_HANDLE  || 'letter-pendants-silver';
const API_VER  = '2025-01';

if (!TOKEN) {
  console.error('❌  Set SHOPIFY_TOKEN=<your-admin-api-token> before running.');
  process.exit(1);
}

const BASE = `https://${STORE}/admin/api/${API_VER}`;
const HEADERS = {
  'X-Shopify-Access-Token': TOKEN,
  'Content-Type': 'application/json',
};

// Map letter → title  (A–Z)
const LETTER_TITLES = Object.fromEntries(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l) => [
    l,
    `"THE ${l}" LETTER PENDANT`,
  ])
);

const SUBTITLE = '925 STERLING SILVER // WHITE TOPAZ';

async function shopifyGet(path) {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function setMetafield(variantId, namespace, key, type, value) {
  const body = JSON.stringify({
    metafield: { namespace, key, type, value, owner_id: variantId, owner_resource: 'variant' },
  });
  const res = await fetch(`${BASE}/metafields.json`, {
    method: 'POST',
    headers: HEADERS,
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`POST metafield (variant ${variantId}, ${key}) → ${res.status}: ${err}`);
  }
  return res.json();
}

async function main() {
  console.log(`🔍  Fetching product: ${HANDLE}`);
  const { product } = await shopifyGet(`/products.json?handle=${HANDLE}&fields=id,title,variants`);

  if (!product) {
    console.error(`❌  Product with handle "${HANDLE}" not found.`);
    process.exit(1);
  }

  console.log(`✅  Found: ${product.title} (${product.variants.length} variants)\n`);

  let updated = 0;
  let skipped = 0;

  for (const variant of product.variants) {
    // option1 is the Letters option (A, B, C …)
    const letter = (variant.option1 || '').trim().toUpperCase();
    const title  = LETTER_TITLES[letter];

    if (!title) {
      console.warn(`⚠️   Skipping variant ${variant.id} — option1="${variant.option1}" not a single letter`);
      skipped++;
      continue;
    }

    console.log(`📝  Variant ${variant.id} (${variant.title})`);
    console.log(`     title    → ${title}`);
    console.log(`     subtitle → ${SUBTITLE}`);

    await setMetafield(variant.id, 'custom', 'varient_specific_title',     'single_line_text_field', title);
    await setMetafield(variant.id, 'custom', 'varient_specific_extrainfo',  'single_line_text_field', SUBTITLE);

    updated++;

    // Shopify rate limit: 2 req/s on Basic, more on higher plans — small delay to be safe
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n✅  Done — updated: ${updated}, skipped: ${skipped}`);
}

main().catch((err) => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
