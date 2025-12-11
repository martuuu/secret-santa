'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import Link from 'next/link'
import { Database } from '@/types/database.types'

type Group = Database['public']['Tables']['groups']['Row']

export default function CreateGroupPage() {
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (groupName.trim().length < 3) {
      toast.error('El nombre del grupo debe tener al menos 3 caracteres')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No user found')
      }

      const { data: group, error } = await (supabase
        .from('groups') as any)
        .insert([{
          name: groupName.trim(),
          admin_id: user.id,
          invite_code: nanoid(10) // Generate 10-char safe ID
        }])
        .select()
        .single() // returns() removed, we'll trust any casted result

      if (error) throw error

      toast.success('¡Grupo creado exitosamente!')
      if (group) {
        router.push(`/dashboard/group/${group.id}`)
      }
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el grupo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 p-4">
      <div className="max-w-md mx-auto pt-20">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-6 border-red-500/50 text-red-400 hover:bg-red-950/50">
            ← Volver
          </Button>
        </Link>
        
        <Card className="border-red-900/20 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
              Crear Nuevo Grupo
            </CardTitle>
            <CardDescription className="text-slate-400">
              Organiza un nuevo intercambio de regalos
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName" className="text-slate-200">
                  Nombre del Grupo
                </Label>
                <Input
                  id="groupName"
                  type="text"
                  placeholder="Ej: Secret Santa Familia 2024"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                  minLength={3}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </CardContent>
            <div className="px-6 pb-6">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Grupo'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
