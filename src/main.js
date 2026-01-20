import { createApp } from 'vue';
import './styles/app.css';

// Import Vue components
import AddToCart from './components/AddToCart.vue';
import ProductVariants from './components/ProductVariants.vue';

// Component registry
const components = {
  'add-to-cart': AddToCart,
  'product-variants': ProductVariants,
};

/**
 * Initialize Vue components based on data-vue-mount attributes
 * Usage in Liquid: <div data-vue-mount="add-to-cart" :data-props="{ ... }"></div>
 */
function initVueComponents() {
  // Find all elements with data-vue-mount attribute
  const mountPoints = document.querySelectorAll('[data-vue-mount]');

  mountPoints.forEach((el) => {
    const componentName = el.dataset.vueMount;
    const component = components[componentName];

    if (!component) {
      console.warn(`Vue component "${componentName}" not found`);
      return;
    }

    // Parse props from data-props attribute if present
    let props = {};
    if (el.dataset.props) {
      try {
        props = JSON.parse(el.dataset.props);
      } catch (e) {
        console.error(`Failed to parse props for ${componentName}:`, e);
      }
    }

    // Create and mount the Vue app
    const app = createApp(component, props);
    app.mount(el);
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVueComponents);
} else {
  initVueComponents();
}

// Re-initialize on Shopify section load/reload (for theme editor)
if (typeof Shopify !== 'undefined') {
  document.addEventListener('shopify:section:load', () => {
    setTimeout(initVueComponents, 100);
  });
}
