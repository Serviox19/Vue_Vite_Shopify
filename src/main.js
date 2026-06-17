import { createApp, defineAsyncComponent } from 'vue';
import components from '@components/index.js';
import { useCart } from '@/stores/cart.js';
import './styles/app.css';

// Load the cart into the shared store once, before any island mounts, so the
// header badge and drawer have data on first paint. Guarded so theme-editor
// `shopify:section:load` re-runs don't refetch.
let cartLoaded = false;
function loadCart() {
  if (cartLoaded) return;
  cartLoaded = true;
  useCart().fetch().catch(() => {});
}

// Convert a kebab-case data-vue-mount name to its PascalCase registry key.
// e.g. "header-slider" -> "HeaderSlider"
function toPascalCase(name) {
  return name.replace(/(^\w|-\w)/g, (match) => match.replace('-', '').toUpperCase());
}

// Resolve a registry entry to a mountable component. Deferred entries are
// loader functions (() => import(...)); wrap them so they mount like the
// statically-imported ones and only fetch their chunk when used.
function resolveComponent(entry) {
  return typeof entry === 'function' ? defineAsyncComponent(entry) : entry;
}

// Mount a Vue app onto each [data-vue-mount] element on the page.
function initVueComponents() {
  loadCart();

  document.querySelectorAll('[data-vue-mount]').forEach((el) => {
    if (el.__vue_app__) return; // already mounted (e.g. re-run by theme editor)

    const name = el.dataset.vueMount;
    const entry = components[toPascalCase(name)];

    if (!entry) {
      console.warn(`No component registered for data-vue-mount="${name}"`);
      return;
    }

    let props = {};
    if (el.dataset.props) {
      try {
        props = JSON.parse(el.dataset.props);
      } catch (e) {
        console.error(`Invalid data-props for "${name}":`, e);
      }
    }

    createApp(resolveComponent(entry), props).mount(el);
  });
}

// Run once the DOM is ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVueComponents);
} else {
  initVueComponents();
}

// Re-mount components when the theme editor loads/reloads a section.
if (typeof Shopify !== 'undefined') {
  document.addEventListener('shopify:section:load', initVueComponents);
}
