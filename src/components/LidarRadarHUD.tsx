import React from 'react';
import { Radio, X } from 'lucide-react';

interface LidarRadarHUDProps {
  points: { angle: number; distance: number }[];
  isLidarActive: boolean;
  onClose?: () => void;
}

export const LidarRadarHUD: React.FC<LidarRadarHUDProps> = ({
  points,
  isLidarActive,
  onClose,
}) => {
  const size = 180;
  const center = size / 2;
  const maxRange = 6.0; // meters

  return (
    <div className="bg-slate-900/95 border border-red-900/80 rounded-xl p-2.5 shadow-xl text-slate-200 pointer-events-auto">
      <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5">
          <Radio className={`w-3.5 h-3.5 ${isLidarActive ? 'text-red-500' : 'text-slate-500'}`} />
          <span className="font-semibold text-slate-100">RPLIDAR 2D Costmap</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-red-400">
            {isLidarActive ? 'SCANNING' : 'IDLE'}
          </span>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Radar SVG */}
      <div className="relative flex justify-center">
        <svg width={size} height={size} className="bg-slate-950 rounded-lg border border-slate-800">
          {/* Concentric distance rings */}
          {[1.5, 3.0, 4.5, 6.0].map((dist) => {
            const r = (dist / maxRange) * (center - 10);
            return (
              <circle
                key={dist}
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            );
          })}

          {/* Cross lines */}
          <line x1={center} y1={5} x2={center} y2={size - 5} stroke="#1e293b" strokeWidth="1" />
          <line x1={5} y1={center} x2={size - 5} y2={center} stroke="#1e293b" strokeWidth="1" />

          {/* Robot Center Marker */}
          <circle cx={center} cy={center} r={4} fill="#06b6d4" />
          {/* Forward arrow */}
          <polygon
            points={`${center},${center - 9} ${center - 3},${center - 4} ${center + 3},${center - 4}`}
            fill="#06b6d4"
          />

          {/* Detected Obstacle Points */}
          {isLidarActive &&
            points.map((pt, idx) => {
              const rad = (pt.angle * Math.PI) / 180;
              const r = Math.min(distToRadius(pt.distance, maxRange, center - 10), center - 8);
              const px = center + Math.sin(rad) * r;
              const py = center - Math.cos(rad) * r;

              const isClose = pt.distance < 2.5;

              return (
                <circle
                  key={idx}
                  cx={px}
                  cy={py}
                  r={isClose ? 2.5 : 1.8}
                  fill={isClose ? '#ef4444' : '#22c55e'}
                  opacity={0.85}
                />
              );
            })}
        </svg>

        {/* Distance labels */}
        <div className="absolute top-1 left-2 text-[9px] font-mono text-slate-500">
          Max: 6.0m
        </div>
        <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">
          Ring: 1.5m
        </div>
      </div>

      <div className="mt-2 text-[10px] text-slate-400 flex justify-between font-mono">
        <span>Điểm quét: {points.length}</span>
        <span className="text-emerald-400">SLAM: Gmapping</span>
      </div>
    </div>
  );
};

function distToRadius(distance: number, maxDist: number, maxRadius: number): number {
  return (distance / maxDist) * maxRadius;
}
