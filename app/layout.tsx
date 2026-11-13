import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "AMUL GCMMF Pune",
  description: "Digital Pricing Platform",

  icons: {
    icon: "/amul-logo-taste-of-india.png",
    shortcut: "/amul-logo-taste-of-india.png",
    apple: "/amul-logo-taste-of-india.png",
  }
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#E63946',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
