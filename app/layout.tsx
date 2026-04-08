'use client';
import './globals.css'
import React, { useEffect, useState } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showPreloader, setShowPreloader] = useState(true)

  useEffect(() => {
    let hasFinished = false
    let revealTimeout: ReturnType<typeof setTimeout> | null = null
    let hideTimeout: ReturnType<typeof setTimeout> | null = null
    let failSafeTimeout: ReturnType<typeof setTimeout> | null = null

    const finishLoading = () => {
      if (hasFinished) {
        return
      }

      hasFinished = true
      setIsLoaded(true)
      hideTimeout = setTimeout(() => setShowPreloader(false), 360)
    }

    const onReady = () => {
      // Keep the preload state briefly to avoid a flash on fast connections.
      revealTimeout = setTimeout(finishLoading, 260)
    }

    const onReadyStateChange = () => {
      if (document.readyState === 'complete') {
        onReady()
      }
    }

    if (document.readyState === 'complete') {
      onReady()
    } else {
      window.addEventListener('load', onReady, { once: true })
      document.addEventListener('readystatechange', onReadyStateChange)
    }

    // Fail-safe so scroll is never trapped if load lifecycle behaves unexpectedly.
    failSafeTimeout = setTimeout(finishLoading, 2200)

    return () => {
      window.removeEventListener('load', onReady)
      document.removeEventListener('readystatechange', onReadyStateChange)
      if (revealTimeout) {
        clearTimeout(revealTimeout)
      }
      if (hideTimeout) {
        clearTimeout(hideTimeout)
      }
      if (failSafeTimeout) {
        clearTimeout(failSafeTimeout)
      }
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
      <body className={isLoaded ? '' : 'overflow-hidden'}>
        {showPreloader && (
          <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-300 ${isLoaded ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
          >
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"
                aria-hidden="true"
              />
              <p className="font-monoHead text-[11px] uppercase tracking-[0.16em] text-white/65">loading</p>
            </div>
          </div>
        )}
        {children}
      </body>
    </html>
  )
}
