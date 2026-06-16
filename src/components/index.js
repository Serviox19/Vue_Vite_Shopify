// Components
import AddToCart from '@components/AddToCart.vue';
import ProductVariants from '@components/ProductVariants.vue';

/**
 * Deferred components
 *
 * These components will only load if they are rendered by markup. Use
 * for components that don't load on every page.
 *
 * i.e. below the fold components, landing page components, etc.
 */
const HeaderSlider = () => import('@components/HeaderSlider.vue');
const SideCart = () => import('@components/SideCart.vue');

export default {
  AddToCart,
  ProductVariants,
  HeaderSlider,
  SideCart,
};
