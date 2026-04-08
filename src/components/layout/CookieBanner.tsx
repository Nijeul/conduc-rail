'use client'

import { useState, useEffect } from 'react'

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

const COOKIE_NAME = 'conduc-rail-cookie-consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!getCookie(COOKIE_NAME)) {
      setVisible(true)
    }
  }, [])

  function handleAccept() {
    setCookie(COOKIE_NAME, 'true', 365)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-6 py-4"
      style={{ backgroundColor: '#004489' }}
    >
      <p className="text-sm text-white max-w-3xl">
        Ce site utilise des cookies strictement necessaires au fonctionnement de
        l&apos;application (authentification). Aucun cookie publicitaire ou de suivi.{' '}
        <a
          href="/politique-confidentialite"
          className="underline text-white hover:text-white/80"
        >
          Politique de confidentialite
        </a>
      </p>
      <button
        onClick={handleAccept}
        className="shrink-0 px-5 py-2 text-sm font-medium rounded-md transition-colors"
        style={{
          backgroundColor: '#FFFFFF',
          color: '#004489',
          border: '1px solid #FFFFFF',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = '#FFFFFF'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FFFFFF'
          e.currentTarget.style.color = '#004489'
        }}
      >
        J&apos;accepte
      </button>
    </div>
  )
}
