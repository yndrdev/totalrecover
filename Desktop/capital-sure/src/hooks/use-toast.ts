import { useCallback } from 'react'

interface ToastProps {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const toast = useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    // This is a simple toast implementation for demo purposes
    // In production, you would use a proper toast library like react-hot-toast or sonner
    const toastEl = document.createElement('div')
    toastEl.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-300 max-w-md ${
      variant === 'destructive' 
        ? 'bg-red-600 text-white' 
        : 'bg-gray-900 text-white'
    }`
    
    toastEl.innerHTML = `
      <div>
        <p class="font-medium">${title}</p>
        ${description ? `<p class="text-sm opacity-90 mt-1">${description}</p>` : ''}
      </div>
    `
    
    document.body.appendChild(toastEl)
    
    // Animate in
    setTimeout(() => {
      toastEl.style.transform = 'translateY(-20px)'
      toastEl.style.opacity = '1'
    }, 10)
    
    // Remove after 5 seconds
    setTimeout(() => {
      toastEl.style.opacity = '0'
      setTimeout(() => toastEl.remove(), 300)
    }, 5000)
  }, [])

  return { toast }
}