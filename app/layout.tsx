import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LubriCalc | Calculadoras de mantenimiento industrial',
  description: 'Workspace técnico para cálculos de lubricación, rodamientos, hidráulica y mantenimiento industrial.',
  generator: 'LubriCalc Engineering',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#003049',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="bg-background">
      <body>{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body>
    </html>
  )
}
