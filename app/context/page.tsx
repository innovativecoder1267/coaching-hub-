"use client"

import { createContext, useContext, useState } from "react"

type ToastType = "success" | "error"

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (type: ToastType, message: string) => {
    const id = Date.now()

    setToasts((prev) => [...prev, { id, type, message }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`relative overflow-hidden min-w-[260px] px-5 py-3 rounded-xl text-sm font-medium shadow-lg
            animate-toast-in
            ${toast.type ==="success"
              ? "bg-green-600 shadow-green-500/30"
              : "bg-red-600 shadow-red-500/30"
            }`}
          >
            {toast.message}

            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/30 text-white animate-progress" />
          </div>
        ))}
      </div>

    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider")
  }

  return context
}