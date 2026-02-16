'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes } from 'react'

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  loadingText?: string
}

export function SubmitButton({ children, loadingText = 'Please wait...', className, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button 
      type="submit" 
      disabled={pending}
      className={className}
      {...props}
    >
      {pending ? (
        <span className="flex items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span>{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </Button>
  )
}
