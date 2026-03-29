interface Star {
  x: number
  y: number
  size: number
  opacity: number
  opacityDelta: number
  vx: number
  vy: number
}

interface Nebula {
  x: number
  y: number
  radius: number
  color: string
  opacity: number
  opacityDelta: number
  scaleDelta: number
  scale: number
}

export class StarField {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private stars: Star[] = []
  private nebulae: Nebula[] = []
  private rafId = 0
  private width = 0
  private height = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.canvas.style.position = 'fixed'
    this.canvas.style.inset = '0'
    this.canvas.style.pointerEvents = 'none'
    this.canvas.style.zIndex = '0'
    this.resize()
    this.init()
    this.loop()

    this._resizeHandler = this._resizeHandler.bind(this)
    window.addEventListener('resize', this._resizeHandler)
  }

  private _resizeHandler() {
    this.resize()
    this.init()
  }

  private resize() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.canvas.width = this.width
    this.canvas.height = this.height
  }

  private rnd(min: number, max: number) {
    return min + Math.random() * (max - min)
  }

  private init() {
    this.stars = []
    for (let i = 0; i < 300; i++) {
      this.stars.push({
        x: this.rnd(0, this.width),
        y: this.rnd(0, this.height),
        size: this.rnd(0.5, 2),
        opacity: this.rnd(0.2, 0.9),
        opacityDelta: this.rnd(0.002, 0.006) * (Math.random() > 0.5 ? 1 : -1),
        vx: this.rnd(-0.02, 0.02),
        vy: this.rnd(-0.02, 0.02),
      })
    }

    const nebulaColors = ['rgba(45, 27, 105,', 'rgba(13, 79, 110,']
    this.nebulae = []
    const count = Math.floor(this.rnd(3, 7))
    for (let i = 0; i < count; i++) {
      this.nebulae.push({
        x: this.rnd(0, this.width),
        y: this.rnd(0, this.height),
        radius: this.rnd(200, 500),
        color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
        opacity: this.rnd(0.03, 0.06),
        opacityDelta: this.rnd(0.0002, 0.0006) * (Math.random() > 0.5 ? 1 : -1),
        scale: 1,
        scaleDelta: this.rnd(0.0001, 0.0004) * (Math.random() > 0.5 ? 1 : -1),
      })
    }
  }

  private loop() {
    this.rafId = requestAnimationFrame(() => this.loop())
    this.draw()
  }

  private draw() {
    const { ctx, width, height } = this
    ctx.clearRect(0, 0, width, height)

    // Draw nebulae
    for (const n of this.nebulae) {
      n.opacity += n.opacityDelta
      if (n.opacity < 0.02 || n.opacity > 0.07) n.opacityDelta *= -1
      n.scale += n.scaleDelta
      if (n.scale < 0.9 || n.scale > 1.1) n.scaleDelta *= -1

      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * n.scale)
      grad.addColorStop(0, `${n.color} ${n.opacity})`)
      grad.addColorStop(1, `${n.color} 0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.radius * n.scale, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw stars
    for (const s of this.stars) {
      s.opacity += s.opacityDelta
      if (s.opacity < 0.1 || s.opacity > 1) s.opacityDelta *= -1
      s.x += s.vx
      s.y += s.vy
      if (s.x < 0) s.x = width
      if (s.x > width) s.x = 0
      if (s.y < 0) s.y = height
      if (s.y > height) s.y = 0

      ctx.globalAlpha = s.opacity
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size / 2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  destroy() {
    cancelAnimationFrame(this.rafId)
    window.removeEventListener('resize', this._resizeHandler)
  }
}
