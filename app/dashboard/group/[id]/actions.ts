'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Fisher-Yates shuffle algorithm
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function performDraw(groupId: string) {
  const supabase = await createClient()

  try {
    // Verify user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: group } = await supabase
      .from('groups')
      .select('admin_id, status')
      .eq('id', groupId)
      .single()

    if (!group) throw new Error('Group not found')
    if (group.admin_id !== user.id) throw new Error('Only admin can perform draw')
    if (group.status === 'drawn') throw new Error('Draw already performed')

    // Get all participants
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('user_id')
      .eq('group_id', groupId)

    if (participantsError) throw participantsError
    if (!participants || participants.length < 2) {
      throw new Error('Need at least 2 participants')
    }

    // Shuffle participants
    const shuffled = shuffle(participants)
    
    // Create circular assignments: A→B, B→C, ..., Z→A
    const matches = shuffled.map((santa, index) => {
      const nextIndex = (index + 1) % shuffled.length
      const giftee = shuffled[nextIndex]
      
      return {
        group_id: groupId,
        santa_id: santa.user_id,
        giftee_id: giftee.user_id,
      }
    })

    // Use Admin Client to bypass RLS for insertion
    const adminSupabase = await createAdminClient()

    // Insert all matches
    const { error: matchesError } = await adminSupabase
      .from('matches')
      .insert(matches)

    if (matchesError) throw matchesError

    // Update group status
    const { error: updateError } = await supabase
      .from('groups')
      .update({ status: 'drawn' })
      .eq('id', groupId)

    if (updateError) throw updateError

    revalidatePath(`/dashboard/group/${groupId}`)
    
    return { success: true }
  } catch (error: any) {
    console.error('Draw error:', error)
    return { success: false, error: error.message }
  }
}

export async function addParticipant(groupId: string, username: string) {
  const supabase = await createClient()

  try {
    // Find user by username
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (!profile) throw new Error('Usuario no encontrado')

    // Add as participant
    const { error } = await supabase
      .from('participants')
      .insert([{
        group_id: groupId,
        user_id: profile.id,
      }])

    if (error) {
      if (error.code === '23505') {
        throw new Error('Este usuario ya está en el grupo')
      }
      throw error
    }

    revalidatePath(`/dashboard/group/${groupId}`)
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
