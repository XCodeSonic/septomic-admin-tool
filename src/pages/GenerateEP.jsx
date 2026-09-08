import { useState, useEffect } from 'react'
import api from '@/api/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Sparkles, CreditCard, RotateCcw } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import EPCardVisual from './EPCardVisual'

export default function GenerateEP() {
  // Auto-read admin id from login session (decoded from the JWT at login) —
  // no manual input needed, and it's what admin/generate_card.php expects.
  const adminId = localStorage.getItem('userNum') || ''

  const [amount, setAmount]     = useState('')
  const [quantity, setQuantity] = useState('1')
  const [themes, setThemes]     = useState([])
  const [themeId, setThemeId]   = useState('')
  const [result, setResult]     = useState(null)   // single card
  const [batch, setBatch]       = useState(null)   // array of cards
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    api.get('/admin/list_themes.php').then(res => {
      if (res.data.success) {
        setThemes(res.data.themes)
        const def = res.data.themes.find(t => t.IsDefault)
        if (def) setThemeId(String(def.ThemeID))
      }
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const qty = parseInt(quantity) || 1
    try {
      if (qty > 1) {
        // Bulk: same theme, same amount, unique CardId/PIN per card
        const res = await api.post('/admin/generate_card_batch.php', {
          ep: parseInt(amount),
          adminId: parseInt(adminId),
          themeId: themeId ? parseInt(themeId) : null,
          quantity: qty,
        })
        setBatch(res.data.cards || [])
        setResult(null)
      } else {
        const res = await api.post('/admin/generate_card.php', {
          ep: parseInt(amount),
          adminId: parseInt(adminId),
          themeId: themeId ? parseInt(themeId) : null,
        })
        setResult(res.data)
        setBatch(null)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setAmount('')
    setQuantity('1')
    setResult(null)
    setBatch(null)
    setError('')
  }

  return (
    <div className="mx-auto max-w-6xl pb-10">
      <PageHeader title="Generate EP" description="Create a new top-up card for a player." />

      <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 md:px-8 lg:grid-cols-[380px_1fr]">
        {/* Form */}
        <Card className="h-fit">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2 text-[14px]">
              <Sparkles className="size-[18px] text-[#0071e3]" strokeWidth={1.75} />
              Card details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result && !batch ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3.5 py-2.5">
                  <span className="text-[11px] font-medium text-muted-foreground">Admin ID</span>
                  <span className="font-mono text-sm text-foreground">{adminId || '—'}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">EP amount</label>
                  <Input
                    placeholder="e.g. 2000"
                    type="number"
                    min="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">EP card theme</label>
                  <select
                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
                    value={themeId}
                    onChange={e => setThemeId(e.target.value)}
                  >
                    <option value="">Default theme</option>
                    {themes.map(t => (
                      <option key={t.ThemeID} value={t.ThemeID}>
                        {t.ThemeName}{t.IsDefault ? ' (default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Quantity (batch generate)</label>
                  <Input
                    placeholder="1"
                    type="number"
                    min="1"
                    max="500"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Generates this many cards with the same amount &amp; theme — each gets a unique Card ID and PIN.
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-[13px] text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading || !adminId}>
                  {loading ? 'Generating…' : (parseInt(quantity) > 1 ? `Generate ${quantity} cards` : 'Generate card')}
                </Button>

                {!adminId && (
                  <p className="text-center text-[12px] text-muted-foreground">
                    No admin ID found on this session — try logging in again.
                  </p>
                )}
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[13px] font-medium text-emerald-700">
                  {batch ? `${batch.length} cards generated successfully.` : 'Card generated successfully.'}
                </div>
                <Button variant="outline" className="w-full" onClick={reset}>
                  <RotateCcw className="mr-1.5 size-3.5" /> Generate another
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live preview */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-6 sm:p-10">
          {result ? (
            <EPCardVisual card={result} />
          ) : batch ? (
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
              {batch.map((c, i) => <EPCardVisual key={i} card={c} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <CreditCard className="size-8 text-muted-foreground/40" strokeWidth={1.5} />
              <p className="max-w-[220px] text-[13px] text-muted-foreground">
                Fill in an amount and generate a card to see it here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
