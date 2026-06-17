// Components
import CartCount from '@components/CartCount.vue';
import SideCart from '@components/SideCart.vue';
import HeaderSlider from '@components/HeaderSlider.vue';

/**
 * Deferred components
 *
 * These components will only load if they are rendered by markup. Use
 * for components that don't load on every page.
 *
 * i.e. below the fold components, landing page components, etc.
 */
const AddToCart = () => import('@components/AddToCart.vue');
const ProductVariants = () => import('@components/ProductVariants.vue');

export default {
  AddToCart,
  ProductVariants,
  CartCount,
  HeaderSlider,
  SideCart,
};
