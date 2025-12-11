'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, Copy, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'

export function InviteLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  
  if (!code) return null

  // Use window.location.origin to get the base domain dynamically
  const inviteUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/join/${code}`
    : `/join/${code}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      toast.success('¡Enlace copiado!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('No se pudo copiar el enlace')
    }
  }

  return (
    <div className="space-y-2 mt-4 p-4 bg-slate-800/50 rounded-lg border border-yellow-900/20">
      <Label className="text-yellow-400 flex items-center gap-2">
        <LinkIcon className="w-4 h-4" />
        Enlace de Invitación
      </Label>
      <div className="flex gap-2">
        <Input 
          value={inviteUrl} 
          readOnly 
          className="bg-slate-900 border-slate-700 text-slate-300 font-mono text-sm"
        />
        <Button 
          onClick={copyToClipboard}
          variant="outline"
          className="border-yellow-500/20 hover:bg-yellow-900/20 text-yellow-400"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
      <p className="text-xs text-slate-500">
        Comparte este enlace para que otros se unan al grupo automáticamente.
      </p>
    </div>
  )
}
