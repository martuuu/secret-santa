import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { GroupDetailClient } from './GroupDetailClient'

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
    .single()

  if (!group) {
    redirect('/dashboard')
  }

  const isAdmin = group.admin_id === user.id

  // Get all participants with their profiles
  const { data: participants } = await supabase
    .from('participants')
    .select(`
      id,
      lives,
      user_id,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .eq('group_id', id)

  // Get my match if draw has been done (this will only return if I'm the santa)
  const { data: myMatch } = await supabase
    .from('matches')
    .select(`
      giftee_id,
      profiles:giftee_id (
        id,
        username,
        avatar_url
      )
    `)
    .eq('group_id', id)
    .eq('santa_id', user.id)
    .single()

  // Check if I'm a participant
  const isParticipant = participants?.some(p => p.user_id === user.id)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GroupDetailClient 
        group={group}
        participants={participants || []}
        myMatch={myMatch}
        isAdmin={isAdmin}
        isParticipant={isParticipant}
        currentUserId={user.id}
      />
    </Suspense>
  )
}
