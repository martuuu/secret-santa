'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { QRScanner } from '@/components/santa/QRScanner'
import { attemptGuess } from '@/app/actions/guess-santa'
import { toast } from 'sonner'
import { ArrowLeft, Trophy, XCircle } from 'lucide-react'
import Confetti from 'react-confetti'
import { useWindowSize } from '@/lib/hooks/useWindowSize'
import { createClient } from '@/lib/supabase/client'

export default function ScanPage() {
  const searchParams = useSearchParams()
  const suspectId = searchParams.get('suspect')
  const [groupId, setGroupId] = useState('')
  const [groups, setGroups] = useState<any[]>([])
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<'win' | 'lose' | null>(null)
  const router = useRouter()
  const { width, height } = useWindowSize()
  const supabase = createClient()

  useEffect(() => {
    // Fetch user's groups
    async function fetchGroups() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: participantData } = await supabase
        .from('participants')
        .select(`
          group_id,
          groups (
            id,
            name,
            status
          )
        `)
        .eq('user_id', user.id)

      const groupsList = participantData?.map(p => p.groups).filter(g => g?.status === 'drawn') || []
      setGroups(groupsList as any[])
      
      if (groupsList.length === 1) {
        setGroupId(groupsList[0]?.id || '')
      }
    }

    fetchGroups()
  }, [])

  const handleScan = async (data: string) => {
    if (!groupId || !suspectId) {
      toast.error('Selecciona un grupo primero')
      return
    }

    try {
      const scanned = JSON.parse(data)
      
      if (scanned.userId !== suspectId) {
        toast.error('Este QR no corresponde a la persona sospechosa')
        return
      }

      setScanning(false)

      const result = await attemptGuess(groupId, suspectId, scanned.qrToken)

      if (!result.success) {
        toast.error(result.error || 'Error al verificar')
        return
      }

      if (result.isCorrect) {
        setResult('win')
        toast.success('¡Correcto! 🎉')
      } else {
        setResult('lose')
        toast.error('¡Incorrecto! Perdiste una vida ❤️')
      }
    } catch (error) {
      toast.error('QR inválido')
    }
  }

  if (result === 'win') {
    return (
      <>
        <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-green-900/20 bg-slate-900/50 backdrop-blur">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Trophy className="w-24 h-24 text-yellow-400 mb-6" />
              <h2 className="text-3xl font-bold text-yellow-400 mb-4">¡Ganaste!</h2>
              <p className="text-slate-300 text-center mb-8">
                ¡Adivinaste correctamente quién es tu Secret Santa!
              </p>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                  Volver al Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (result === 'lose') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-900/20 bg-slate-900/50 backdrop-blur">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <XCircle className="w-24 h-24 text-red-400 mb-6" />
            <h2 className="text-3xl font-bold text-red-400 mb-4">¡Incorrecto!</h2>
            <p className="text-slate-300 text-center mb-8">
              Esta persona no es tu Secret Santa. Perdiste una vida.
            </p>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                Volver al Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-6 border-red-500/50 text-red-400 hover:bg-red-950/50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </Link>

        <Card className="border-red-900/20 bg-slate-900/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
              Escanear QR
            </CardTitle>
            <CardDescription className="text-slate-400">
              Escanea el código QR del sospechoso para verificar si es tu Santa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Group Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">
                Selecciona el grupo
              </label>
              <Select value={groupId} onValueChange={setGroupId}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Elige un grupo" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scanner */}
            {groupId && !scanning && (
              <Button
                onClick={() => setScanning(true)}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800"
                size="lg"
              >
                Iniciar Escaneo
              </Button>
            )}

            {scanning && (
              <div className="space-y-4">
                <QRScanner onScan={handleScan} onError={(err) => toast.error(err)} />
                <Button
                  onClick={() => setScanning(false)}
                  variant="outline"
                  className="w-full border-red-500/50 text-red-400"
                >
                  Cancelar Escaneo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
