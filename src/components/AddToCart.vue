<script setup>
import { ref, computed } from 'vue';
import { useCart } from '@/stores/cart.js';

const { add, openDrawer } = useCart();

const props = defineProps({
  productId: {
    type: [Number, String],
    required: true,
  },
  variantId: {
    type: [Number, String],
    default: null,
  },
  buttonText: {
    type: String,
    default: 'Add to Cart',
  },
});

const isAdding = ref(false);
const error = ref(null);
const success = ref(false);

const selectedVariantId = computed(() => {
  return props.variantId || props.productId;
});

async function handleAddToCart() {
  isAdding.value = true;
  error.value = null;
  success.value = false;

  try {
    // Update the shared cart store, then reveal the drawer. Every island bound
    // to the store (header badge, drawer) reacts automatically.
    await add({
      id: selectedVariantId.value,
      quantity: 1,
    });

    success.value = true;
    openDrawer();

    // Reset success state after 2 seconds
    setTimeout(() => {
      success.value = false;
    }, 2000);
  } catch (err) {
    error.value = err.message || 'Failed to add to cart';
  } finally {
    isAdding.value = false;
  }
}
</script>

<template>
  <div class="space-y-2">
    <button
      type="button"
      @click="handleAddToCart"
      :disabled="isAdding"
      class="w-full bg-black text-white px-6 py-3 rounded-md font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span v-if="!isAdding && !success">{{ buttonText }}</span>
      <span v-else-if="isAdding">Adding...</span>
      <span v-else-if="success">✓ Added to Cart</span>
    </button>

    <div
      v-if="error"
      class="text-red-600 text-sm text-center"
      role="alert"
    >
      {{ error }}
    </div>
  </div>
</template>
