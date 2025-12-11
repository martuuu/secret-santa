'use client'

import QRCode from 'react-qr-code'

interface Props {
  userId: string
  qrToken: string
}

export function QRDisplay({ userId, qrToken }: Props) {
  // Encode both user ID and QR token for verification
  const qrData = JSON.stringify({ userId, qrToken })

  return (
    <div className="bg-white p-6 rounded-lg">
      <QRCode 
        value={qrData}
        size={256}
        level="H"
      />
    </div>
  )
}
