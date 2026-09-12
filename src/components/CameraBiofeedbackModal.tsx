import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { Camera, X, Activity, ShieldCheck } from 'lucide-react';

interface CameraBiofeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onApplyBpm?: (bpm: number) => void;
}

export const CameraBiofeedbackModal: React.FC<CameraBiofeedbackModalProps> = ({
  isOpen,
  onClose,
  lang,
  onApplyBpm
}) => {
  const [streamActive, setStreamActive] = useState(false);
  const [bpm, setBpm] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const envelopeRef = useRef<number[]>([]);
  const breathTimesRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMessage(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(
        lang === 'ar' ? 'المتصفح لا يدعم الوصول للكاميرا.' : 'Camera API not supported on this browser.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 160, height: 120, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreamActive(true);

      // Create downsampling canvas (32x24 for ultra-lightweight private processing)
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 32;
      sampleCanvas.height = 24;
      sampleCanvasRef.current = sampleCanvas;
      const sampleCtx = sampleCanvas.getContext('2d');

      // Processing tick (6 times a second)
      intervalRef.current = window.setInterval(() => {
        if (!videoRef.current || !sampleCtx) return;
        try {
          sampleCtx.drawImage(videoRef.current, 0, 0, 32, 24);
          const imgData = sampleCtx.getImageData(0, 0, 32, 24);
          const d = imgData.data;

          if (prevFrameRef.current) {
            let energy = 0;
            let n = 0;
            for (let i = 0; i < d.length; i += 16) {
              n++;
              energy += Math.abs(d[i + 1] - prevFrameRef.current[i + 1]);
            }
            const avgEnergy = energy / Math.max(1, n);
            envelopeRef.current.push(avgEnergy);
            if (envelopeRef.current.length > 60) envelopeRef.current.shift();

            const now = Date.now();
            const mean =
              envelopeRef.current.reduce((a, b) => a + b, 0) / Math.max(1, envelopeRef.current.length);

            if (
              avgEnergy > mean * 1.35 &&
              (!breathTimesRef.current.length ||
                now - breathTimesRef.current[breathTimesRef.current.length - 1] > 1400)
            ) {
              breathTimesRef.current.push(now);
              if (breathTimesRef.current.length > 8) breathTimesRef.current.shift();
            }

            // Calculate BPM
            if (breathTimesRef.current.length >= 2) {
              const span =
                breathTimesRef.current[breathTimesRef.current.length - 1] -
                breathTimesRef.current[0];
              if (span > 3000) {
                const calculatedBpm = Math.round(
                  ((breathTimesRef.current.length - 1) * 60000) / span
                );
                if (calculatedBpm >= 6 && calculatedBpm <= 30) {
                  setBpm(calculatedBpm);
                }
              }
            }

            // Draw wave
            const waveCanvas = waveCanvasRef.current;
            if (waveCanvas) {
              const wCtx = waveCanvas.getContext('2d');
              if (wCtx) {
                wCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
                const max = Math.max(10, ...envelopeRef.current);
                envelopeRef.current.forEach((val, idx) => {
                  const barH = Math.min(waveCanvas.height, (val / max) * waveCanvas.height);
                  wCtx.fillStyle = 'rgba(134, 230, 207, 0.7)';
                  wCtx.fillRect(
                    idx * (waveCanvas.width / Math.max(1, envelopeRef.current.length)),
                    waveCanvas.height - barH,
                    3,
                    barH
                  );
                });
              }
            }
          }

          prevFrameRef.current = new Uint8ClampedArray(d);
        } catch {}
      }, 160);
    } catch {
      setErrorMessage(
        lang === 'ar' ? 'لم يتم منح الإذن للوصول للكاميرا.' : 'Camera access permission was denied.'
      );
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  if (!isOpen) return null;

  return (
    <div
      id="camera-biofeedback-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1220]/95 p-6 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#86e6cf]/10 text-[#86e6cf] border border-[#86e6cf]/20 mb-3">
          <Camera className="h-6 w-6" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          {lang === 'ar' ? 'مراقبة التنفس بالكاميرا (Biofeedback)' : 'Camera Breathing Monitor'}
        </h3>
        <p className="text-xs text-slate-400 mb-4 max-w-xs mx-auto">
          {lang === 'ar'
            ? 'وجّه الكاميرا نحو صدرك في إضاءة معتدلة؛ تُحلَّل الحركة داخل متصفحك فقط بدون إرسال أي فيديو.'
            : 'Aim camera at your torso; movement is analyzed locally inside your browser.'}
        </p>

        {errorMessage ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 mb-4">
            {errorMessage}
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {/* Video Box */}
            <div className="relative mx-auto w-64 h-48 rounded-xl overflow-hidden border border-white/15 bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {bpm && (
                <div className="absolute top-2 right-2 rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-[#86e6cf] border border-[#86e6cf]/30">
                  {bpm} {lang === 'ar' ? 'نَفَس/د' : 'breaths/m'}
                </div>
              )}
            </div>

            {/* Wave canvas */}
            <div className="rounded-lg border border-white/10 bg-black/40 p-2">
              <canvas ref={waveCanvasRef} width={250} height={40} className="w-full h-10" />
            </div>
          </div>
        )}

        {/* Privacy Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-300/80 mb-4">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>
            {lang === 'ar'
              ? 'معالجة محلية 100% داخل المتصفح — لا يُحفظ ولا يُنقل أي فيديو'
              : '100% Local In-Browser Processing — Zero Video Transferred'}
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white hover:bg-white/15 transition-all"
        >
          {lang === 'ar' ? 'إغلاق' : 'Close'}
        </button>
      </div>
    </div>
  );
};
