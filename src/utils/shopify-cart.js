/**
 * Shopify Cart API utilities
 * Documentation: https://shopify.dev/docs/api/ajax
 */

/**
 * Add item(s) to cart
 * @param {Object|Array} items - Single item or array of items to add
 * @returns {Promise<Object>} Cart data
 */
export async function addToCart(items) {
  const itemsArray = Array.isArray(items) ? items : [items];

  const response = await fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: itemsArray }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.description || 'Failed to add to cart');
  }

  return response.json();
}

/**
 * Update cart item quantity
 * @param {String} key - Cart line item key (stable across index shifts)
 * @param {Number} quantity - New quantity (0 removes the line)
 * @returns {Promise<Object>} Updated cart data
 */
export async function updateCart(key, quantity) {
  const response = await fetch('/cart/change.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: key,
      quantity,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update cart');
  }

  return response.json();
}

/**
 * Get current cart data
 * @returns {Promise<Object>} Cart data
 */
export async function getCart() {
  // `cache: 'no-store'` bypasses the browser HTTP cache. Without it, a GET to
  // /cart.js right after a POST to /cart/add.js can be served from memory cache
  // and return the *pre-add* cart, so the count/drawer don't refresh until a
  // full page reload forces revalidation.
  const response = await fetch('/cart.js', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }

  return response.json();
}
