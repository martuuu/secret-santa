import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient'
import { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type WishlistItem = Database['public']['Tables']['wishlist_items']['Row']

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) {
    return <div>Profile not found</div>
  }

  const isOwner = user.id === id

  // Get wishlist items
  const { data: wishlistItems } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  return (
    <ProfileClient
      profile={profile}
      wishlistItems={wishlistItems || []}
      isOwner={isOwner}
      currentUserId={user.id}
    />
  )
}
