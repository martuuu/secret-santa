'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { QRDisplay } from '@/components/santa/QRDisplay'
import { WishlistGrid } from '@/components/santa/WishlistGrid'
import { ArrowLeft, Camera } from 'lucide-react'

interface Props {
  profile: any
  wishlistItems: any[]
  isOwner: boolean
  currentUserId: string
}

export function ProfileClient({ profile, wishlistItems, isOwner, currentUserId }: Props) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-6 border-red-500/50 text-red-400 hover:bg-red-950/50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="border-red-900/20 bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-2 border-red-500">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-red-500 to-yellow-500 text-white">
                    {profile.username[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
                    {profile.username}
                  </CardTitle>
                  {isOwner && (
                    <p className="text-slate-500 text-sm mt-1">Tu perfil</p>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* QR Code - Only visible to owner */}
          {isOwner && (
            <Card className="border-yellow-900/20 bg-gradient-to-br from-yellow-900/10 to-red-900/10 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-yellow-400">Tu Código QR</CardTitle>
                <CardDescription className="text-slate-400">
                  Muestra este código cuando alguien quiera verificar si eres su Santa
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <QRDisplay userId={profile.id} qrToken={profile.qr_token} />
              </CardContent>
            </Card>
          )}

          {/* Challenge Button - For non-owners */}
          {!isOwner && (
            <Link href={`/game/scan?suspect=${profile.id}`}>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800"
              >
                <Camera className="w-5 h-5 mr-2" />
                Desafiar (Escanear QR)
              </Button>
            </Link>
          )}

          {/* Wishlist */}
          <Card className="border-red-900/20 bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-red-400">
                {isOwner ? 'Mi Lista de Deseos' : `Lista de Deseos de ${profile.username}`}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {isOwner 
                  ? 'Agrega ideas de regalos que te gustaría recibir'
                  : 'Ideas de regalos que le gustarían'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WishlistGrid
                items={wishlistItems}
                isOwner={isOwner}
                userId={profile.id}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
