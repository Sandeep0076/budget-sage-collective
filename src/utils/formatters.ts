
/**
 * Utility functions for formatting data in the application
 */

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date to a readable string
 * @param date - The date to format
 * @param format - The format style (default: 'medium')
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' = 'medium'
): string => {
  const dateObj = typeof date === 'object' ? date : new Date(date);
  
  const options: Intl.DateTimeFormatOptions = 
    format === 'short' 
      ? { month: 'short', day: 'numeric' } 
      : format === 'medium'
        ? { year: 'numeric', month: 'short', day: 'numeric' }
        : { year: 'numeric', month: 'long', day: 'numeric' };
        
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};

/**
 * Format a percentage
 * @param value - The decimal value to format as percentage
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Truncate text to a specified length
 * @param text - The text to truncate
 * @param length - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, length = 30): string => {
  if (text.length <= length) return text;
  return `${text.substring(0, length - 3)}...`;
};

/**
 * Calculate the percentage of a value against a total
 * @param value - The current value
 * @param total - The total value
 * @returns Percentage as a decimal
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return value / total;
};

/**
 * Get appropriate color class based on budget usage percentage
 * @param percentage - Budget usage as decimal (0.7 = 70%)
 * @returns Tailwind CSS color class
 */
export const getBudgetColorClass = (percentage: number): string => {
  if (percentage < 0.7) return 'text-budget-low bg-budget-low/10';
  if (percentage < 0.9) return 'text-budget-medium bg-budget-medium/10';
  return 'text-budget-high bg-budget-high/10';
};

/**
 * Format a number with thousands separators
 * @param num - The number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};
