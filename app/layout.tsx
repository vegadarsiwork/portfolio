import './globals.css'
import type { Metadata } from 'next'
import React from 'react'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Vega Darsi — Developer & Designer',
  description:
    'Portfolio of Vega Darsi — projects, experiments, hackathons, and the things I build.',
  openGraph: {
    title: 'Vega Darsi — Developer & Designer',
    description:
      'Portfolio of Vega Darsi — projects, experiments, hackathons, and the things I build.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vega Darsi — Developer & Designer',
    description:
      'Portfolio of Vega Darsi — projects, experiments, hackathons, and the things I build.',
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icons/favicon.ico',
    apple: '/icons/apple-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Doto in its own request — combining many variable-axis fonts in one URL was causing it to not load reliably */}
        <link href="https://fonts.googleapis.com/css2?family=Doto:wght@100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&family=Geist:wght@100..900&family=DotGothic16&family=VT323&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
