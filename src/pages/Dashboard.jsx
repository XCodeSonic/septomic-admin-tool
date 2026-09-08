import { useState, useEffect, useCallback } from 'react'
import { CreditCard, RefreshCw, ChevronLeft, ChevronRight, ChevronRight as ChevronRightSmall, Search, X } from 'lucide-react'
import api from '@/api/axios'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import PageHeader from '@/components/layout/PageHeader'
import EPCardVisual from './EPCardVisual'

const SORT_OPTIONS = [
  { value: 'generated_desc', label: 'Latest generated' },
  { value: 'generated_asc',  label: 'Oldest generated' },
  { value: 'claimed_desc',   label: 'Latest claimed' },
  { value: 'claimed_asc',    label: 'Oldest claimed' },
]

const formatDate = (raw) => {
  if (!raw) return '—'
  const d = new Date(raw)
  if (isNaN(d)) return raw
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Dashboard() {
  const [cards, setCards]               = useState([])
  const [stats, setStats]               = useState({ total: 0, unclaimed: 0, claimed: 0 })
  const [loading, setLoading]           = useState(true)
  const [page, setPage]                 = useState(1)
  const [hasMore, setHasMore]           = useState(false)
  const [filter, setFilter]             = useState(null) // null=all, 0=unclaimed, 1=claimed
  const [sort, setSort]                 = useState('generated_desc')
  const [searchInput, setSearchInput]   = useState('') // what the user is typing, updates instantly
  const [search, setSearch]             = useState('') // debounced value that actually triggers the fetch
  const [selectedCard, setSelectedCard] = useState(null)
  const limit = 20

  // Debounce: wait 400ms after the user stops typing before updating
  // `search`, which is the value fetchCards actually depends on.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit, sort })
      if (filter !== null) params.append('status', filter)
      if (search !== '') params.append('search', search)
      // admin/topup_list.php returns { success, cards, page, hasMore, stats }
      // where stats = { total, unclaimed, claimed } computed across the
      // whole table, independent of the active filter/page.
      const res = await api.get(`/admin/topup_list.php?${params}`)
      if (res.data.success) {
        setCards(res.data.cards)
        setHasMore(res.data.hasMore)
        if (res.data.stats) setStats(res.data.stats)
      }
    } catch {
      // handle silently
    } finally {
      setLoading(false)
    }
  }, [page, filter, sort, search])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchCards() }, [fetchCards])

  const handleFilter = (val) => {
    setFilter(val)
    setPage(1)
  }

  const handleSort = (val) => {
    setSort(val)
    setPage(1)
  }

  const handleCardClick = (card) => {
    setSelectedCard(card)
  }

  return (
    <div className="mx-auto max-w-6xl pb-10">
      <PageHeader
        title="Dashboard"
        description="Track and manage EP top-up cards."
      />

      <div className="space-y-6 px-4 sm:px-6 md:px-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'Total cards', value: stats.total,     color: 'text-foreground' },
            { label: 'Unclaimed',   value: stats.unclaimed, color: 'text-amber-500' },
            { label: 'Claimed',     value: stats.claimed,   color: 'text-emerald-600' },
          ].map(s => (
            <Card key={s.label} className="p-4 sm:p-6">
              <CardContent className="p-0">
                <p className="text-[11px] text-muted-foreground sm:text-[13px]">{s.label}</p>
                <p className={`mt-1 font-heading text-[20px] font-semibold tracking-tight tabular-nums sm:text-[28px] ${s.color}`}>
                  {s.value.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Card */}
        <Card className="py-0">
          <CardHeader className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:px-6">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-[14px]">
                <CreditCard className="size-[18px] text-[#0071e3]" strokeWidth={1.75} /> EP Cards
              </CardTitle>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <div className="flex flex-1 items-center gap-1 rounded-lg bg-muted p-1 sm:flex-none">
                  {[
                    { label: 'All',       val: null },
                    { label: 'Unclaimed', val: 0 },
                    { label: 'Claimed',   val: 1 },
                  ].map(f => (
                    <button
                      key={f.label}
                      className={`flex-1 rounded-md px-3 py-1 text-xs font-medium transition-all sm:flex-none ${
                        filter === f.val
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => handleFilter(f.val)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <select
                  value={sort}
                  onChange={(e) => handleSort(e.target.value)}
                  className="h-8 rounded-md border border-border bg-card px-2 text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={fetchCards}
                  disabled={loading}
                >
                  <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Search — debounced 400ms, filters by Card ID */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search card ID… e.g. ZR0CF4673"
                className="h-8 w-full rounded-md border border-border bg-card pl-8 pr-8 text-xs text-foreground shadow-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Desktop / tablet: full table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] text-muted-foreground">
                    <th className="px-6 py-3 text-left font-medium">Card ID</th>
                    <th className="px-6 py-3 text-left font-medium">PIN</th>
                    <th className="px-6 py-3 text-left font-medium">EP Value</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Date generated</th>
                    <th className="px-6 py-3 text-left font-medium">Claimed by</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-muted-foreground">
                        <RefreshCw className="mx-auto mb-2 size-5 animate-spin text-muted-foreground/50" />
                        Loading…
                      </td>
                    </tr>
                  ) : cards.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-muted-foreground">No cards found</td>
                    </tr>
                  ) : cards.map(card => {
                    const isUnclaimed = card.CardStatus === 0 || card.CardStatus === '0'
                    return (
                      <tr
                        key={card.CardId}
                        className="cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/40"
                        onClick={() => handleCardClick(card)}
                      >
                        <td className="px-6 py-3.5 font-mono text-xs text-[#0071e3]">{card.CardId}</td>
                        <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground">{card.CardPin}</td>
                        <td className="px-6 py-3.5 text-sm font-semibold tabular-nums text-emerald-600">
                          {Number(card.EPValue).toLocaleString()} EP
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                            isUnclaimed
                              ? 'border-amber-200 bg-amber-50 text-amber-700'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          }`}>
                            {card.StatusText}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-muted-foreground">{formatDate(card.DateGenerated)}</td>
                        <td className="px-6 py-3.5 text-xs text-muted-foreground">
                          {card.UserTopUp || '—'}
                          {!isUnclaimed && card.DateClaimed && (
                            <span className="mt-0.5 block text-[11px] text-muted-foreground/70">
                              {formatDate(card.DateClaimed)}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: compact tappable list — amount, status, claimed by only.
                Tap a row to see the rest (card ID, PIN, date) in the modal. */}
            <div className="divide-y divide-border/60 md:hidden">
              {loading ? (
                <div className="py-16 text-center text-muted-foreground">
                  <RefreshCw className="mx-auto mb-2 size-5 animate-spin text-muted-foreground/50" />
                  Loading…
                </div>
              ) : cards.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">No cards found</div>
              ) : cards.map(card => {
                const isUnclaimed = card.CardStatus === 0 || card.CardStatus === '0'
                return (
                  <button
                    key={card.CardId}
                    type="button"
                    onClick={() => handleCardClick(card)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors active:bg-muted/60"
                  >
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold tabular-nums text-emerald-600">
                        {Number(card.EPValue).toLocaleString()} EP
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {isUnclaimed
                          ? 'Not yet claimed'
                          : `${card.UserTopUp || 'Claimed'}${card.DateClaimed ? ` · ${formatDate(card.DateClaimed)}` : ''}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                        isUnclaimed
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}>
                        {card.StatusText}
                      </span>
                      <ChevronRightSmall className="size-4 text-muted-foreground/50" />
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border px-4 py-4 sm:px-6">
              <span className="text-xs text-muted-foreground">Page {page}</span>
              <div className="flex gap-1.5">
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasMore || loading}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card Detail / Download Modal */}
      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-[#0071e3]" />
              EP Card Details
            </DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <EPCardVisual
              card={selectedCard}
              onClose={() => setSelectedCard(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}