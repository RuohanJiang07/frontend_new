import React from 'react'
import { Toast } from './toast'
import { useToast, ToastMessage } from '../../hooks/useToast'
import { X } from 'lucide-react'
import { Button } from './button'

interface ToastContainerProps {
  toasts: ToastMessage[]
  removeToast: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant} className="relative">
          <div className="flex items-start justify-between">
            <p className="font-['Inter',Helvetica] text-sm font-medium pr-8">
              {toast.message}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-black/10"
              onClick={() => removeToast(toast.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Toast>
      ))}
    </div>
  )
}