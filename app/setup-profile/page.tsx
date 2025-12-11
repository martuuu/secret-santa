'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function SetupProfilePage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (username.length < 3) {
      toast.error('El nombre de usuario debe tener al menos 3 caracteres')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No user found')
      }

      const { error } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          username: username.trim(),
        }])

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este nombre de usuario ya está en uso')
        }
        throw error
      }

      toast.success('¡Perfil creado exitosamente!')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Error al crear perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 p-4">
      <Card className="w-full max-w-md border-red-900/20 bg-slate-900/50 backdrop-blur">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
            Configura tu Perfil
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            Elige un nombre de usuario único
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-200">Nombre de Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="tu_nombre"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                pattern="[a-zA-Z0-9_]+"
                title="Solo letras, números y guiones bajos"
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">
                Solo letras, números y guiones bajos
              </p>
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              disabled={loading}
            >
              {loading ? 'Creando perfil...' : 'Continuar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
