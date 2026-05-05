/**
 * Bulk populate Shopify Product Type from Shopify Category mapping.
 *
 * Rules:
 * - Only updates products where product_type is blank (unless OVERWRITE_NON_BLANK=true)
 * - Maps category fullName to product_type value
 *
 * Usage:
 *   node scripts/bulk-set-product-type-from-category.mjs                # dry run
 *   DRY_RUN=false node scripts/bulk-set-product-type-from-category.mjs  # apply updates
 */

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
} catch {
  // no .env file
}

const STORE = process.env.SHOPIFY_STORE || 'nu5ejy-vd.myshopify.com';
const TOKEN = process.env.SHOPIFY_TOKEN;
const API_VER = process.env.SHOPIFY_API_VERSION || '2025-01';
const DRY_RUN = String(process.env.DRY_RUN || 'true').toLowerCase() !== 'false';
const OVERWRITE_NON_BLANK = String(process.env.OVERWRITE_NON_BLANK || 'false').toLowerCase() === 'true';

if (!TOKEN) {
  console.error('Set SHOPIFY_TOKEN before running.');
  process.exit(1);
}

const GRAPHQL_URL = `https://${STORE}/admin/api/${API_VER}/graphql.json`;

const CATEGORY_TO_TYPE = {
  'Apparel & Accessories > Jewelry > Rings': 'Rings',
  'Apparel & Accessories > Jewelry > Earrings': 'Earrings',
  'Apparel & Accessories > Jewelry > Bracelets': 'Bracelets',
  'Apparel & Accessories > Jewelry > Necklaces': 'Necklaces',
  'Apparel & Accessories > Jewelry > Charms & Pendants': 'Charms & Pendants',
};

async function gql(query, variables = {}) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`GraphQL HTTP ${res.status}: ${JSON.stringify(json)}`);
  }

  if (json.errors?.length) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data;
}

async function fetchAllProducts() {
  const query = `
    query GetProducts($cursor: String) {
      products(first: 100, after: $cursor) {
        edges {
          cursor
          node {
            id
            legacyResourceId
            title
            productType
            category {
              fullName
            }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `;

  const all = [];
  let cursor = null;

  while (true) {
    const data = await gql(query, { cursor });
    const edges = data.products.edges;

    for (const edge of edges) {
      all.push(edge.node);
    }

    if (!data.products.pageInfo.hasNextPage) break;
    cursor = edges[edges.length - 1]?.cursor || null;
    if (!cursor) break;
  }

  return all;
}

async function updateProductType(productId, productType) {
  const mutation = `
    mutation UpdateProductType($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          productType
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await gql(mutation, {
    input: {
      id: productId,
      productType,
    },
  });

  const userErrors = data.productUpdate.userErrors || [];
  if (userErrors.length) {
    throw new Error(`productUpdate userErrors: ${JSON.stringify(userErrors)}`);
  }

  return data.productUpdate.product;
}

function normalize(text) {
  return String(text || '').trim();
}

async function main() {
  console.log(`Store: ${STORE}`);
  console.log(`API Version: ${API_VER}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY CHANGES'}`);
  console.log('');

  const products = await fetchAllProducts();

  let eligible = 0;
  let toUpdate = 0;
  let updated = 0;
  let skippedNonBlank = 0;
  let skippedNoCategoryMap = 0;
  let unchanged = 0;

  for (const p of products) {
    const currentType = normalize(p.productType);
    const categoryName = normalize(p.category?.fullName);
    const mappedType = CATEGORY_TO_TYPE[categoryName];

    if (!mappedType) {
      skippedNoCategoryMap++;
      continue;
    }

    eligible++;

    if (currentType && !OVERWRITE_NON_BLANK) {
      skippedNonBlank++;
      continue;
    }

    if (currentType === mappedType) {
      unchanged++;
      continue;
    }

    toUpdate++;

    const label = `#${p.legacyResourceId} ${p.title}`;
    console.log(`${DRY_RUN ? '[DRY]' : '[UPD]'} ${label}`);
    console.log(`      category: ${categoryName}`);
    console.log(`      type: "${currentType || '(blank)'}" -> "${mappedType}"`);

    if (!DRY_RUN) {
      await updateProductType(p.id, mappedType);
      updated++;
      await new Promise((r) => setTimeout(r, 120));
    }
  }

  console.log('');
  console.log('Summary');
  console.log(`- Total products scanned: ${products.length}`);
  console.log(`- Products in mapped categories: ${eligible}`);
  console.log(`- Skipped (non-blank type): ${skippedNonBlank}`);
  console.log(`- Skipped (category not mapped): ${skippedNoCategoryMap}`);
  console.log(`- Already correct: ${unchanged}`);
  console.log(`- ${DRY_RUN ? 'Would update' : 'Updated'}: ${DRY_RUN ? toUpdate : updated}`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
