// Components
import AddToCart from '@components/AddToCart.vue';
import ProductVariants from '@components/ProductVariants.vue';
import SideCart from '@components/SideCart.vue';
import CartCount from '@components/CartCount.vue';

/**
 * Deferred components
 *
 * These components will only load if they are rendered by markup. Use
 * for components that don't load on every page.
 *
 * i.e. below the fold components, landing page components, etc.
 */
const HeaderSlider = () => import('@components/HeaderSlider.vue');

export default {
  AddToCart,
  ProductVariants,
  CartCount,
  HeaderSlider,
  SideCart,
};
