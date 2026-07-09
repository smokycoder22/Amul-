import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
