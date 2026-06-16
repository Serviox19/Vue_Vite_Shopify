# Vue Migration Notes

Forward-looking plan for moving the theme toward "Vue powering everything."
This is a sketch to pick up later — nothing here is implemented yet.

## Goal & guiding principle

**Vue owns all interactivity and state — it is NOT a client-rendered SPA.**

Keep server-rendered Liquid for content and SEO-critical markup (product
descriptions, the collection grid crawlers read, meta). Mount Vue *islands* over
that markup. The current islands architecture (`[data-vue-mount]` → `createApp`
per element, registry in `src/components/index.js`, bootstrapped by
`src/main.js`) is the right call for Shopify. This refactor gives those islands a
**shared brain**, it does not replace Liquid rendering.

Going full SPA would mean fighting Shopify routing, losing SEO, and rebuilding
checkout-adjacent flows for no gain.

## The core problem: shared state

Today each Vue mount is its own `createApp` island, and they coordinate through
**window `CustomEvent`s + direct DOM manipulation**:

- `AddToCart.vue` dispatches `cart:updated` on the `window`.
- `SideCart.vue` listens for it, and its `syncBadge()` reaches into the
  Liquid-rendered `.header__cart-count` element to keep the number correct.

Fine for two components; it breaks down fast. The highest-leverage move is a
**shared cart store** every island reads from.

It does NOT need Pinia or a shared app instance — a module-scoped reactive
singleton works across all islands because it is just a shared import:

```js
// src/stores/cart.js
import { reactive, computed, readonly } from 'vue';
import { getCart, addToCart, updateCart } from '@utils/shopify-cart';

const state = reactive({ cart: null, isUpdating: false });

export function useCart() {
  return {
    cart: readonly(state),
    itemCount: computed(() => state.cart?.item_count ?? 0),
    subtotal:  computed(() => state.cart?.total_price ?? 0),
    async fetch()      { state.cart = await getCart(); },
    async add(items)   { state.cart = await addToCart(items); },
    async update(k, q) { state.cart = await updateCart(k, q); },
    seed(cart)         { state.cart = cart; },   // hydrate from Liquid
  };
}
```

Once this exists, `SideCart`, `AddToCart`, the header badge, and line items all
bind to the same source — **the window events and `syncBadge` DOM manipulation
disappear.**

## Pillars

1. **Cart store** (above) — single source of truth. Refactor `SideCart` +
   `AddToCart` onto it first; delete the event/DOM glue.
2. **Header badge becomes a component** — a tiny `CartCount.vue` mounted on the
   cart link, bound to `itemCount`. No more `document.createElement` from inside
   the drawer.
3. **Coordinated `ProductForm.vue`** — one mount owning variant selection +
   quantity + add-to-cart together (composing the existing `ProductVariants.vue`),
   so selecting a variant updates the price *and* the add button, and adding opens
   the drawer via the store. This is what unblocks the PDP going Vue. (It is the
   piece that was "too crazy" to do inline on the PDP earlier — separate islands
   can't share variant state, a single coordinated component can.)
4. **Hydrate from Liquid, don't fetch-on-load** — seed the store from
   `{{ cart | json }}` at first paint so there's no flash or redundant `/cart.js`
   round-trip. Same pattern for product data (`{{ product | json }}` into
   `ProductForm`).
5. **Centralize formatting** — money is currently done 3 ways (`formatMoney` in
   `src/filters/money.js`, plus inline `Intl.NumberFormat` in `ProductVariants.vue`
   and `AddToCart.vue`). One helper, ideally fed the shop's money format from
   Liquid.

## Migration order (each step ships independently)

1. Add `useCart()` store → move `SideCart` + `AddToCart` onto it (removes the
   `cart:updated` window event + `syncBadge`).
2. `CartCount.vue` for the header badge.
3. `ProductForm.vue` → PDP add-to-cart opens the drawer (natural moment to flip
   the PDP to Vue).
4. `CartPage.vue` → cart page reads the same store (the line-item component is
   reusable from the drawer).
5. Collection / search → only if you want filtering interactivity; otherwise leave
   as Liquid for SEO.

Step 1 alone removes the jankiest part of the current code. No big-bang rewrite —
each step is a self-contained PR.

## When to reach for more

- **Pinia**: drop-in upgrade once state grows beyond the cart (UI state like the
  drawer-open flag, customer, search). The composable store above is enough until
  then, and Pinia can wrap the same logic later.
- **Shared line-item component**: `CartLineItem.vue` (already built for the drawer)
  is designed to be reused by `CartPage.vue` — keep it presentational and
  emit-only so both the drawer and the page can own the state.

## Current relevant files

- `src/main.js` — island bootstrapper (`[data-vue-mount]` auto-mount).
- `src/components/index.js` — component registry (static + deferred).
- `src/components/SideCart.vue` — drawer; currently owns cart state + `syncBadge`.
- `src/components/CartLineItem.vue` — presentational line item (reuse target).
- `src/components/AddToCart.vue` — dispatches `cart:updated` (to be replaced).
- `src/components/ProductVariants.vue` — variant selector (compose into ProductForm).
- `src/utils/shopify-cart.js` — Ajax API layer (`getCart`/`addToCart`/`updateCart`).
- `src/filters/money.js` — `formatMoney` (centralize formatting here).
