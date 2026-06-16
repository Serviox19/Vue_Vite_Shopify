/**
 * Shared cart store — a module-scoped reactive singleton.
 *
 * Every Vue island imports `useCart()` and binds to the same `state`, so the
 * drawer, header badge, add-to-cart button, and line items all read from one
 * source of truth. This replaces the old `cart:updated` window event + the
 * imperative `syncBadge()` DOM manipulation in SideCart.
 *
 * It is NOT Pinia and does not need a shared app instance — a reactive object
 * created once at module load is shared across islands because it's a shared
 * import. Pinia can wrap this same logic later if state grows.
 */
import { reactive, computed } from 'vue';
import { getCart, addToCart, updateCart } from '@utils/shopify-cart';
import { formatMoney } from '@/filters/money.js';

const state = reactive({
  cart: null,
  isUpdating: false,
  isDrawerOpen: false,
});

export function useCart() {
  return {
    // Read-only views — islands never mutate `state` directly; all writes go
    // through the actions below.
    items: computed(() => state.cart?.items ?? []),
    itemCount: computed(() => state.cart?.item_count ?? 0),
    subtotal: computed(() => formatMoney(state.cart?.total_price ?? 0)),
    isUpdating: computed(() => state.isUpdating),
    isDrawerOpen: computed(() => state.isDrawerOpen),

    // Load the current cart from Shopify (/cart.js).
    async fetch() {
      state.cart = await getCart();
    },

    // Mutations return the full cart; `isUpdating` guards concurrent edits
    // globally. Errors propagate so callers can keep their own error UI.
    async add(items) {
      state.isUpdating = true;
      try {
        // /cart/add.js returns only the added line item(s), not the full cart,
        // so re-fetch /cart.js to refresh items/count/total.
        await addToCart(items);
        state.cart = await getCart();
      } finally {
        state.isUpdating = false;
      }
    },

    async update(key, quantity) {
      state.isUpdating = true;
      try {
        state.cart = await updateCart(key, quantity);
      } finally {
        state.isUpdating = false;
      }
    },

    // Drawer visibility — kept separate from `add()` so adding can open the
    // drawer while in-drawer edits update quantity without reopening it.
    openDrawer() {
      state.isDrawerOpen = true;
    },
    closeDrawer() {
      state.isDrawerOpen = false;
    },
  };
}
