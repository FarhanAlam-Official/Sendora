/**
 * @fileoverview Toast Notification Hook System
 * 
 * This module implements a lightweight, React-based toast notification system
 * inspired by react-hot-toast. It provides a global toast manager with state
 * management, automatic dismissal, and flexible notification handling.
 * 
 * **Architecture:**
 * - Global state management with React hooks
 * - Pub/sub pattern for cross-component notifications
 * - Memory-based state with listener subscriptions
 * - Automatic cleanup with configurable delays
 * - Support for multiple simultaneous toasts (configurable limit)
 * 
 * **Key Features:**
 * - Programmatic toast creation and dismissal
 * - Auto-dismiss with configurable delays
 * - Limit active toasts (default: 1)
 * - Update existing toasts
 * - Remove toasts manually or automatically
 * - Type-safe with TypeScript
 * - Client-side only (use client directive)
 * 
 * **Toast Lifecycle:**
 * 1. ADD_TOAST: Create new toast (auto-generate ID)
 * 2. Toast displays with `open: true`
 * 3. DISMISS_TOAST: Set `open: false` and schedule removal
 * 4. REMOVE_TOAST: Remove from state after delay
 * 
 * **State Management:**
 * - In-memory state (memoryState) persists across component renders
 * - Listener array enables reactive updates
 * - Dispatch function triggers state updates and notifies listeners
 * - Each component instance subscribes to global state changes
 * 
 * **Configuration:**
 * - TOAST_LIMIT: Maximum concurrent toasts (1 = only latest shown)
 * - TOAST_REMOVE_DELAY: Time before removed from DOM (1000000ms = ~16 minutes)
 * 
 * **Use Cases:**
 * - User feedback for actions (save, delete, etc.)
 * - Error and success notifications
 * - Loading states
 * - Undo/redo actions
 * - Form validation messages
 * 
 * @module hooks/use-toast
 * @requires react - React hooks for state management
 * @requires @/components/ui/toast - Toast component types
 * 
 * @inspiration react-hot-toast
 * @author Farhan Alam
 * @version 1.0.0
 */

'use client'

// Inspired by react-hot-toast library
import * as React from 'react'

/**
 * Toast action element type
 * Represents a React element that can be used as an action button in a toast
 */
type ToastActionElement = React.ReactElement

/**
 * Base toast properties
 * Defines the core properties that all toasts must support
 */
interface ToastProps {
  id?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: 'default' | 'destructive'
  duration?: number
  [key: string]: any
}

/**
 * Maximum number of toasts to display simultaneously
 * 
 * When limit is reached, oldest toasts are removed to make room for new ones.
 * Setting to 1 ensures only the most recent toast is shown (typical behavior).
 * 
 * @constant {number}
 * @private
 */
const TOAST_LIMIT = 1

/**
 * Delay (in milliseconds) before removing dismissed toasts from the DOM
 * 
 * After a toast is dismissed (open: false), it remains in state for this
 * duration to allow exit animations to complete. Very long delay allows
 * toasts to remain accessible for extended periods.
 * 
 * @constant {number}
 * @private
 */
const TOAST_REMOVE_DELAY = 1000000

/**
 * Extended toast type with required ID and content properties
 * 
 * Combines base ToastProps with additional fields needed for toast management.
 * Each toast must have a unique ID for tracking and updates.
 * 
 * @typedef {Object} ToasterToast
 * @extends {ToastProps}
 * @property {string} id - Unique identifier for the toast
 * @property {React.ReactNode} [title] - Optional toast title
 * @property {React.ReactNode} [description] - Optional toast description
 * @property {ToastActionElement} [action] - Optional action button element
 */
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

/**
 * Action type constants for the toast reducer
 * 
 * Defines all possible state mutations for the toast system.
 * Using constants prevents typos and enables type safety.
 * 
 * @constant
 * @private
 */
const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const

/**
 * Auto-incrementing counter for generating unique toast IDs
 * 
 * Starts at 0 and increments with each new toast. Wraps around at
 * Number.MAX_SAFE_INTEGER to prevent overflow.
 * 
 * @type {number}
 * @private
 */
let count = 0

/**
 * Generates a unique ID for a new toast
 * 
 * Creates sequential IDs as strings. Wraps around at MAX_SAFE_INTEGER
 * to ensure IDs remain valid numbers.
 * 
 * @returns {string} Unique toast identifier
 * @private
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType['ADD_TOAST']
      toast: ToasterToast
    }
  | {
      type: ActionType['UPDATE_TOAST']
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType['DISMISS_TOAST']
      toastId?: ToasterToast['id']
    }
  | {
      type: ActionType['REMOVE_TOAST']
      toastId?: ToasterToast['id']
    }

/**
 * Toast state structure
 * 
 * Represents the global state of all active toasts.
 * 
 * @interface State
 * @property {ToasterToast[]} toasts - Array of all current toasts
 */
interface State {
  toasts: ToasterToast[]
}

/**
 * Map of active toast removal timeouts
 * 
 * Tracks scheduled removals to prevent duplicate timers and enable cancellation.
 * Keys are toast IDs, values are setTimeout handles.
 * 
 * @type {Map<string, ReturnType<typeof setTimeout>>}
 * @private
 */
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Schedules a toast for removal after the configured delay
 * 
 * This function handles the automatic cleanup of dismissed toasts. It creates
 * a timeout that will remove the toast from state after TOAST_REMOVE_DELAY,
 * allowing exit animations to complete.
 * 
 * **Behavior:**
 * - Only schedules if no timeout already exists for this toast
 * - Automatically removes toast from state after delay
 * - Cleans up timeout handle from the map
 * 
 * @param {string} toastId - ID of the toast to schedule for removal
 * @returns {void}
 * @private
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

/**
 * Toast state reducer
 * 
 * Pure function that handles all state transitions for the toast system.
 * Implements the standard Redux-style reducer pattern.
 * 
 * **Supported Actions:**
 * - ADD_TOAST: Add new toast to state (respects TOAST_LIMIT)
 * - UPDATE_TOAST: Modify existing toast properties
 * - DISMISS_TOAST: Mark toast(s) as closed and schedule removal
 * - REMOVE_TOAST: Remove toast(s) from state
 * 
 * **State Immutability:**
 * All state updates return new state objects/arrays to ensure
 * React can detect changes and trigger re-renders.
 * 
 * @param {State} state - Current toast state
 * @param {Action} action - Action to apply
 * @returns {State} New state after applying action
 * @private
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      }

    case 'DISMISS_TOAST': {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      }
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

/**
 * Array of listener functions subscribed to state changes
 * 
 * Each listener is called whenever the toast state changes, enabling
 * reactive updates across all components using the hook.
 * 
 * @type {Array<(state: State) => void>}
 * @private
 */
const listeners: Array<(state: State) => void> = []

/**
 * Global in-memory toast state
 * 
 * Persists across component renders and unmounts. All components
 * using useToast() subscribe to this shared state.
 * 
 * @type {State}
 * @private
 */
let memoryState: State = { toasts: [] }

/**
 * Dispatches an action to update toast state
 * 
 * This is the primary state mutation function. It updates the global
 * state using the reducer and notifies all subscribed listeners.
 * 
 * **Workflow:**
 * 1. Apply action to current state via reducer
 * 2. Update global memoryState
 * 3. Notify all listeners (triggers component re-renders)
 * 
 * @param {Action} action - The action to dispatch
 * @returns {void}
 * @private
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

/**
 * Toast properties without ID (used for creating new toasts)
 * 
 * When creating a toast, the ID is auto-generated, so it's not required
 * in the input properties.
 * 
 * @typedef {Object} Toast
 */
type Toast = Omit<ToasterToast, 'id'>

/**
 * Creates and displays a new toast notification
 * 
 * This is the primary function for programmatically creating toasts.
 * It generates a unique ID, adds the toast to state, and provides
 * methods for updating or dismissing the toast.
 * 
 * **Return Value:**
 * Returns an object with:
 * - `id`: The generated toast ID
 * - `dismiss()`: Function to dismiss this specific toast
 * - `update(props)`: Function to update this toast's properties
 * 
 * **Auto-dismiss:**
 * Toast automatically sets up an onOpenChange handler that dismisses
 * the toast when the open state becomes false.
 * 
 * @param {Toast} props - Toast properties (title, description, variant, etc.)
 * @returns {{id: string; dismiss: () => void; update: (props: ToasterToast) => void}}
 *   Object with toast ID and control methods
 * 
 * @example
 * // Create a simple toast
 * const { id } = toast({
 *   title: "Success",
 *   description: "Operation completed"
 * })
 * 
 * @example
 * // Create and update a toast
 * const toastInstance = toast({ title: "Loading..." })
 * 
 * setTimeout(() => {
 *   toastInstance.update({
 *     title: "Complete",
 *     description: "Task finished successfully"
 *   })
 * }, 2000)
 * 
 * @example
 * // Create and manually dismiss
 * const toastInstance = toast({
 *   title: "Click to dismiss",
 *   duration: Infinity
 * })
 * 
 * // Later...
 * toastInstance.dismiss()
 * 
 * @public
 */
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id })

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * React hook for managing toast notifications
 * 
 * This hook provides access to the global toast state and control functions.
 * Components using this hook will re-render when the toast state changes.
 * 
 * **Subscription Pattern:**
 * - On mount: Subscribe to global state changes
 * - On state change: Component re-renders with new toast list
 * - On unmount: Unsubscribe to prevent memory leaks
 * 
 * **Return Value:**
 * Returns an object containing:
 * - `toasts`: Array of current toast objects
 * - `toast()`: Function to create new toasts
 * - `dismiss(id?)`: Function to dismiss toast(s)
 * 
 * **Usage in Components:**
 * Typically used in a Toaster component that renders the toast list,
 * but can also be used in any component that needs programmatic toast control.
 * 
 * @returns {{
 *   toasts: ToasterToast[];
 *   toast: (props: Toast) => {id: string; dismiss: () => void; update: (props: ToasterToast) => void};
 *   dismiss: (toastId?: string) => void;
 * }} Toast state and control functions
 * 
 * @example
 * // Use in Toaster component
 * function Toaster() {
 *   const { toasts } = useToast()
 *   
 *   return (
 *     <ToastProvider>
 *       {toasts.map(toast => (
 *         <Toast key={toast.id} {...toast} />
 *       ))}
 *     </ToastProvider>
 *   )
 * }
 * 
 * @example
 * // Use for programmatic control
 * function MyComponent() {
 *   const { toast } = useToast()
 *   
 *   const handleClick = () => {
 *     toast({
 *       title: "Clicked",
 *       description: "Button was clicked"
 *     })
 *   }
 *   
 *   return <button onClick={handleClick}>Show Toast</button>
 * }
 * 
 * @example
 * // Dismiss specific or all toasts
 * function Controls() {
 *   const { dismiss, toasts } = useToast()
 *   
 *   return (
 *     <>
 *       <button onClick={() => dismiss()}>Dismiss All</button>
 *       {toasts.map(t => (
 *         <button key={t.id} onClick={() => dismiss(t.id)}>
 *           Dismiss {t.id}
 *         </button>
 *       ))}
 *     </>
 *   )
 * }
 * 
 * @public
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  }
}

export { useToast, toast }
