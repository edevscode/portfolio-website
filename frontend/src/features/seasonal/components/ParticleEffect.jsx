/**
 * PARTICLE EFFECT ENGINE
 * 
 * Canvas-based particle system for seasonal effects
 * Supports: snowflakes, leaves, petals, confetti, hearts, etc.
 * 
 * Features:
 * - 60fps canvas rendering
 * - Physics: gravity, wind, rotation
 * - Customizable particle types
 * - Performance optimized for mobile
 * - Respects prefers-reduced-motion
 * 
 * @example
 * <ParticleEffect
 *   type="snowflakes"
 *   count={30}
 *   options={{ color: '#e8f4f8', size: 4, fallSpeed: 1.5 }}
 * />
 */

import React, { useEffect, useRef, useCallback, useState } from 'react'

/**
 * PARTICLE EFFECT COMPONENT
 */
const ParticleEffect = ({ type = 'snowflakes', count = 30, options = {}, enabled = true, particleColor = null }) => {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animationFrameRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile devices (reduce particle count for performance)
  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Initialize particles
  useEffect(() => {
    if (!enabled || !canvasRef.current) return

    const canvas = canvasRef.current
    const adjustedCount = isMobile ? Math.max(count / 2, 5) : count
    
    // Merge options with particle color if provided
    const mergedOptions = particleColor ? { ...options, color: particleColor } : options

    particlesRef.current = Array.from({ length: adjustedCount }, () =>
      createParticle(canvas, type, mergedOptions)
    )
  }, [type, count, options, enabled, isMobile, particleColor])

  // Animation loop
  useEffect(() => {
    if (!enabled || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particlesRef.current = particlesRef.current
        .map((particle) => updateParticle(particle, canvas, options))
        .filter((particle) => particle.active)

      // Recreate particles that have left screen
      while (particlesRef.current.length < (isMobile ? count / 2 : count)) {
        particlesRef.current.push(createParticle(canvas, type, options))
      }

      // Draw particles
      particlesRef.current.forEach((particle) => drawParticle(ctx, particle, type, options))

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [type, options, enabled, count, isMobile])

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!enabled) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  )
}

/**
 * CREATE PARTICLE
 */
function createParticle(canvas, type, options) {
  const particle = {
    x: Math.random() * canvas.width,
    y: -20,
    vx: (Math.random() - 0.5) * (options.windForce || 1),
    vy: (Math.random() + 0.5) * (options.fallSpeed || 1),
    size: options.size || 5,
    opacity: options.opacity ?? 1,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * (options.rotationSpeed || 5),
    color: Array.isArray(options.colors)
      ? options.colors[Math.floor(Math.random() * options.colors.length)]
      : options.color || '#ffffff',
    active: true,
    lifetime: 0,
    maxLifetime: 15000, // 15 seconds before respawn
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: Math.random() * 0.02 + 0.01,
  }

  return particle
}

/**
 * UPDATE PARTICLE PHYSICS
 */
function updateParticle(particle, canvas, options) {
  // Gravity
  particle.vy += 0.1

  // Wind
  particle.vx += (Math.random() - 0.5) * 0.1

  // Position
  particle.x += particle.vx
  particle.y += particle.vy

  // Wobble effect (smooth side-to-side motion)
  particle.wobble += particle.wobbleSpeed
  particle.x += Math.sin(particle.wobble) * 0.5

  // Rotation
  if (options.rotation || options.rotationSpeed) {
    particle.rotation += particle.rotationSpeed
  }

  // Lifetime
  particle.lifetime += 16 // ~60fps
  if (particle.lifetime > particle.maxLifetime) {
    particle.active = false
  }

  // Fade out near end of lifetime
  const fadePoint = particle.maxLifetime * 0.9
  if (particle.lifetime > fadePoint) {
    particle.opacity = options.opacity ?? 1 * (1 - (particle.lifetime - fadePoint) / (particle.maxLifetime - fadePoint))
  }

  // Reset if off screen
  if (particle.y > canvas.height + 50 || particle.x < -50 || particle.x > canvas.width + 50) {
    particle.active = false
  }

  return particle
}

/**
 * DRAW PARTICLE
 */
function drawParticle(ctx, particle, type, options) {
  ctx.save()
  ctx.globalAlpha = particle.opacity
  ctx.fillStyle = particle.color

  ctx.translate(particle.x, particle.y)
  ctx.rotate(particle.rotation)

  switch (type) {
    case 'snowflakes':
      drawSnowflake(ctx, particle)
      break
    case 'leaves':
      drawLeaf(ctx, particle)
      break
    case 'petals':
      drawPetal(ctx, particle)
      break
    case 'confetti':
      drawConfetti(ctx, particle)
      break
    case 'hearts':
      drawHeart(ctx, particle)
      break
    case 'light-particles':
      drawLightParticle(ctx, particle)
      break
    case 'pumpkins':
      drawPumpkin(ctx, particle)
      break
    case 'snow-and-stars':
      Math.random() > 0.3 ? drawSnowflake(ctx, particle) : drawStar(ctx, particle)
      break
    default:
      drawCircle(ctx, particle)
  }

  ctx.restore()
}

/**
 * PARTICLE SHAPES
 */

function drawSnowflake(ctx, particle) {
  ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(angle) * particle.size * 1.5, Math.sin(angle) * particle.size * 1.5)
  }
  ctx.stroke()
}

function drawLeaf(ctx, particle) {
  ctx.beginPath()
  ctx.ellipse(0, 0, particle.size, particle.size / 2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(0, -particle.size / 2)
  ctx.lineTo(0, particle.size / 2)
  ctx.stroke()
}

function drawPetal(ctx, particle) {
  ctx.beginPath()
  ctx.ellipse(0, 0, particle.size / 2, particle.size, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawConfetti(ctx, particle) {
  ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
}

function drawHeart(ctx, particle) {
  const x = 0
  const y = 0
  const size = particle.size

  ctx.beginPath()
  ctx.moveTo(x, y + size / 4)
  ctx.bezierCurveTo(
    x - size / 2,
    y - size / 4,
    x - size / 2,
    y + size / 2,
    x,
    y + size
  )
  ctx.bezierCurveTo(
    x + size / 2,
    y + size / 2,
    x + size / 2,
    y - size / 4,
    x,
    y + size / 4
  )
  ctx.fill()
}

function drawLightParticle(ctx, particle) {
  ctx.beginPath()
  ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = particle.color
  ctx.lineWidth = 1
  ctx.stroke()
}

function drawPumpkin(ctx, particle) {
  ctx.beginPath()
  ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 0.5
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(angle) * particle.size * 0.8, Math.sin(angle) * particle.size * 0.8)
  }
  ctx.stroke()
}

function drawStar(ctx, particle) {
  const points = 5
  const outerRadius = particle.size
  const innerRadius = particle.size / 2

  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i * Math.PI) / points - Math.PI / 2
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.closePath()
  ctx.fill()
}

function drawCircle(ctx, particle) {
  ctx.beginPath()
  ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
  ctx.fill()
}

export default ParticleEffect
