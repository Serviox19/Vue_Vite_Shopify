<script setup>
import { useCart } from '@/stores/cart.js';

const { itemCount } = useCart();
</script>

<template>
  <span
    v-if="itemCount > 0"
    class="header__cart-count"
    :aria-label="`${itemCount} items in cart`"
  >{{ itemCount }}</span>
</template>
