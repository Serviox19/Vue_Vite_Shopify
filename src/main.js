import { createApp } from 'vue';
import './styles/app.css';

// Debug logging
console.log('main.js loaded successfully!');
console.log('Current location:', window.location.href);

// Lazy-loaded component registry
const componentImports = {
  'add-to-cart': () => import('./components/AddToCart.vue'),
  'product-variants': () => import('./components/ProductVariants.vue'),
  'header-slider': () => import('./components/HeaderSlider.vue'),
};

// Cache for loaded components (persists across section reloads)
const loadedComponentsCache = new Map();

// Debounce function to prevent rapid successive calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Initialize Vue components based on data-vue-mount attributes
 * Components are lazy-loaded only when needed with optimizations:
 * - Component caching across section reloads
 * - Individual component loading (no waiting for all)
 * - Debounced section load handling
 * Usage: <div data-vue-mount="add-to-cart" data-props='{"productId": 123}'></div>
 */
async function initVueComponents() {
  console.log('initVueComponents called');

  // Find all elements with data-vue-mount attribute
  const mountPoints = document.querySelectorAll('[data-vue-mount]');
  console.log('Found mount points:', mountPoints.length, mountPoints);

  if (mountPoints.length === 0) {
    console.log('No Vue components found on page');
    return; // No Vue components needed on this page
  }

  // Get unique component names needed on this page
  const neededComponents = [...new Set(
    Array.from(mountPoints).map(el => el.dataset.vueMount)
  )];

  // Load and mount components individually (don't wait for all)
  const mountPromises = neededComponents.map(async (componentName) => {
    // Check cache first
    if (loadedComponentsCache.has(componentName)) {
      const component = loadedComponentsCache.get(componentName);
      mountComponent(componentName, component, mountPoints);
      return;
    }

    const importFn = componentImports[componentName];
    if (!importFn) {
      console.warn(`Vue component "${componentName}" not found in registry`);
      return;
    }

    try {
      const module = await importFn();
      const component = module.default;

      // Cache the loaded component
      loadedComponentsCache.set(componentName, component);

      // Mount immediately after loading
      mountComponent(componentName, component, mountPoints);
    } catch (e) {
      console.error(`Failed to load component "${componentName}":`, e);
    }
  });

  // Don't wait for all components to load - they mount individually
  await Promise.allSettled(mountPromises);
}

/**
 * Mount a specific component to all matching elements
 */
function mountComponent(componentName, component, mountPoints) {
  mountPoints.forEach((el) => {
    if (el.dataset.vueMount !== componentName) return;

    // Skip if already mounted
    if (el.__vue_app__) return;

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
console.log('Setting up DOM ready listener, current readyState:', document.readyState);
if (document.readyState === 'loading') {
  console.log('Adding DOMContentLoaded listener');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    initVueComponents();
  });
} else {
  console.log('DOM already ready, calling initVueComponents');
  initVueComponents();
}

// Debounced section load handler (prevents rapid successive calls)
const debouncedInit = debounce(() => initVueComponents(), 100);

// Re-initialize on Shopify section load/reload (for theme editor)
if (typeof Shopify !== 'undefined') {
  document.addEventListener('shopify:section:load', debouncedInit);
}
