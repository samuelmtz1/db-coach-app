import { useEffect } from 'react'

/** Barra espaciadora = snap, para presentar sin tocar la pantalla. Solo si el foco no está en un control. */
export function useSnapShortcut(toggle: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])
}
