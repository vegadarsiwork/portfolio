'use client';
import './globals.css'
import React, { useEffect } from 'react'
import Lenis from 'lenis'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // "Heavy" usually means too much smoothing. 
    // We'll increase lerp (0.1 -> 0.15) or use duration to make it snappier.
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Default easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* Doto in its own request — combining many variable-axis fonts in one URL was causing it to not load reliably */}
        <link href="https://fonts.googleapis.com/css2?family=Doto:wght@100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&family=Bitcount+Prop+Single:wght@100..900&family=Geist:wght@100..900&family=DotGothic16&family=VT323&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
