import React from 'react';
import { Camera, Eye, X } from 'lucide-react';

interface CameraFeedHUDProps {
  onClose?: () => void;
  onInspectCameraPart?: () => void;
}

export const CameraFeedHUD: React.FC<CameraFeedHUDProps> = ({
  onClose,
  onInspectCameraPart,
}) => {
  return (
    <div className="bg-slate-900/95 border border-cyan-800/80 rounded-xl p-2.5 shadow-xl text-slate-200 pointer-events-auto">
      <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-100">Camera CSI (Sony IMX219)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-emerald-400">1080p@30fps</span>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Simulated Video Frame */}
      <div className="relative w-48 h-28 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
        {/* Virtual visual horizon line */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-emerald-950/40"></div>

        {/* Center reticle */}
        <div className="absolute w-6 h-6 border border-cyan-400/60 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
        </div>

        {/* Simulated AI Object Detection Bounding Box (YOLO Detection) */}
        <div className="absolute top-4 left-8 w-16 h-14 border-2 border-emerald-400 rounded-sm">
          <div className="absolute -top-3.5 left-0 bg-emerald-500 text-slate-950 text-[8px] font-bold px-1 rounded-sm">
            Obstacle_Box: 96%
          </div>
        </div>

        {/* Video feed metadata */}
        <div className="absolute bottom-1 left-1.5 text-[8px] font-mono text-cyan-300">
          RAW MIPI-CSI2 · LATENCY 11ms
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
        <span>Model: TensorRT YOLOv8</span>
        {onInspectCameraPart && (
          <button
            onClick={onInspectCameraPart}
            className="text-cyan-400 hover:underline flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            Xem phần cứng 3D
          </button>
        )}
      </div>
    </div>
  );
};
