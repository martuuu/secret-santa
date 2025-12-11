import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { Database } from '@/types/database.types'

type Group = Database['public']['Tables']['groups']['Row']
type ParticipantWithGroup = Database['public']['Tables']['participants']['Row'] & {
  groups: Group | null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/setup-profile')
  }

  // Get groups where user is admin
  const { data: adminGroups } = await supabase
    .from('groups')
    .select('*')
    .eq('admin_id', user.id)
    .order('created_at', { ascending: false })

  // Get groups where user is a participant
  const { data: participantData } = await supabase
    .from('participants')
    .select(`
      *,
      groups (*)
    `)
    .eq('user_id', user.id)
    .returns<ParticipantWithGroup[]>()

  const participantGroups = participantData?.map((p) => p.groups).filter((g): g is Group => !!g) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
              ¡Hola, {(profile as any)?.username}! 🎅
            </h1>
            <p className="text-slate-400 mt-2">Tus eventos de Secret Santa</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/profile/${user.id}`}>
              <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-950/50">
                Mi Perfil
              </Button>
            </Link>
            <Link href="/dashboard/create-group">
              <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                <Plus className="w-4 h-4 mr-2" />
                Crear Grupo
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Groups I admin */}
          {adminGroups && adminGroups.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">Grupos que administro</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {adminGroups.map((group: any) => (
                  <Link key={group.id} href={`/dashboard/group/${group.id}`}>
                    <Card className="border-red-900/20 bg-slate-900/50 backdrop-blur hover:bg-slate-900/70 transition-colors cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-red-400">{group.name}</CardTitle>
                        <CardDescription className="text-slate-500">
                          {group.status === 'drawn' ? '🎁 Sorteo realizado' : '⏳ Esperando sorteo'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-400">Admin</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Groups I'm participating in */}
          {participantGroups && participantGroups.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-200 mb-4">Mis grupos</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {participantGroups.map((group: any) => (
                  <Link key={group.id} href={`/dashboard/group/${group.id}`}>
                    <Card className="border-red-900/20 bg-slate-900/50 backdrop-blur hover:bg-slate-900/70 transition-colors cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-yellow-400">{group.name}</CardTitle>
                        <CardDescription className="text-slate-500">
                          {group.status === 'drawn' ? '🎁 Sorteo realizado' : '⏳ Esperando sorteo'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-400">Participante</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(!adminGroups || adminGroups.length === 0) && (!participantGroups || participantGroups.length === 0) && (
            <Card className="border-red-900/20 bg-slate-900/50 backdrop-blur">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-6xl mb-4">🎁</div>
                <h1 className="text-3xl font-bold text-white mb-2">Hola, {(profile as any)?.username || 'Elfo'}! 🎅</h1>
                <p className="text-slate-500 mb-6">Crea tu primer grupo de Secret Santa</p>
                <Link href="/dashboard/create-group">
                  <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Grupo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
