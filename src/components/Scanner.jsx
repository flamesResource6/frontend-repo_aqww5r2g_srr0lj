import { useEffect, useRef } from 'react'

// Simple camera scanner placeholder. In a real Android build, you'd use native barcode APIs.
export default function Scanner({ onDetected }) {
  const videoRef = useRef(null)

  useEffect(() => {
    let stream
    async function init() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (e) {
        console.warn('Camera unavailable', e)
      }
    }
    init()
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
      <video ref={videoRef} className="w-full aspect-video object-cover" muted playsInline />
      <div className="p-3 text-center text-xs text-white/70">Point the camera at a barcode to scan</div>
    </div>
  )
}
