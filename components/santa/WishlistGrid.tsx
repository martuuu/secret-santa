'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface WishlistItem {
  id: string
  title: string
  url: string | null
  created_at: string
}

interface Props {
  items: WishlistItem[]
  isOwner: boolean
  userId: string
}

export function WishlistGrid({ items, isOwner, userId }: Props) {
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTitle.trim()) {
      toast.error('El título es requerido')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .insert([{
          user_id: userId,
          title: newTitle.trim(),
          url: newUrl.trim() || null,
        }])

      if (error) throw error

      toast.success('¡Item agregado!')
      setNewTitle('')
      setNewUrl('')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Error al agregar item')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      toast.success('Item eliminado')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar item')
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Form - Only for owner */}
      {isOwner && (
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Nombre del regalo"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-white flex-1"
              disabled={loading}
            />
            <Input
              type="url"
              placeholder="URL (opcional)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-white flex-1"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </form>
      )}

      {/* Items List */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          {isOwner ? 'Agrega tu primer item a la lista' : 'No hay items en esta lista aún'}
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id} className="border-slate-700 bg-slate-800/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-200">{item.title}</h4>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
                    >
                      Ver enlace <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
