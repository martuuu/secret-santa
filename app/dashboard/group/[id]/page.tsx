import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { GroupDetailClient } from './GroupDetailClient'
import { Database } from '@/types/database.types'

type Group = Database['public']['Tables']['groups']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type ParticipantWithProfile = Database['public']['Tables']['participants']['Row'] & {
  profiles: Profile
}
type Match = Database['public']['Tables']['matches']['Row']

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get group info
  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .returns<Group>()
    .single()

  const groupData = group as Group | null

  if (!groupData) {
    redirect('/dashboard')
  }

  const isAdmin = groupData.admin_id === user.id

  // Get all participants with their profiles
  const { data: participants } = await supabase
    .from('participants')
    .select(`
      *,
      profiles (*)
    `)
    .eq('group_id', id)
    .returns<ParticipantWithProfile[]>()

  // Get my match if it exists
   const { data: myMatch } = await supabase
    .from('matches')
    .select(`
      *,
      giftee:profiles!matches_giftee_id_fkey(*)
    `)
    .eq('group_id', id)
    .eq('santa_id', user.id)
    .single()

  // Check if I'm a participant
  const isParticipant = participants?.some((p) => p.user_id === user.id) ?? false
  
  // Find my participant data for lives
  const myParticipant = participants?.find((p) => p.user_id === user.id)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GroupDetailClient 
        group={groupData}
        participants={participants || []}
        myMatch={myMatch as any} // Complex join type, keep any or type properly if possible, but group/participants are main blockers
        isAdmin={isAdmin}
        isParticipant={isParticipant}
        currentUserId={user.id}
        myLives={myParticipant?.lives ?? 3}
      />
    </Suspense>
  )
}
