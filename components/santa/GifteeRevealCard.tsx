'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Gift, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Confetti from 'react-confetti'
import { useWindowSize } from '@/lib/hooks/useWindowSize'

interface Props {
  giftee: {
    id: string
    username: string
    avatar_url?: string | null
  } | null
}

export function GifteeRevealCard({ giftee }: Props) {
  const [revealed, setRevealed] = useState(false)
  const { width, height } = useWindowSize()

  if (!giftee) {
    return (
      <Card className="border-slate-700 bg-slate-900/50 backdrop-blur">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-xl font-semibold text-slate-300 mb-2">
            No tienes asignación aún
          </h3>
          <p className="text-slate-500">Espera a que se realice el sorteo</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <AnimatePresence>
        {revealed && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
        )}
      </AnimatePresence>

      <Card className="border-red-900/20 bg-gradient-to-br from-red-900/20 to-yellow-900/20 backdrop-blur overflow-hidden">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {!revealed ? (
              <motion.div
                key="unrevealed"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  className="text-8xl mb-6"
                >
                  🎁
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-200 mb-4 text-center">
                  ¿Listo para descubrir tu asignación?
                </h3>
                <Button
                  onClick={() => setRevealed(true)}
                  size="lg"
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-lg px-8"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Revelar Mi Persona Secreta
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="flex flex-col items-center justify-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                >
                  <Avatar className="w-32 h-32 mb-6 border-4 border-yellow-400">
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-red-500 to-yellow-500 text-white">
                      {giftee.username[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl font-bold bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent mb-2 text-center"
                >
                  {giftee.username}
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-slate-400 mb-6 text-center"
                >
                  ¡Esta es tu persona secreta! 🎉
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <Link href={`/profile/${giftee.id}`}>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800"
                    >
                      <Gift className="w-5 h-5 mr-2" />
                      Ver Lista de Deseos
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </>
  )
}
