import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function CameraScanner({ onScanSuccess, onError }) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)
  const html5QrCodeRef = useRef(null)

  useEffect(() => {
    startScanner()
    return () => {
      stopScanner()
    }
  }, [])

  const startScanner = async () => {
    try {
      setScanning(true)
      setError(null)

      html5QrCodeRef.current = new Html5Qrcode("camera-reader")

      await html5QrCodeRef.current.start(
        { facingMode: "environment" }, // Back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 150 }
        },
        (decodedText) => {
          // Barcode detected
          stopScanner()
          onScanSuccess?.(decodedText)
        },
        (errorMessage) => {
          // Scan error (ignore, too noisy)
        }
      )
    } catch (err) {
      setError(err.message)
      setScanning(false)
      onError?.(err.message)
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
    }
    setScanning(false)
  }

  return (
    <div className="space-y-2">
      <div id="camera-reader" className="w-full rounded-lg overflow-hidden border-2 border-blue-500"></div>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          Error: {error}
        </div>
      )}
      {scanning && (
        <p className="text-xs text-gray-500 text-center">
          Arahkan camera ke barcode...
        </p>
      )}
    </div>
  )
}
