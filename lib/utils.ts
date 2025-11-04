/**
 * @fileoverview Utility Functions Module
 * 
 * This module provides essential utility functions for the Sendora application,
 * primarily focusing on CSS class name manipulation and merging functionality.
 * 
 * @module lib/utils
 * @requires clsx - Utility for constructing className strings conditionally
 * @requires tailwind-merge - Utility for merging Tailwind CSS classes intelligently
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines and merges CSS class names intelligently
 * 
 * This utility function merges multiple class name inputs while handling Tailwind CSS
 * class conflicts intelligently. It combines the conditional class name construction
 * from clsx with the intelligent merging capabilities of tailwind-merge.
 * 
 * **Key Features:**
 * - Handles conditional class names (objects, arrays, strings)
 * - Resolves Tailwind CSS class conflicts (e.g., 'px-2' + 'px-4' = 'px-4')
 * - Removes duplicate class names
 * - Maintains proper specificity order
 * 
 * **Common Use Cases:**
 * - Merging component variant styles with custom overrides
 * - Applying conditional styling based on component state
 * - Combining base styles with responsive modifiers
 * 
 * @param {...ClassValue[]} inputs - Variable number of class name inputs that can be:
 *   - strings: 'class-name'
 *   - objects: { 'class-name': condition }
 *   - arrays: ['class-1', 'class-2']
 *   - undefined/null/false: ignored
 * 
 * @returns {string} Merged and optimized class name string
 * 
 * @example
 * // Basic usage
 * cn('px-2 py-1', 'bg-blue-500')
 * // => 'px-2 py-1 bg-blue-500'
 * 
 * @example
 * // Conditional classes
 * cn('base-class', { 'active-class': isActive, 'disabled-class': isDisabled })
 * // => 'base-class active-class' (if isActive is true and isDisabled is false)
 * 
 * @example
 * // Resolving Tailwind conflicts (later values override earlier ones)
 * cn('px-2 py-1', 'px-4')
 * // => 'py-1 px-4' (px-4 overrides px-2)
 * 
 * @example
 * // Component styling with variants
 * const buttonClasses = cn(
 *   'rounded font-semibold',
 *   variant === 'primary' && 'bg-blue-500 text-white',
 *   variant === 'secondary' && 'bg-gray-200 text-gray-900',
 *   size === 'sm' && 'px-3 py-1 text-sm',
 *   size === 'lg' && 'px-6 py-3 text-lg',
 *   className // Allow custom overrides
 * )
 * 
 * @see {@link https://github.com/lukeed/clsx clsx documentation}
 * @see {@link https://github.com/dcastil/tailwind-merge tailwind-merge documentation}
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
