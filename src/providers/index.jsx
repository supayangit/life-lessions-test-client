'use client'

import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './AuthProvider'
import { QueryProvider } from './QueryProvider'
import { ThemeProvider } from './ThemeProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CommandPaletteProvider } from '@/src/components/shared/CommandPalette'

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <TooltipProvider>
        <AuthProvider>
          <CommandPaletteProvider>
          {children}
          </CommandPaletteProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '8px',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: 'oklch(0.52 0.13 195)',
                  secondary: 'white',
                },
              },
            }}
          />
        </AuthProvider>
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}

