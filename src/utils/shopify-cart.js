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
 * @param {String|Number} lineId - Cart line item id
 * @param {Number} quantity - New quantity
 * @returns {Promise<Object>} Updated cart data
 */
export async function updateCart(lineId, quantity) {
  const response = await fetch('/cart/change.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      line: lineId,
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
  const response = await fetch('/cart.js');

  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }

  return response.json();
}

/**
 * Clear all items from cart
 * @returns {Promise<Object>} Empty cart data
 */
export async function clearCart() {
  const response = await fetch('/cart/clear.js', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to clear cart');
  }

  return response.json();
}

/**
 * Get product recommendations
 * @param {String|Number} productId - Product ID
 * @param {Number} limit - Number of recommendations (default: 4)
 * @returns {Promise<Array>} Array of recommended products
 */
export async function getProductRecommendations(productId, limit = 4) {
  const response = await fetch(
    `/recommendations/products.json?product_id=${productId}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }

  const data = await response.json();
  return data.products || [];
}
