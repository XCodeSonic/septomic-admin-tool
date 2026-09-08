import { useState } from 'react'
import api from '@/api/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import EPCardVisual from './EPCardVisual'
import { Sparkles } from 'lucide-react'

export default function GenerateEPModal({ open, onClose }) {
  // Auto-read userid from login session — no manual input needed
  const userId = localStorage.getItem('userNum') || ''

  const [amount, setAmount]   = useState('')
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      // admin/generate_card.php expects { ep, adminId } and returns the
      // card fields flat at the top level (no "success" or "card" wrapper) —
      // a non-2xx status is how it signals failure, caught below.
      const res = await api.post('/admin/generate_card.php', {
        ep: parseInt(amount),
        adminId: parseInt(userId),
      })
      setResult(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setAmount('')
    setResult(null)
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white border border-gray-200 shadow-xl shadow-black/[0.08] rounded-2xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 text-lg font-semibold tracking-tight">
            <Sparkles className="w-4.5 h-4.5 text-blue-500" />
            Generate EP Card
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-1">
            {/* Read-only user context */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.06em]">User ID</span>
              <span className="ml-auto text-sm font-mono text-gray-700">{userId || '—'}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.06em]">EP Amount</label>
              <Input
                className="h-10 rounded-lg bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-300 text-sm focus-visible:border-gray-400 focus-visible:ring-0"
                placeholder="e.g. 2000"
                type="number"
                min="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5 text-[13px] text-red-500">
                {error}
              </div>
            )}

            <div className="flex gap-2.5 pt-1">
              <Button
                type="submit"
                className="flex-1 h-10 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg"
                disabled={loading}
              >
                {loading ? 'Generating…' : 'Generate Card'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10 border-gray-200 text-gray-600 hover:bg-gray-50 text-sm rounded-lg"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-1">
            <div className="mb-4 rounded-lg bg-green-50 border border-green-100 px-3.5 py-2.5 text-[13px] text-green-700 font-medium">
              ✅ Card generated successfully!
            </div>
            <EPCardVisual card={result} onClose={handleClose} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}