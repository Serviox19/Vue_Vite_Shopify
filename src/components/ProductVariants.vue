<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  selectedVariantId: {
    type: [Number, String],
    default: null,
  },
});

const emit = defineEmits(['variant-change']);

const currentVariantId = ref(props.selectedVariantId || props.product.variants?.[0]?.id);

const currentVariant = computed(() => {
  return props.product.variants?.find(v => v.id === currentVariantId.value);
});

const isAvailable = computed(() => {
  return currentVariant.value?.available ?? false;
});

const variantPrice = computed(() => {
  if (!currentVariant.value) return '';
  const price = currentVariant.value.price / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
});

function selectVariant(variantId) {
  currentVariantId.value = variantId;
  emit('variant-change', {
    variant: currentVariant.value,
    variantId,
  });
}

// Watch for external changes
watch(() => props.selectedVariantId, (newId) => {
  if (newId && newId !== currentVariantId.value) {
    currentVariantId.value = newId;
  }
});
</script>

<template>
  <div class="space-y-4">
    <!-- Options selector -->
    <div
      v-for="option in product.options"
      :key="option.name"
      class="space-y-2"
    >
      <label class="block font-medium text-sm">
        {{ option.name }}
      </label>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="value in option.values"
          :key="value"
          @click="selectVariant(findVariantByOption(option.name, value))"
          :class="[
            'px-4 py-2 border rounded-md transition-colors',
            isOptionSelected(option.name, value)
              ? 'border-black bg-black text-white'
              : 'border-gray-300 hover:border-gray-400'
          ]"
        >
          {{ value }}
        </button>
      </div>
    </div>

    <!-- Price display -->
    <div class="text-2xl font-bold">
      {{ variantPrice }}
    </div>

    <!-- Availability -->
    <div
      v-if="!isAvailable"
      class="text-red-600 text-sm font-medium"
    >
      Out of Stock
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    findVariantByOption(optionName, value) {
      // Find variant matching the selected option
      const optionIndex = this.product.options.findIndex(opt => opt.name === optionName);
      return this.product.variants.find(variant => {
        return variant.options[optionIndex] === value;
      })?.id;
    },

    isOptionSelected(optionName, value) {
      const optionIndex = this.product.options.findIndex(opt => opt.name === optionName);
      return this.currentVariant?.options?.[optionIndex] === value;
    },
  },
};
</script>
