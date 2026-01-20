/**
 * Money formatting utilities for Shopify
 */

/**
 * Format price in cents to currency string
 * @param {Number} cents - Price in cents
 * @param {String} currency - Currency code (default: USD)
 * @returns {String} Formatted price
 */
export function formatMoney(cents, currency = 'USD') {
  const amount = cents / 100;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format price range for products with variants
 * @param {Number} minPrice - Minimum price in cents
 * @param {Number} maxPrice - Maximum price in cents
 * @param {String} currency - Currency code
 * @returns {String} Formatted price range
 */
export function formatPriceRange(minPrice, maxPrice, currency = 'USD') {
  if (minPrice === maxPrice) {
    return formatMoney(minPrice, currency);
  }

  return `${formatMoney(minPrice, currency)} - ${formatMoney(maxPrice, currency)}`;
}

/**
 * Calculate discount percentage
 * @param {Number} originalPrice - Original price in cents
 * @param {Number} salePrice - Sale price in cents
 * @returns {Number} Discount percentage
 */
export function calculateDiscount(originalPrice, salePrice) {
  if (originalPrice <= salePrice) return 0;

  const discount = ((originalPrice - salePrice) / originalPrice) * 100;
  return Math.round(discount);
}
