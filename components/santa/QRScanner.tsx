'use client'

import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface Props {
  onScan: (data: string) => void
  onError: (error: string) => void
}

export function QRScanner({ onScan, onError }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerIdRef = useRef('qr-reader')

  useEffect(() => {
    const scanner = new Html5Qrcode(scannerIdRef.current)
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      (decodedText) => {
        onScan(decodedText)
        scanner.stop()
      },
      (errorMessage) => {
        // Ignore frame processing errors
      }
    ).catch((err) => {
      onError('No se pudo acceder a la cámara')
      console.error(err)
    })

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [onScan, onError])

  return (
    <div className="relative">
      <div 
        id={scannerIdRef.current} 
        className="rounded-lg overflow-hidden border-2 border-yellow-400"
      />
      <div className="mt-4 text-center">
        <p className="text-slate-400 text-sm">
          Apunta la cámara al código QR
        </p>
      </div>
    </div>
  )
}
