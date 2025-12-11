'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function attemptGuess(groupId: string, suspectId: string, scannedQrToken: string) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Verify the scanned QR token matches the suspect's token
    const { data: suspectProfile } = await supabase
      .from('profiles')
      .select('qr_token')
      .eq('id', suspectId)
      .single()

    if (!suspectProfile || suspectProfile.qr_token !== scannedQrToken) {
      throw new Error('Invalid QR code')
    }

    // Call the RPC function to check if suspect is truly my Santa
    const { data: isCorrect, error: rpcError } = await supabase
      .rpc('attempt_guess', {
        group_id_input: groupId,
        suspect_id: suspectId
      })

    if (rpcError) throw rpcError

    // Update my lives
    if (!isCorrect) {
      const { data: participant } = await supabase
        .from('participants')
        .select('lives')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

      if (participant && participant.lives > 0) {
        await supabase
          .from('participants')
          .update({ lives: participant.lives - 1 })
          .eq('group_id', groupId)
          .eq('user_id', user.id)
      }
    }

    revalidatePath(`/dashboard/group/${groupId}`)
    
    return { 
      success: true, 
      isCorrect: isCorrect as boolean 
    }
  } catch (error: any) {
    console.error('Guess error:', error)
    return { 
      success: false, 
      error: error.message,
      isCorrect: false
    }
  }
}
