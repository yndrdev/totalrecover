'use client'

import { DemoAuthProvider } from '@/components/auth/demo-auth-provider'

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DemoAuthProvider>
      {children}
    </DemoAuthProvider>
  )
}
