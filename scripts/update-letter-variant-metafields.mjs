/**
 * Updates varient_specific_title and varient_specific_extrainfo
 * for all variants of the Letter Pendants Silver product.
 *
 * Usage:
 *   1. Copy .env.example to .env and fill in SHOPIFY_TOKEN
 *   2. node scripts/update-letter-variant-metafields.mjs
 *
 * Or pass inline:
 *   SHOPIFY_TOKEN=shpat_xxx node scripts/update-letter-variant-metafields.mjs
 */

// Load .env if present (no dependency needed — manual parse)
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const envPath = resolve(__dirname, '../.env');
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) process.env[key] = val;
  }
} catch { /* .env not found — rely on environment variables */ }

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

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Map letter → title  (A–Z)
const LETTER_TITLES = Object.fromEntries(
  LETTERS.map((l) => [l, `"THE ${l}" LETTER PENDANT`])
);

// Map letter → SKU  e.g. A → P001LPAS, B → P002LPBS … Z → P026LPZS
const LETTER_SKUS = Object.fromEntries(
  LETTERS.map((l, i) => {
    const num = String(i + 1).padStart(3, '0');
    return [l, `P${num}LP${l}S`];
  })
);

const SUBTITLE = '925 STERLING SILVER // WHITE TOPAZ';

async function shopifyGet(path) {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function updateVariant(variantId, fields) {
  const body = JSON.stringify({ variant: { id: variantId, ...fields } });
  const res = await fetch(`${BASE}/variants/${variantId}.json`, {
    method: 'PUT',
    headers: HEADERS,
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PUT variant ${variantId} → ${res.status}: ${err}`);
  }
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
  const { products } = await shopifyGet(`/products.json?handle=${HANDLE}&fields=id,title,variants`);
  const product = products && products[0];

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

    const sku   = LETTER_SKUS[letter];
    const chain = (variant.option2 || '').trim().toLowerCase();
    const price = chain === 'no chain' ? '85.00' : '160.00';

    console.log(`📝  Variant ${variant.id} (${variant.title})`);
    console.log(`     title    → ${title}`);
    console.log(`     subtitle → ${SUBTITLE}`);
    console.log(`     SKU      → ${sku}`);
    console.log(`     barcode  → ${sku}`);
    console.log(`     price    → £${price}`);

    await setMetafield(variant.id, 'custom', 'varient_specific_title',    'single_line_text_field', title);
    await setMetafield(variant.id, 'custom', 'varient_specific_extrainfo', 'single_line_text_field', SUBTITLE);
    await updateVariant(variant.id, { sku, barcode: sku, price });

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
