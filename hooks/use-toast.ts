"use client"

// Inspired by react-hot-toast library
import * as React from "react"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 1000

export interface ToastItem {
  id: string
  type: "success" | "error" | "info"
  message: string
  duration?: number
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToastItem
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToastItem>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToastItem["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToastItem["id"]
    }

interface State {
  toasts: ToastItem[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

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
            ? { ...t }
            : t
        ),
      }
    }
    
    case "REMOVE_TOAST":
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

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToastItem, "id">

function toast({ type, message, duration = 3000 }: Toast) {
  const id = genId()

  const update = (props: Partial<ToastItem>) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      id,
      type,
      message,
      duration,
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

// 添加便捷方法
const showSuccess = (message: string, duration?: number) => {
  return toast({ type: "success", message, duration })
}

const showError = (message: string, duration?: number) => {
  return toast({ type: "error", message, duration })
}

const showInfo = (message: string, duration?: number) => {
  return toast({ type: "info", message, duration })
}

const clearAll = () => {
  dispatch({ type: "REMOVE_TOAST" })
}

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
  }, [])

  // 便捷方法，保持与第二个实现的 API 兼容
  const addToast = React.useCallback((type: "success" | "error" | "info", message: string, duration = 3000) => {
    return toast({ type, message, duration })
  }, [])

  const removeToast = React.useCallback((id: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId: id })
  }, [])

  return {
    // 状态
    toasts: state.toasts,
    
    // 原始方法
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    
    // 便捷方法（兼容第二个实现的 API）
    addToast,
    removeToast,
    showSuccess: React.useCallback((message: string, duration?: number) => {
      return showSuccess(message, duration)
    }, []),
    showError: React.useCallback((message: string, duration?: number) => {
      return showError(message, duration)
    }, []),
    showInfo: React.useCallback((message: string, duration?: number) => {
      return showInfo(message, duration)
    }, []),
    clearAll: React.useCallback(() => {
      clearAll()
    }, []),
  }
}

// 导出便捷方法，可以在组件外直接使用
export { useToast, toast, showSuccess, showError, showInfo, clearAll }