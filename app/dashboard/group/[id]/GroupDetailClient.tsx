'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { performDraw, addParticipant } from './actions'
import { GifteeRevealCard } from '@/components/santa/GifteeRevealCard'
import { InviteLink } from '@/components/santa/InviteLink'
import { Sparkles, UserPlus, Users } from 'lucide-react'

interface Props {
  group: any
  participants: any[]
  myMatch: any
  isAdmin: boolean
  isParticipant: boolean
  currentUserId: string
  myLives: number
}

export function GroupDetailClient({ 
  group, 
  participants, 
  myMatch, 
  isAdmin, 
  isParticipant, 
  currentUserId,
  myLives
}: Props) {
  const [loading, setLoading] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const router = useRouter()

  const handleDraw = async () => {
    setLoading(true)
    const result = await performDraw(group.id)
    
    if (result.success) {
      toast.success('¡Sorteo realizado exitosamente! 🎉')
      router.refresh()
    } else {
      toast.error(result.error || 'Error al realizar el sorteo')
    }
    setLoading(false)
  }

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await addParticipant(group.id, newUsername)
    
    if (result.success) {
      toast.success('Participante agregado')
      setNewUsername('')
      router.refresh()
    } else {
      toast.error(result.error || 'Error al agregar participante')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-6 border-red-500/50 text-red-400 hover:bg-red-950/50">
            ← Volver al Dashboard
          </Button>
        </Link>

        <div className="space-y-6">
          {/* Group Header */}
          <Card className="border-red-900/20 bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
                    {group.name}
                  </CardTitle>
                  <CardDescription className="text-slate-400 mt-2">
                    {group.status === 'drawn' ? '🎁 Sorteo realizado' : '⏳ Esperando sorteo'}
                  </CardDescription>
                </div>
                {isAdmin && (
                  <span className="px-3 py-1 rounded-full bg-red-900/30 text-red-400 text-sm font-medium">
                    Admin
                  </span>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* My Giftee (if drawn and I'm participant) */}
          {group.status === 'drawn' && isParticipant && (
            <GifteeRevealCard giftee={myMatch?.profiles} />
          )}

          {/* Waiting State */}
          {group.status === 'open' && isParticipant && !isAdmin && (
            <Card className="border-yellow-900/20 bg-slate-900/50 backdrop-blur">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-6xl mb-4">⏳</div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">Esperando el sorteo</h3>
                <p className="text-slate-500">El administrador iniciará el sorteo pronto</p>
              </CardContent>
            </Card>
          )}

          {/* Participants List */}
          <Card className="border-red-900/20 bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Users className="w-5 h-5" />
                Participantes ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {participants.map((participant: any) => (
                <div 
                  key={participant.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <Avatar>
                    <AvatarFallback className="bg-red-900/30 text-red-400">
                      {participant.profiles?.username?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-slate-200">
                      {participant.profiles?.username || 'Unknown'}
                    </p>
                    {group.status === 'drawn' && (
                      <p className="text-sm text-slate-500">
                        ❤️ {participant.lives} vidas
                      </p>
                    )}
                  </div>
                  {participant.user_id === currentUserId && (
                    <span className="text-xs text-yellow-400">Tú</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          {isAdmin && (
            <Card className="border-red-900/20 bg-slate-900/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-red-400">Acciones de Admin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Participant */}
                <form onSubmit={handleAddParticipant} className="space-y-3">
                  <Label htmlFor="username" className="text-slate-200">
                    Agregar Participante
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="username"
                      type="text"
                      placeholder="Nombre de usuario"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white"
                      disabled={loading}
                    />
                    <Button 
                      type="submit"
                      disabled={loading || !newUsername.trim()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </form>

                {/* Perform Draw */}
                {group.status === 'open' && participants.length >= 2 && (
                  <Button
                    onClick={handleDraw}
                    disabled={loading || participants.length < 2}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {loading ? 'Realizando sorteo...' : 'Realizar Sorteo'}
                </Button>
                )}
                
                {/* Invite Link System */}
                {group.status === 'open' && (
                  <InviteLink code={group.invite_code} />
                )}

                {participants.length < 2 && group.status === 'open' && (
                  <p className="text-sm text-slate-500 text-center">
                    Se necesitan al menos 2 participantes para el sorteo
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
