import './globals.css'
import type { Metadata } from 'next'
import React from 'react'
import Providers from './providers'
import { Analytics } from '@vercel/analytics/next'

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
        <Analytics />
      </body>
    </html>
  )
}
