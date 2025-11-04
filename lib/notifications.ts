/**
 * @fileoverview Notification Management System
 * 
 * This module provides a centralized notification/toast management system for the
 * Sendora application. It wraps the UI toast component with a simplified API
 * for displaying success, error, warning, info, and loading notifications.
 * 
 * **Key Features:**
 * - Type-safe notification methods (success, error, warning, info)
 * - Loading state notifications
 * - Promise-based notifications with automatic state updates
 * - Custom notification support
 * - Unified dismiss functionality
 * - Flexible duration control
 * - Support for both string and object-based notifications
 * 
 * **Architecture:**
 * - Built on top of UI toast component
 * - Singleton pattern (single NotificationManager instance)
 * - Client-side only (uses "use client" directive)
 * - Consistent API across all notification types
 * 
 * **Notification Types:**
 * - Success: Operation completed successfully
 * - Error: Operation failed or error occurred
 * - Warning: Important information or potential issues
 * - Info: General information or updates
 * - Loading: Long-running operation in progress
 * - Promise: Automatic notifications based on promise state
 * 
 * **Usage Pattern:**
 * Import the singleton instance and call methods directly:
 * ```
 * import { notifications } from '@/lib/notifications'
 * notifications.showSuccess("Operation completed!")
 * ```
 * 
 * @module lib/notifications
 * @requires @/components/ui/toast - Base toast component
 * 
 * @author Farhan Alam
 * @version 1.0.0
 */

"use client"

import { showToast as toast, type ToastOptions } from '@/components/ui/toast'

/**
 * Extended notification options interface
 * 
 * Extends the base ToastOptions with additional positioning and icon capabilities.
 * Currently maintains compatibility with the base toast system while allowing
 * for future extensibility.
 * 
 * @interface NotificationOptions
 * @extends {ToastOptions}
 * @property {("top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right")} [position]
 *   Optional notification position on screen
 * @property {string} [icon] - Optional custom icon identifier
 */
export interface NotificationOptions extends ToastOptions {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  icon?: string
}

/**
 * Notification Manager Class
 * 
 * Centralized manager for all application notifications. Provides type-safe methods
 * for displaying different types of notifications with consistent styling and behavior.
 * 
 * **Design Principles:**
 * - Single responsibility: Manages all notifications
 * - Consistent API: All methods follow similar patterns
 * - Flexible inputs: Accept both strings and objects
 * - Type safety: Full TypeScript support
 * - Separation of concerns: UI logic delegated to toast component
 * 
 * @class NotificationManager
 * @private (Use exported singleton instance instead)
 */
class NotificationManager {
  /**
   * Displays a success notification
   * 
   * Shows a positive feedback message when operations complete successfully.
   * Commonly used after form submissions, data saves, or successful API calls.
   * 
   * **Visual Style:**
   * - Green/positive color scheme
   * - Success icon (checkmark)
   * - Default duration: 3000ms (configurable)
   * 
   * @param {(string | {title?: string; description?: string; duration?: number})} notification
   *   String for quick messages or object for detailed notifications
   * @returns {void}
   * 
   * @example
   * // Simple success message
   * notifications.showSuccess("Certificate sent successfully!")
   * 
   * @example
   * // Detailed success notification
   * notifications.showSuccess({
   *   title: "Upload Complete",
   *   description: "50 files uploaded successfully",
   *   duration: 5000
   * })
   */
  showSuccess(
    notification: { title?: string; description?: string; duration?: number } | string
  ) {
    if (typeof notification === 'string') {
      return toast.success({
        title: 'Success',
        description: notification,
      })
    }
    
    return toast.success({
      title: notification.title || 'Success',
      description: notification.description,
      duration: notification.duration,
    })
  }

  /**
   * Displays an error notification
   * 
   * Shows error messages when operations fail or exceptions occur.
   * Essential for user feedback during error conditions.
   * 
   * **Visual Style:**
   * - Red/negative color scheme
   * - Error icon (X or alert)
   * - Default duration: 5000ms (stays longer than success)
   * 
   * **Best Practices:**
   * - Always include a description explaining what went wrong
   * - Provide actionable information when possible
   * - Keep error messages user-friendly (avoid technical jargon)
   * 
   * @param {{title?: string; description: string; duration?: number}} notification
   *   Error notification with required description
   * @returns {void}
   * 
   * @example
   * // Simple error
   * notifications.showError({
   *   description: "Failed to send email. Please try again."
   * })
   * 
   * @example
   * // Detailed error with custom title
   * notifications.showError({
   *   title: "Upload Failed",
   *   description: "File size exceeds 10MB limit",
   *   duration: 7000
   * })
   * 
   * @example
   * // API error handling
   * try {
   *   await sendEmail(data)
   * } catch (error) {
   *   notifications.showError({
   *     title: "Email Send Failed",
   *     description: error.message || "Unknown error occurred"
   *   })
   * }
   */
  showError(
    notification: { title?: string; description: string; duration?: number }
  ) {
    return toast.error({
      title: notification.title || 'Error',
      description: notification.description,
      duration: notification.duration,
    })
  }

  /**
   * Displays a warning notification
   * 
   * Shows cautionary messages for important information that requires user attention
   * but isn't necessarily an error. Used for validation warnings, confirmation prompts,
   * or potential issues.
   * 
   * **Visual Style:**
   * - Yellow/orange color scheme
   * - Warning icon (exclamation triangle)
   * - Default duration: 4000ms
   * 
   * **Common Use Cases:**
   * - Form validation warnings
   * - Quota or limit warnings
   * - Confirmation before destructive actions
   * - Deprecated feature notifications
   * 
   * @param {(string | {title?: string; description?: string; duration?: number})} notification
   *   String or object format warning
   * @returns {void}
   * 
   * @example
   * // Simple warning
   * notifications.showWarning("Some recipients have invalid email addresses")
   * 
   * @example
   * // Detailed warning
   * notifications.showWarning({
   *   title: "Storage Limit",
   *   description: "You've used 90% of your storage quota",
   *   duration: 6000
   * })
   */
  showWarning(
    notification: { title?: string; description?: string; duration?: number } | string
  ) {
    if (typeof notification === 'string') {
      return toast.warning({
        title: 'Warning',
        description: notification,
      })
    }
    
    return toast.warning({
      title: notification.title || 'Warning',
      description: notification.description,
      duration: notification.duration,
    })
  }

  /**
   * Displays an informational notification
   * 
   * Shows general information, updates, or neutral messages that don't indicate
   * success, error, or warning. Perfect for status updates and non-critical information.
   * 
   * **Visual Style:**
   * - Blue/neutral color scheme
   * - Info icon (i or circle)
   * - Default duration: 3000ms
   * 
   * **Common Use Cases:**
   * - Status updates ("Processing 50 of 100 files...")
   * - Feature tips or hints
   * - System notifications
   * - General announcements
   * 
   * @param {(string | {title?: string; description?: string; duration?: number})} notification
   *   String or object format information
   * @returns {void}
   * 
   * @example
   * // Simple info message
   * notifications.showInfo("Certificate preview updated")
   * 
   * @example
   * // Detailed info notification
   * notifications.showInfo({
   *   title: "New Feature",
   *   description: "Try our new drag-and-drop file upload!",
   *   duration: 5000
   * })
   */
  showInfo(
    notification: { title?: string; description?: string; duration?: number } | string
  ) {
    if (typeof notification === 'string') {
      return toast.info({
        title: 'Info',
        description: notification,
      })
    }
    
    return toast.info({
      title: notification.title || 'Info',
      description: notification.description,
      duration: notification.duration,
    })
  }

  /**
   * Displays a loading notification
   * 
   * Shows progress or loading state during long-running operations. Provides
   * user feedback that the application is working and hasn't frozen.
   * 
   * **Visual Style:**
   * - Blue/neutral color scheme with loading spinner
   * - Info icon with animation
   * - Default duration: 3000ms (often used with dismiss() for manual control)
   * 
   * **Usage Pattern:**
   * Typically shown at operation start and dismissed when complete:
   * ```
   * const loadingToast = notifications.showLoading("Processing...")
   * await longOperation()
   * notifications.dismiss()
   * notifications.showSuccess("Complete!")
   * ```
   * 
   * @param {(string | {title?: string; description?: string; duration?: number})} notification
   *   String or object format loading message
   * @returns {void}
   * 
   * @example
   * // Simple loading message
   * notifications.showLoading("Generating certificates...")
   * 
   * @example
   * // Loading with manual dismissal
   * notifications.showLoading({
   *   title: "Uploading",
   *   description: "Please wait while we process your files",
   *   duration: 10000
   * })
   * // Later...
   * notifications.dismiss()
   */
  showLoading(
    notification: { title?: string; description?: string; duration?: number } | string
  ) {
    if (typeof notification === 'string') {
      return toast.info({
        title: 'Loading',
        description: notification,
      })
    }
    
    return toast.info({
      title: notification.title || 'Loading',
      description: notification.description,
      duration: notification.duration,
    })
  }

  /**
   * Displays a custom notification with flexible content
   * 
   * Provides maximum flexibility for advanced notification scenarios where
   * standard types (success, error, etc.) don't fit. Accepts React nodes
   * and custom type specification.
   * 
   * **Features:**
   * - Custom React content support
   * - Type specification (success, error, warning, info)
   * - Full control over notification appearance
   * - Duration customization
   * 
   * **Use Cases:**
   * - Complex notification layouts
   * - Rich media notifications
   * - Interactive notifications
   * - Custom branded notifications
   * 
   * @param {React.ReactNode} content - React node or string content to display
   * @param {{type?: ("success" | "error" | "warning" | "info"); duration?: number}} [options]
   *   Optional configuration for type and duration
   * @returns {void}
   * 
   * @example
   * // Simple custom notification
   * notifications.showCustom("Custom message", { type: "info" })
   * 
   * @example
   * // Complex custom content (when React nodes supported)
   * notifications.showCustom(
   *   <div>
   *     <strong>Update Available</strong>
   *     <button onClick={handleUpdate}>Update Now</button>
   *   </div>,
   *   { type: "info", duration: 10000 }
   * )
   */
  showCustom(
    content: React.ReactNode, 
    options?: { type?: 'success' | 'error' | 'warning' | 'info'; duration?: number }
  ) {
    // Convert content to string for title/description
    const contentStr = content?.toString() || ''
    
    const toastOptions = {
      title: options?.type === 'success' ? 'Success' : 
             options?.type === 'error' ? 'Error' :
             options?.type === 'warning' ? 'Warning' : 'Info',
      description: contentStr,
      duration: options?.duration,
    }
    
    switch (options?.type) {
      case 'success':
        return toast.success(toastOptions)
      case 'error':
        return toast.error(toastOptions)
      case 'warning':
        return toast.warning(toastOptions)
      case 'info':
      default:
        return toast.info(toastOptions)
    }
  }

  /**
   * Dismisses all active notifications
   * 
   * Immediately closes all currently displayed notifications. Useful for
   * cleaning up the UI before navigation or when showing critical alerts.
   * 
   * **Use Cases:**
   * - Page navigation cleanup
   * - Before showing critical alerts
   * - User-triggered dismiss all
   * - Clearing loading notifications after completion
   * 
   * @returns {void}
   * 
   * @example
   * // Dismiss before critical error
   * notifications.dismiss()
   * notifications.showError({
   *   description: "Critical error occurred!"
   * })
   * 
   * @example
   * // Clean up on navigation
   * function handleNavigation() {
   *   notifications.dismiss()
   *   router.push('/next-page')
   * }
   */
  dismiss() {
    toast.dismiss()
  }

  /**
   * Creates a promise-based notification that updates based on promise state
   * 
   * This powerful method automatically shows loading, success, and error notifications
   * based on a promise's lifecycle. It provides seamless user feedback for async
   * operations without manual notification management.
   * 
   * **Notification Flow:**
   * 1. Shows loading message immediately
   * 2. On success: Shows success message with optional data formatting
   * 3. On error: Shows error message with optional error formatting
   * 
   * **Message Configuration:**
   * - loading: Static string shown while promise is pending
   * - success: Static string or function that receives resolved data
   * - error: Static string or function that receives error object
   * 
   * **Advantages:**
   * - Automatic state management
   * - Cleaner code (no manual try/catch for notifications)
   * - Consistent UX for all async operations
   * - Type-safe with generic support
   * 
   * @template T - Type of promise resolution value
   * @param {Promise<T>} promise - The promise to track
   * @param {{loading: string; success: string | ((data: T) => string); error: string | ((error: any) => string)}} messages
   *   Messages for each state (loading, success, error)
   * @param {{duration?: number}} [options] - Optional duration configuration
   * @returns {Promise<T>} The original promise (pass-through)
   * 
   * @example
   * // Basic usage with static messages
   * await notifications.promise(
   *   sendEmailBatch(recipients),
   *   {
   *     loading: "Sending emails...",
   *     success: "All emails sent successfully!",
   *     error: "Failed to send emails"
   *   }
   * )
   * 
   * @example
   * // Dynamic messages based on result
   * const result = await notifications.promise(
   *   uploadFiles(files),
   *   {
   *     loading: "Uploading files...",
   *     success: (data) => `Uploaded ${data.count} files successfully`,
   *     error: (err) => `Upload failed: ${err.message}`
   *   },
   *   { duration: 5000 }
   * )
   * 
   * @example
   * // Async operation with error handling
   * notifications.promise(
   *   generateCertificates(recipients),
   *   {
   *     loading: "Generating certificates...",
   *     success: (pdfs) => `Generated ${pdfs.length} certificates`,
   *     error: (err) => `Generation failed: ${err.message}`
   *   }
   * ).catch(error => {
   *   // Additional error handling if needed
   *   console.error("Certificate generation error:", error)
   * })
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    },
    options?: { duration?: number }
  ) {
    return toast.promise(promise, messages, options)
  }
}

/**
 * Singleton notification manager instance
 * 
 * The primary export of this module. Use this instance to display notifications
 * throughout the application. It provides a consistent, centralized interface
 * for all notification types.
 * 
 * **Why Singleton?**
 * - Ensures consistent notification behavior across the app
 * - Simplifies import (no need to instantiate)
 * - Central state management
 * - Easy to mock for testing
 * 
 * @constant {NotificationManager}
 * @public
 * 
 * @example
 * // Import and use
 * import { notifications } from '@/lib/notifications'
 * 
 * notifications.showSuccess("Operation completed!")
 * notifications.showError({ description: "Something went wrong" })
 * 
 * @example
 * // In async operations
 * await notifications.promise(
 *   fetchData(),
 *   {
 *     loading: "Loading...",
 *     success: "Data loaded!",
 *     error: "Load failed"
 *   }
 * )
 */
export const notifications = new NotificationManager()

/**
 * Default export for convenience
 * 
 * Allows importing the notification manager as default:
 * `import notifications from '@/lib/notifications'`
 * 
 * @type {NotificationManager}
 * @public
 */
export default notifications
