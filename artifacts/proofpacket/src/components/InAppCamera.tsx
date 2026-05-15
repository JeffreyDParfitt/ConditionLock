import { useRef, useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, X, AlertTriangle } from 'lucide-react';

interface InAppCameraProps {
  open: boolean;
  onClose: () => void;
  onCapture: (blob: Blob, fileName: string) => void;
}

export function InAppCamera({ open, onClose, onCapture }: InAppCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [capturing, setCapturing] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setReady(false);
    setError('');
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => setReady(true)).catch(() => setReady(true));
        };
      }
    } catch {
      setError('Camera access was denied or is unavailable. Check your browser permissions and try again.');
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [open, startCamera, stopCamera]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || !ready) return;
    setCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) { setCapturing(false); return; }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      setCapturing(false);
      if (!blob) return;
      const fileName = `proofpacket-${Date.now()}.jpg`;
      onCapture(blob, fileName);
      handleClose();
    }, 'image/jpeg', 0.92);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const flipCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const isSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  if (!isSupported) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={() => handleClose()}>
      <DialogContent className="p-0 max-w-full w-full sm:max-w-lg bg-black border-none rounded-none sm:rounded-xl overflow-hidden [&>button]:hidden" style={{ height: '100dvh', maxHeight: '100dvh' }}>
        <div className="relative flex flex-col w-full h-full bg-black">
          {/* Header notice */}
          <div className="absolute top-0 inset-x-0 z-10 pt-3 pb-2 px-4 bg-gradient-to-b from-black/80 to-transparent">
            <p className="text-[10px] text-white/60 text-center leading-tight">
              Photos are stored only inside ConditionLock — not saved to your camera roll
            </p>
          </div>

          {/* Camera feed */}
          <video
            ref={videoRef}
            className="flex-1 w-full object-cover"
            playsInline
            muted
            autoPlay
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-4 px-8 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-400" />
              <p className="text-white text-sm leading-relaxed">{error}</p>
              <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20" onClick={startCamera}>
                Try Again
              </Button>
              <Button variant="ghost" className="text-white/50 text-xs" onClick={handleClose}>
                Close
              </Button>
            </div>
          )}

          {/* Loading */}
          {!ready && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Camera className="w-8 h-8 text-white/40 animate-pulse" />
            </div>
          )}

          {/* Controls */}
          {!error && (
            <div className="absolute bottom-0 inset-x-0 pb-10 pt-6 flex items-center justify-center gap-10 bg-gradient-to-t from-black/80 to-transparent">
              {/* Close */}
              <button
                onClick={handleClose}
                className="w-11 h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Close camera"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Shutter */}
              <button
                onClick={handleCapture}
                disabled={!ready || capturing}
                className="w-[72px] h-[72px] rounded-full bg-white border-[4px] border-white/40 flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
                aria-label="Take photo"
              >
                {capturing && (
                  <div className="w-8 h-8 rounded-full bg-black/20 animate-ping" />
                )}
              </button>

              {/* Flip */}
              <button
                onClick={flipCamera}
                className="w-11 h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Flip camera"
              >
                <RefreshCw className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function isInAppCameraSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
}
