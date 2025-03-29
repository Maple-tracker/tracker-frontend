"use client"

import { useEffect, useRef } from "react"

export function StarsBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerWidth = container.offsetWidth
    const containerHeight = container.offsetHeight

    // Clear any existing stars
    container.innerHTML = ""

    // Create stars
    const starCount = Math.floor((containerWidth * containerHeight) / 5000) // Adjust density

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div")
      star.className = "star"

      // Random position
      const left = Math.random() * 100
      const top = Math.random() * 100

      // Random size (smaller stars are more common)
      const size = Math.random() < 0.8 ? Math.random() * 2 + 1 : Math.random() * 3 + 2

      star.style.left = `${left}%`
      star.style.top = `${top}%`
      star.style.width = `${size}px`
      star.style.height = `${size}px`

      // Add twinkling animation to some stars
      if (Math.random() < 0.3) {
        if (Math.random() < 0.33) {
          star.classList.add("twinkle")
        } else if (Math.random() < 0.5) {
          star.classList.add("twinkle-delayed")
        } else {
          star.classList.add("twinkle-slow")
        }
      }

      container.appendChild(star)
    }
  }, [])

  return <div ref={containerRef} className="stars-container" />
}

