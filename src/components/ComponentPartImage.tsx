import React from 'react';
import { PartImageRegion } from '../types/robot';

interface ComponentPartImageProps {
  region: PartImageRegion;
  className?: string;
  showBadge?: boolean;
  onClick?: () => void;
  title?: string;
}

const KIT_DIAGRAM_SRC = '/assets/aistudio/image_3c91e4ba.png';
const KIT_WIDTH = 724;
const KIT_HEIGHT = 453;

export const ComponentPartImage: React.FC<ComponentPartImageProps> = ({
  region,
  className = '',
  showBadge = true,
  onClick,
  title,
}) => {
  return (
    <div
      onClick={onClick}
      title={title || region.label}
      className={`relative bg-white rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center ${
        onClick ? 'cursor-pointer hover:ring-2 hover:ring-cyan-400 transition-all' : ''
      } ${className}`}
    >
      <svg
        viewBox={`${region.x} ${region.y} ${region.w} ${region.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block p-1"
        role="img"
        aria-label={region.label}
      >
        <image
          href={KIT_DIAGRAM_SRC}
          x="0"
          y="0"
          width={KIT_WIDTH}
          height={KIT_HEIGHT}
        />
      </svg>

      {showBadge && (
        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold leading-none shadow">
          {region.kitNumber}
        </span>
      )}
    </div>
  );
};
