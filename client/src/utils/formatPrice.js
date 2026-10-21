/**
 * Formats a number as a currency string (₹) with 2 decimal places.
 * @param {number} price - The price to format.
 * @returns {string} - The formatted price string.
 */
export const formatPrice = (price) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numericPrice)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(numericPrice);
};

/**
 * Rounds a number to a specific number of decimal places.
 * @param {number} num - The number to round.
 * @param {number} decimals - Number of decimal places (default 2).
 * @returns {number} - The rounded number.
 */
export const roundTo = (num, decimals = 2) => {
    return +(Math.round(num + "e+" + decimals) + "e-" + decimals);
};
