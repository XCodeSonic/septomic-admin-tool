import { useState, useEffect, useRef } from 'react'
import api from '@/api/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Star, Trash2, ImageOff } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'

export default function EPCardTheme() {
  const adminId = localStorage.getItem('userNum') || ''
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [orientation, setOrientation] = useState('landscape')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const loadThemes = async () => {
    try {
      const res = await api.get('/admin/list_themes.php')
      if (res.data.success) setThemes(res.data.themes)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadThemes()
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return setError('Choose a PNG file first')
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('name', name || file.name)
      form.append('orientation', orientation)
      form.append('adminId', adminId)
      await api.post('/admin/upload_theme.php', form)
      setName('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      loadThemes()
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const setDefault = async (themeId) => {
    await api.post('/admin/set_default_theme.php', { themeId })
    loadThemes()
  }

  const remove = async (themeId) => {
    if (!confirm('Delete this theme?')) return
    await api.post('/admin/delete_theme.php', { themeId })
    loadThemes()
  }

  return (
    <div className="mx-auto max-w-4xl pb-28 md:pb-10">
      <PageHeader title="EP Card Theme" description="Upload card background designs and choose a default." />

      <div className="space-y-6 px-4 sm:px-6 md:px-8">
        <Card>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Theme name</label>
                  <Input placeholder="e.g. Neon Blue" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-foreground">Orientation</label>
                  <select
                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
                    value={orientation}
                    onChange={e => setOrientation(e.target.value)}
                  >
                    <option value="landscape">Landscape (1013×638)</option>
                    <option value="portrait">Portrait (638×1013)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-foreground">PNG file</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-[13px] file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-[13px]"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-[13px] text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={uploading} className="w-full sm:w-auto">
                <Upload className="mr-1.5 size-4" /> {uploading ? 'Uploading…' : 'Upload theme'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div>
          <h3 className="mb-3 text-[13px] font-medium text-foreground">Uploaded themes</h3>
          {loading ? (
            <p className="text-[13px] text-muted-foreground">Loading…</p>
          ) : themes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-10 text-center">
              <ImageOff className="size-6 text-muted-foreground/40" />
              <p className="text-[13px] text-muted-foreground">No themes uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {themes.map(t => (
                <Card key={t.ThemeID} className="overflow-hidden">
                  <img
                    src={`http://154.7.228.161${t.FileUrl}`}
                    alt={t.ThemeName}
                    className="aspect-[1.586/1] w-full object-cover data-[orientation=portrait]:aspect-[1/1.586]"
                    data-orientation={t.Orientation}
                  />
                  <CardContent className="space-y-2 p-3">
                    <p className="truncate text-[12px] font-medium text-foreground">{t.ThemeName}</p>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant={t.IsDefault ? 'default' : 'outline'}
                        className="h-7 flex-1 text-[11px]"
                        onClick={() => setDefault(t.ThemeID)}
                      >
                        <Star className="mr-1 size-3" /> {t.IsDefault ? 'Default' : 'Set default'}
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => remove(t.ThemeID)}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}