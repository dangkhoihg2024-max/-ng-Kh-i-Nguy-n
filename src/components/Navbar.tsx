import React from 'react';
import { Bot, Radio, Camera, SplitSquareVertical, Maximize2, Table, HelpCircle } from 'lucide-react';

export type AppViewMode = '3d_full' | 'split' | 'table_full';

interface NavbarProps {
  viewMode: AppViewMode;
  onViewModeChange: (mode: AppViewMode) => void;
  isLidarActive: boolean;
  onToggleLidar: () => void;
  showRadarHUD: boolean;
  onToggleRadarHUD: () => void;
  showCameraHUD: boolean;
  onToggleCameraHUD: () => void;
  onOpenHelp: () => void;
  onStartRaceMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onViewModeChange,
  isLidarActive,
  onToggleLidar,
  showRadarHUD,
  onToggleRadarHUD,
  showCameraHUD,
  onToggleCameraHUD,
  onOpenHelp,
  onStartRaceMode,
}) => {
  return (
    <header className="bg-slate-900/95 border-b border-slate-800 text-white px-4 py-2.5 z-40 relative flex-shrink-0">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white m-0">
                Mô Hình Robot Tự Hành 3D
              </h1>
              <span className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] px-2 py-0.5 font-mono">
                JETSON NANO · RPLIDAR
              </span>
            </div>
            <p className="text-slate-400 text-xs m-0">
              Phân tích cấu tạo 9 linh kiện vi sai & mô phỏng cảm biến Three.js
            </p>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onViewModeChange('3d_full')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === '3d_full'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>3D Toàn Cảnh</span>
          </button>

          <button
            onClick={() => onViewModeChange('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'split'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>3D & Bảng Bootstrap</span>
          </button>

          <button
            onClick={() => onViewModeChange('table_full')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'table_full'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Bảng Phân Tích</span>
          </button>

          <button
            onClick={onStartRaceMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-md ml-1"
            title="Bắt đầu chế độ game đua robot vượt chướng ngại vật"
          >
            <span className="text-sm">🏁</span>
            <span>Đua Vượt Chướng Ngại Vật</span>
          </button>
        </div>

        {/* Right Tools & Sensors Toggles */}
        <div className="flex items-center gap-2">
          {/* Toggle Radar HUD */}
          <button
            onClick={onToggleRadarHUD}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showRadarHUD
                ? 'bg-red-950/80 border-red-700 text-red-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Bật/Tắt màn hình Radar 2D LiDAR"
          >
            <Radio className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Radar 2D</span>
          </button>

          {/* Toggle Camera HUD */}
          <button
            onClick={onToggleCameraHUD}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showCameraHUD
                ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Bật/Tắt màn hình góc nhìn Camera CSI"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Camera CSI</span>
          </button>

          {/* Help modal */}
          <button
            onClick={onOpenHelp}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Hướng dẫn tương tác & phím tắt"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
