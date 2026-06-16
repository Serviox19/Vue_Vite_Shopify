<script setup>
import { computed } from 'vue';
import { formatMoney } from '@/filters/money.js';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update-quantity', 'remove']);

// Shopify uses "Default Title" for single-variant products — not worth showing.
const variantTitle = computed(() => {
  const title = props.item.variant_title;
  return title && title !== 'Default Title' ? title : '';
});

const linePrice = computed(() => formatMoney(props.item.final_line_price));

function increment() {
  emit('update-quantity', props.item.key, props.item.quantity + 1);
}

function decrement() {
  const next = props.item.quantity - 1;
  if (next < 1) {
    emit('remove', props.item.key);
  } else {
    emit('update-quantity', props.item.key, next);
  }
}

function remove() {
  emit('remove', props.item.key);
}
</script>

<template>
  <div class="flex gap-3 py-4 border-b border-gray-200">
    <a :href="item.url" class="shrink-0">
      <img
        v-if="item.image"
        :src="item.image"
        :alt="item.product_title"
        width="80"
        height="80"
        class="w-20 h-20 object-cover rounded-md bg-gray-100"
        loading="lazy"
      />
      <div v-else class="w-20 h-20 rounded-md bg-gray-100"></div>
    </a>

    <div class="flex-1 min-w-0 flex flex-col">
      <div class="flex justify-between gap-2">
        <a
          :href="item.url"
          class="text-sm font-medium leading-snug hover:opacity-70 line-clamp-2"
        >
          {{ item.product_title }}
        </a>
        <button
          type="button"
          class="shrink-0 text-gray-400 hover:text-black transition-colors"
          aria-label="Remove item"
          @click="remove"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p v-if="variantTitle" class="text-xs text-gray-500 mt-0.5">
        {{ variantTitle }}
      </p>

      <div class="flex items-center justify-between mt-auto pt-2">
        <div class="inline-flex items-center border border-gray-300 rounded-md">
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center text-lg leading-none hover:bg-gray-100 transition-colors"
            aria-label="Decrease quantity"
            @click="decrement"
          >
            −
          </button>
          <span class="w-8 text-center text-sm tabular-nums" aria-live="polite">{{ item.quantity }}</span>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center text-lg leading-none hover:bg-gray-100 transition-colors"
            aria-label="Increase quantity"
            @click="increment"
          >
            +
          </button>
        </div>

        <span class="text-sm font-semibold tabular-nums">{{ linePrice }}</span>
      </div>
    </div>
  </div>
</template>
