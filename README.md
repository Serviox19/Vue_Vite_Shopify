# Shopify Vue Theme Development

Shopify theme built with Vue 3 **islands**, Vite, and Tailwind CSS v3. Interactivity and
state live in small Vue components mounted onto Liquid-rendered markup — this is **not** a
SPA. Liquid still renders the pages; Vue progressively enhances specific spots.

## Architecture

- **Islands, not an app shell.** Each interactive spot is a `[data-vue-mount]` element.
  `src/main.js` finds them on load and mounts a Vue app onto each one.
- **Shared state via a reactive store.** `src/stores/cart.js` is a module-scoped reactive
  singleton. Every island calls `useCart()` and reads from the same `state`, so the header
  badge, add-to-cart buttons, and cart drawer all stay in sync without events or prop
  drilling. (It's not Pinia, but Pinia could wrap it later.)
- **Vite + vite-plugin-shopify.** The plugin generates the `snippets/vite-tag.liquid`
  snippet. In dev it points at the Vite dev server; in production it points at the built,
  content-hashed asset.

## Structure

```
/
├── src/                    # Vite source (the only place to edit JS/CSS/Vue)
│   ├── main.js            # Finds [data-vue-mount] elements and mounts islands
│   ├── components/        # Vue SFCs
│   │   └── index.js       # Component registry (maps mount names → components)
│   ├── stores/            # Shared reactive stores (cart.js)
│   ├── filters/           # Formatting helpers (money.js, string.js)
│   ├── styles/            # Tailwind entry + global styles (app.css)
│   └── utils/             # Shopify AJAX API helpers (shopify-cart.js)
├── shopify/               # Source theme files (tracked in git)
│   ├── assets/            # Hand-authored static assets only (critical.css, SVGs)
│   ├── config/  layout/  locales/  sections/  snippets/  templates/
├── dist/                  # Build output (untracked) — this is what gets deployed
│   ├── assets/            # Vite emits main-[hash].js, HeaderSlider-[hash].js, style.css
│   └── [theme files copied from /shopify, with the prod vite-tag snippet]
└── [vite.config.js, tailwind.config.js, postcss.config.js, shopify.theme.toml]
```

> **Note:** `shopify/assets/` holds only hand-authored static files. Built bundles are
> **not** written here — dev serves them from Vite, prod builds them into `dist/`.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Store target:** the store is set in the npm scripts (`--store=...`) and
   `shopify.theme.toml`. Update both if you point at a different store.

## Development

Two terminals:

1. **Vite dev server** (serves JS/CSS with HMR from `http://localhost:5173`):
   ```bash
   npm run dev
   ```
   This does **not** write files into `shopify/assets/` — the dev `vite-tag` snippet loads
   modules straight from the Vite server, so your `src/` is always live.

2. **Shopify theme dev** (serves the `/shopify` theme, proxied at `127.0.0.1:9292`):
   ```bash
   npm run shopify:dev
   ```

Edit Liquid in `/shopify` (theme dev reloads) or Vue/JS/CSS in `/src` (Vite HMR). Because
dev bypasses the built assets entirely, **a fix that works in dev but not on the deployed
theme is almost always an asset-caching/build issue, not a code issue.**

## Production build & deploy

```bash
npm run build     # rm -rf dist → cp shopify → dist → vite build into dist/assets
npm run deploy    # build, then: shopify theme push --path=dist
```

The build emits content-**hashed** JS (`main-[hash].js`) and regenerates the prod
`vite-tag` snippet to reference it. The hash is what cache-busts the bundle: the snippet
strips Shopify's `?v=` param, so an unhashed filename would be cached by the CDN forever
and deploys would silently never take effect. CSS (`style.css`) is loaded by `theme.liquid`
via `{{ 'style.css' | asset_url }}`, which keeps `?v=` and cache-busts on its own.

> When `npm run deploy` prompts for a theme, pick the one you're actually viewing — pushing
> to a different theme is the most common "my deploy did nothing" mistake.

Pull remote theme changes:
```bash
npm run shopify:pull
```

## How assets load (theme.liquid)

```liquid
{# CSS — critical.css is hand-authored; style.css is the Vite bundle #}
{{ 'critical.css' | asset_url | stylesheet_tag: preload: true }}
{{ 'style.css'    | asset_url | stylesheet_tag }}

{# JS — the snippet resolves to the hashed bundle (or the Vite dev server in dev) #}
{% render 'vite-tag', vite-tag: 'main.js' %}
```

> Theme Check may flag `style.css` as a missing asset — that's expected. It's generated into
> `dist/` at build time and isn't present in `shopify/assets/`.

## Vue components

### Register a component

Add it to the registry in `src/components/index.js` (not `main.js`):

```js
import MyWidget from '@components/MyWidget.vue';

export default {
  MyWidget,                                   // eager: bundled into main.js
  // Deferred: only fetched when its markup is on the page (own async chunk)
  HeaderSlider: () => import('@components/HeaderSlider.vue'),
};
```

The registry key is PascalCase; the mount name in Liquid is its kebab-case form
(`MyWidget` ↔ `data-vue-mount="my-widget"`).

### Mount in Liquid

```liquid
<div
  data-vue-mount="add-to-cart"
  data-props='{"productId": {{ product.id | json }}, "variantId": {{ product.selected_or_first_available_variant.id | json }}, "buttonText": "Add to cart"}'
>
  <button>Add to cart</button> {# fallback before JS mounts #}
</div>
```

Props are passed as a JSON string in `data-props` and parsed at mount.

**Available components:**
- `add-to-cart` — add button with loading/success states (writes to the cart store)
- `product-variants` — variant selector with option buttons
- `cart-count` — header cart badge (reads the store)
- `side-cart` — cart drawer (teleports to `<body>`; mounted once in `theme.liquid`)
- `header-slider` — homepage slider (deferred / async-loaded)

## Cart & state

Components don't call the Shopify API directly — they go through the shared store:

```js
import { useCart } from '@/stores/cart.js';

const { items, itemCount, subtotal, add, update, openDrawer, closeDrawer } = useCart();

await add({ id: variantId, quantity: 1 }); // POSTs /cart/add.js, re-fetches, opens drawer
```

The store (`src/stores/cart.js`) is the single source of truth and delegates HTTP to the
low-level helpers in `src/utils/shopify-cart.js` (`getCart`/`addToCart`/`updateCart`).
`getCart()` uses `fetch('/cart.js', { cache: 'no-store' })` so the count/drawer reflect a
fresh cart immediately after an add (otherwise the browser serves a cached pre-add cart).

## Tailwind

Tailwind v3, standard classes (no prefix). The entry is `src/styles/app.css`
(`@tailwind base/components/utilities`). Add `prefix: 'tw-'` in `tailwind.config.js` if you
need to avoid collisions with existing theme styles.

## Scripts

- `npm run dev` — Vite dev server (HMR from localhost:5173)
- `npm run shopify:dev` — Shopify theme dev server (serves `/shopify`)
- `npm run build` — build production theme into `/dist`
- `npm run deploy` — build and push `/dist` to Shopify
- `npm run shopify:pull` — pull the theme from Shopify into `/shopify`

## Notes

- **Edit only `/src` and `/shopify`.** Never edit `/dist` (regenerated every build).
- **`/dist` is untracked.** It's produced by `npm run build`.
- **Static assets** (images, fonts, hand-authored CSS like `critical.css`) go in
  `shopify/assets/` and are preserved into `dist/` during build.
- **Section group files** (`*-group.json`) are managed by the Shopify theme editor; pull to
  get the latest.
- **`.vite/` and manifests** are dev-only and excluded from git/Shopify.
- **Theme editor:** islands re-mount on `shopify:section:load`, handled in `src/main.js`.
```
