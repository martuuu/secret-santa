'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Database } from '@/types/database.types'

type Group = Database['public']['Tables']['groups']['Row']

export async function joinGroup(inviteCode: string) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // If not logged in, redirect with return url
      // Ideally we handle this in the client component, but here's a safety net
      return { success: false, error: 'Not authenticated', redirect: true }
    }

    // 1. Find group by code
    const { data: group } = await supabase
      .from('groups')
      .select('*')
      .eq('invite_code', inviteCode.trim())
      .returns<Group>()
      .single()

    const groupData = group as Group | null

    if (!groupData) return { success: false, error: 'Código de invitación inválido' }

    // 2. Check if already joined (or drawn)
    if (groupData.status === 'drawn') {
      return { success: false, error: 'El sorteo ya se ha realizado en este grupo' }
    }

    // 2. Check if already joined
    const { data: existingMember } = await supabase
      .from('participants')
      .select('user_id')
      .eq('group_id', groupData.id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return { success: true, groupId: groupData.id, message: 'Ya eres miembro de este grupo' }
    }

    const { error: insertError } = await (supabase
      .from('participants') as any)
      .insert([{
        group_id: groupData.id,
        user_id: user.id
      }])

    if (insertError) throw insertError

    revalidatePath(`/dashboard/group/${groupData.id}`)
    
    return { success: true, groupId: groupData.id }
  } catch (error: any) {
    console.error('Join error:', error)
    return { success: false, error: error.message || 'Error al unirse al grupo' }
  }
}
