import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, AlertTriangle, RefreshCw, Phone } from 'lucide-react';
import { processFrame } from '../services/api';

export default function CameraStream({ telemetry, isMonitoring, isDemoMode }) {
  const [camMode, setCamMode] = useState('server'); // 'server' or 'browser'
  const [browserFrame, setBrowserFrame] = useState(null);
  const [camError, setCamError] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  // Enable Browser Camera (getUserMedia)
  const startBrowserCam = async () => {
    try {
      setCamError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCamMode('browser');

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (video.readyState >= 2) {
          ctx.drawImage(video, 0, 0, 640, 480);
          const base64Data = canvas.toDataURL('image/jpeg', 0.8);
          const res = await processFrame(base64Data);
          if (res && res.status === 'ok' && res.annotated_image) {
            setBrowserFrame(res.annotated_image);
          }
        }
      }, 60);

    } catch (err) {
      setCamError(`Browser camera error: ${err.message}`);
      setCamMode('server');
    }
  };

  const switchToServerCam = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setCamMode('server');
    setBrowserFrame(null);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const status = telemetry?.status || 'AWAKE';
  const isDrowsy = status === 'DROWSY';
  const isPhoneDetected = telemetry?.phone_detected || false;

  return (
    <div className={`glass-card rounded-xl p-4 relative overflow-hidden flex flex-col items-center justify-center border ${
      isDrowsy || isPhoneDetected ? 'border-red-500/80 glow-red' : 'border-slate-800'
    }`}>
      
      {/* Stream Controls Overlay Header */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
              isDrowsy || isPhoneDetected ? 'bg-red-400' : 'bg-emerald-400'
            } opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isDrowsy || isPhoneDetected ? 'bg-red-500' : 'bg-emerald-500'
            }`}></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {isDemoMode ? 'SIMULATED STREAM (DEMO MODE)' : camMode === 'browser' ? 'CHROME HTML5 WEBCAM' : 'OPENCV BACKEND STREAM'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {camMode === 'server' ? (
            <button
              onClick={startBrowserCam}
              className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Use Chrome Cam</span>
            </button>
          ) : (
            <button
              onClick={switchToServerCam}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Use Server Cam</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Video View Container */}
      <div className="relative w-full aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
        
        {camMode === 'server' ? (
          <img
            src="/video_feed"
            alt="Live Driver Safety Monitoring Stream"
            className="w-full h-full object-cover"
            onError={() => {
              setCamError('Server video feed interrupted. Click "Use Chrome Cam" to capture directly.');
            }}
          />
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className="hidden" />
            <canvas ref={canvasRef} width="640" height="480" className="hidden" />
            {browserFrame ? (
              <img src={browserFrame} alt="Annotated Chrome Stream" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-xs font-mono">Initializing Chrome HTML5 Webcam...</span>
              </div>
            )}
          </>
        )}

        {/* Mobile Phone Warning Banner */}
        {isPhoneDetected && (
          <div className="absolute top-4 left-4 right-4 bg-red-600 text-white px-4 py-2.5 rounded-lg font-extrabold text-xs text-center tracking-wide uppercase shadow-2xl flex items-center justify-center gap-2 animate-bounce">
            <Phone className="w-4 h-4 text-white" />
            <span>📱 PHONE USAGE DETECTED -- BEEP ALARM ACTIVE! KEEP HANDS ON WHEEL!</span>
          </div>
        )}

        {/* Drowsiness Warning Banner */}
        {isDrowsy && !isPhoneDetected && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg font-extrabold text-sm text-center tracking-wide uppercase shadow-2xl flex items-center justify-center gap-2 animate-bounce">
            <AlertTriangle className="w-5 h-5 text-white" />
            <span>DROWSINESS DETECTED -- TAKE A BREAK IMMEDIATELY!</span>
          </div>
        )}

      </div>

      {camError && (
        <div className="w-full mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] flex items-center justify-between">
          <span>{camError}</span>
          <button onClick={startBrowserCam} className="underline font-bold">Try Chrome Cam</button>
        </div>
      )}

    </div>
  );
}
