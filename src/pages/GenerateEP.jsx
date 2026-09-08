import { useState } from 'react'
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

  const [amount, setAmount]   = useState('')
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // admin/generate_card.php expects { ep, adminId } and returns the
      // card fields flat at the top level — a non-2xx status is how it
      // signals failure, caught below.
      const res = await api.post('/admin/generate_card.php', {
        ep: parseInt(amount),
        adminId: parseInt(adminId),
      })
      setResult(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setAmount('')
    setResult(null)
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
            {!result ? (
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

                {error && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-[13px] text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading || !adminId}>
                  {loading ? 'Generating…' : 'Generate card'}
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
                  Card generated successfully.
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
