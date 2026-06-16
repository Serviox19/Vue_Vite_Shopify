<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="sidecart-fade">
      <div v-if="isDrawerOpen" class="fixed inset-0 bg-black/40 z-[998]" @click="closeDrawer"></div>
    </Transition>

    <!-- Drawer -->
    <Transition name="sidecart-slide">
      <aside v-if="isDrawerOpen" class="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[999] flex flex-col shadow-xl"
        role="dialog" aria-modal="true" aria-label="Shopping cart">
        <header class="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 class="text-base font-semibold">
            Cart
            <span v-if="itemCount" class="text-gray-400 font-normal">({{ itemCount }})</span>
          </h2>
          <button type="button" class="text-gray-400 hover:text-black transition-colors" aria-label="Close cart"
            @click="closeDrawer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <!-- Items -->
        <div class="flex-1 overflow-y-auto px-5">
          <div v-if="isEmpty" class="h-full flex flex-col items-center justify-center text-center text-gray-500 py-16">
            <p class="text-sm">Your cart is empty.</p>
            <a href="/collections/all" class="mt-3 text-sm underline hover:opacity-70" @click="closeDrawer">
              Continue shopping
            </a>
          </div>

          <CartLineItem v-for="item in items" :key="item.key" :item="item" @update-quantity="onUpdateQuantity"
            @remove="onRemove" />
        </div>

        <!-- Footer -->
        <footer v-if="!isEmpty" class="flex flex-col border-t border-gray-200 bg-white px-5 py-4">
          <div class="flex items-baseline justify-between">
            <span class="text-sm font-medium">Subtotal</span>
            <span class="text-base font-semibold tabular-nums">{{ subtotal }}</span>
          </div>
          <p class="mt-1 text-xs text-gray-400">Shipping &amp; taxes calculated at checkout.</p>

          <div class="mt-4 space-y-2">
            <a href="/cart"
              class="block w-full border border-gray-300 text-center px-6 py-3 rounded-md font-medium transition-colors hover:bg-gray-50">
              View cart
            </a>
            <a href="/checkout"
              class="block w-full bg-black text-white text-center px-6 py-3 rounded-md font-medium transition-opacity hover:opacity-90">
              Checkout
            </a>
          </div>
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useCart } from '@/stores/cart.js';
import CartLineItem from '@components/CartLineItem.vue';

const { items, itemCount, subtotal, isUpdating, isDrawerOpen, update, openDrawer, closeDrawer } = useCart();

const isEmpty = computed(() => itemCount.value === 0);

let cartLink = null;

// Intercept the header cart icon so it opens the drawer instead of navigating.
function handleCartLinkClick(event) {
  event.preventDefault();
  openDrawer();
}

function handleKeydown(event) {
  if (event.key === 'Escape' && isDrawerOpen.value) closeDrawer();
}

// In-drawer edits go through the shared store; the store's `isUpdating` guard
// serializes concurrent edits. These don't reopen the drawer.
async function onUpdateQuantity(key, quantity) {
  if (isUpdating.value) return;
  try {
    await update(key, quantity);
  } catch (err) {
    console.error('Failed to update cart item:', err);
  }
}

function onRemove(key) {
  return onUpdateQuantity(key, 0);
}

// Lock body scroll while the drawer is open (the store doesn't touch the DOM).
watch(isDrawerOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : '';
});

onMounted(() => {
  cartLink = document.querySelector('.header__cart-link');
  if (cartLink) cartLink.addEventListener('click', handleCartLinkClick);

  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  if (cartLink) cartLink.removeEventListener('click', handleCartLinkClick);
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.sidecart-fade-enter-active,
.sidecart-fade-leave-active {
  transition: opacity 0.3s ease;
}
.sidecart-fade-enter-from,
.sidecart-fade-leave-to {
  opacity: 0;
}

.sidecart-slide-enter-active,
.sidecart-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.sidecart-slide-enter-from,
.sidecart-slide-leave-to {
  transform: translateX(100%);
}
</style>
