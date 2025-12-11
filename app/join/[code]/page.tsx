'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Users } from 'lucide-react'
import { joinGroup } from '@/app/actions/join-group'
import { toast } from 'sonner'

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params) // Unwrap params correctly in Next.js 15+ convention (also works in 14)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleJoin = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await joinGroup(code)
      
      if (result.redirect) {
        // Redirigir al login preservando la intención
        router.push(`/auth/login?next=/join/${code}`)
        return
      }

      if (!result.success) {
        setError(result.error || 'Error desconocido')
        return
      }

      toast.success(result.message || '¡Te uniste al grupo exitosamente!')
      router.push(`/dashboard/group/${result.groupId}`)
    } catch (err) {
      setError('Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 p-4">
      <Card className="w-full max-w-md border-red-900/20 bg-slate-900/50 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-200">
            Invitación a Secret Santa
          </CardTitle>
          <CardDescription className="text-slate-400">
            Has sido invitado a unirte a un grupo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
             <div className="p-3 bg-red-900/50 border border-red-900/50 rounded-md text-red-200 text-sm text-center">
              {error}
            </div>
          ) : (
             <div className="text-center text-slate-400 text-sm">
                Código de invitación: <span className="font-mono text-yellow-400">{code}</span>
             </div>
          )}

          <div className="grid gap-4">
            <Button 
              onClick={handleJoin} 
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uniéndote...
                </>
              ) : (
                'Unirmse al Grupo'
              )}
            </Button>
            
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full text-slate-400">
                Volver al Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
