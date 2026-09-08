import { useRef } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * EPCardVisual
 * Renders a styled EP card (canvas-based for image download).
 * Props: card = { CardId, CardPin, EPValue, StatusText, DateGenerated }
 */
const formatDate = (raw) => {
  if (!raw) return ''
  const d = new Date(raw)
  if (isNaN(d)) return raw
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function EPCardVisual({ card, onClose }) {
  const canvasRef = useRef(null)

  const downloadCard = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = 600, H = 340
    canvas.width = W
    canvas.height = H

    // --- Background gradient (dark navy/black like eGaims) ---
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#0a0a1a')
    bg.addColorStop(0.5, '#0d1530')
    bg.addColorStop(1, '#060610')
    ctx.fillStyle = bg
    ctx.roundRect(0, 0, W, H, 20)
    ctx.fill()

    // --- Decorative circle glow top-right ---
    const glow = ctx.createRadialGradient(W - 60, 60, 0, W - 60, 60, 200)
    glow.addColorStop(0, 'rgba(59,130,246,0.25)')
    glow.addColorStop(1, 'rgba(59,130,246,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)

    // --- Bottom left glow ---
    const glow2 = ctx.createRadialGradient(80, H - 60, 0, 80, H - 60, 180)
    glow2.addColorStop(0, 'rgba(99,102,241,0.2)')
    glow2.addColorStop(1, 'rgba(99,102,241,0)')
    ctx.fillStyle = glow2
    ctx.fillRect(0, 0, W, H)

    // --- Subtle grid lines ---
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    // --- Card border ---
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1.5
    ctx.roundRect(0, 0, W, H, 20)
    ctx.stroke()

    // --- Logo / Brand ---
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
    ctx.fillText('SEPTOMIC', 32, 48)

    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
    ctx.fillText('EP GAME CARD', 32, 66)

    // --- EP Value (big) ---
    const epValue = Number(card.EPValue).toLocaleString()
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
    ctx.fillText(`${epValue} EP`, 32, 160)

    // --- Divider line ---
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(32, 185); ctx.lineTo(W - 32, 185); ctx.stroke()

    // --- Card ID label ---
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
    ctx.letterSpacing = '2px'
    ctx.fillText('CARD ID', 32, 212)

    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = '15px "Courier New", monospace'
    ctx.fillText(card.CardId || '—', 32, 232)

    // --- PIN label ---
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
    ctx.fillText('PIN', 32, 262)

    ctx.fillStyle = '#60a5fa'
    ctx.font = 'bold 20px "Courier New", monospace'
    ctx.fillText(card.CardPin || '—', 32, 284)

    // --- Date ---
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
    ctx.fillText(formatDate(card.DateGenerated), 32, 314)

    // --- Status badge top-right ---
    const statusText = (card.StatusText || 'UNCLAIMED').toUpperCase()
    const isUnclaimed = card.CardStatus === 0 || card.CardStatus === '0'
    const badgeColor = isUnclaimed ? '#f59e0b' : '#10b981'
    const badgeBg    = isUnclaimed ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)'

    ctx.fillStyle = badgeBg
    ctx.roundRect(W - 140, 28, 110, 28, 14)
    ctx.fill()
    ctx.strokeStyle = badgeColor + '55'
    ctx.lineWidth = 1
    ctx.roundRect(W - 140, 28, 110, 28, 14)
    ctx.stroke()

    ctx.fillStyle = badgeColor
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(statusText, W - 84, 47)
    ctx.textAlign = 'left'

    // --- Watermark chip icon ---
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.roundRect(W - 80, H - 70, 50, 36, 6)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.roundRect(W - 80, H - 70, 50, 36, 6)
    ctx.stroke()

    // Download
    const link = document.createElement('a')
    link.download = `EP-Card-${card.CardId}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const isUnclaimed = card.CardStatus === 0 || card.CardStatus === '0'

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Visual card preview */}
      <div
        className="relative w-full max-w-[480px] rounded-2xl overflow-hidden select-none"
        style={{
          background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1530 50%, #060610 100%)',
          aspectRatio: '1.76',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      >
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        {/* Glow top-right */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        />
        {/* Glow bottom-left */}
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
        />

        <div className="relative p-6 h-full flex flex-col justify-between">
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div>
              <div className="text-white font-bold text-lg tracking-wider">SEPTOMIC</div>
              <div className="text-white/30 text-[10px] tracking-[0.15em] mt-0.5">EP GAME CARD</div>
            </div>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
              isUnclaimed
                ? 'text-amber-400 bg-amber-400/10 border-amber-400/30'
                : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
            }`}>
              {(card.StatusText || 'UNCLAIMED').toUpperCase()}
            </span>
          </div>

          {/* EP Value */}
          <div>
            <div className="text-white font-bold text-4xl tracking-tight">
              {Number(card.EPValue).toLocaleString()} EP
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/10" />

          {/* Bottom info */}
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <div>
                <div className="text-white/40 text-[9px] tracking-[0.15em] uppercase mb-0.5">Card ID</div>
                <div className="text-white/80 text-xs font-mono">{card.CardId}</div>
              </div>
              <div>
                <div className="text-white/40 text-[9px] tracking-[0.15em] uppercase mb-0.5">PIN</div>
                <div className="text-blue-400 font-bold font-mono text-sm tracking-widest">{card.CardPin}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/20 text-[9px]">{formatDate(card.DateGenerated)}</div>
              {/* Chip icon */}
              <div className="mt-2 w-10 h-7 rounded border border-white/10 bg-white/5 ml-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for image export */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Actions */}
      <div className="flex gap-3 w-full max-w-[480px]">
        <Button
          className="flex-1 bg-black hover:bg-gray-800 text-white font-medium h-11 rounded-xl"
          onClick={downloadCard}
        >
          <Download className="w-4 h-4 mr-2" /> Download Card
        </Button>
        {onClose && (
          <Button
            variant="outline"
            className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 h-11 rounded-xl"
            onClick={onClose}
          >
            Close
          </Button>
        )}
      </div>
    </div>
  )
}