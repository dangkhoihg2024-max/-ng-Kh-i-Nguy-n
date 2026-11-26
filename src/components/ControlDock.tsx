import React, { useState } from 'react';
import { CameraPreset } from '../three/SceneManager';
import { BoostState, DriveState, AutonomousSensors } from '../types/robot';
import { AUTONOMOUS_CODE_SAMPLES } from '../data/autonomousCodeSamples';
import {
  Layers,
  Radio,
  Gamepad2,
  Camera,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Camera as CameraIcon,
  Play,
  Square,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Code2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export type ControlDockTab = 'explode' | 'lidar' | 'drive' | 'code' | 'race' | 'camera';

interface ControlDockProps {
  explodeProgress: number;
  onExplodeChange: (val: number) => void;
  isLidarActive: boolean;
  onToggleLidar: () => void;
  onCameraPreset: (preset: CameraPreset) => void;
  isVehiclePov?: boolean;
  onToggleVehiclePov?: () => void;
  onDriveInput: (forward: number, turn: number) => void;
  driveState: DriveState;
  boostState?: BoostState;
  onTriggerBoost?: () => void;
  onResetRobot: () => void;
  onTakeScreenshot: () => void;
  isRacingMode?: boolean;
  onStartRace?: () => void;
  onExitRace?: () => void;
  autoCode?: string;
  onAutoCodeChange?: (code: string) => void;
  isCodeRunning?: boolean;
  onToggleRunCode?: () => void;
  codeError?: string | null;
  codeLog?: string;
  autoSensors?: AutonomousSensors | null;
  activeTab?: ControlDockTab;
  onTabChange?: (tab: ControlDockTab) => void;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  explodeProgress,
  onExplodeChange,
  isLidarActive,
  onToggleLidar,
  onCameraPreset,
  isVehiclePov = false,
  onToggleVehiclePov,
  onDriveInput,
  driveState,
  boostState,
  onTriggerBoost,
  onResetRobot,
  onTakeScreenshot,
  isRacingMode = false,
  onStartRace,
  onExitRace,
  autoCode = AUTONOMOUS_CODE_SAMPLES[0].code,
  onAutoCodeChange,
  isCodeRunning = false,
  onToggleRunCode,
  codeError = null,
  codeLog = '',
  autoSensors = null,
  activeTab: controlledTab,
  onTabChange,
  isCollapsed: controlledCollapsed,
  onCollapsedChange,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [internalTab, setInternalTab] = useState<ControlDockTab>('explode');
  const [selectedSampleId, setSelectedSampleId] = useState<string>(AUTONOMOUS_CODE_SAMPLES[0].id);

  const isCollapsed = controlledCollapsed ?? internalCollapsed;
  const setIsCollapsed = (val: boolean) => {
    setInternalCollapsed(val);
    onCollapsedChange?.(val);
  };

  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: ControlDockTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 transition-transform duration-300 pointer-events-auto"
      style={{
        width: 'min(980px, 95vw)',
        transform: `translate(-50%, ${isCollapsed ? 'calc(100% - 38px)' : '0'})`,
      }}
    >
      {/* Collapse / Expand Tab Button */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-700/80 rounded-t-lg text-xs font-medium text-slate-300 hover:text-white shadow-md transition-colors"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mở rộng Bảng Điều Khiển (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Thu gọn Bảng Điều Khiển (H)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Panel (Solid rgba background, no backdrop-filter) */}
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-3 text-slate-200">
        {/* Top Header & Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveTab('explode')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'explode'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tháo Lắp 3D</span>
            </button>

            <button
              onClick={() => setActiveTab('lidar')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'lidar'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>LiDAR 360° {isLidarActive ? '(ON)' : '(OFF)'}</span>
            </button>

            <button
              onClick={() => setActiveTab('drive')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'drive'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Lái Thử</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              title="Mở / đóng ô nhập code tự hành (Phím 1)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'code' || isCodeRunning
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/60'
                  : 'bg-slate-800 text-indigo-300 hover:bg-slate-700'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{isCodeRunning ? 'Code Tự Hành (Đang chạy) [1]' : 'Code Tự Hành [1]'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('race');
                if (onStartRace) onStartRace();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'race' || isRacingMode
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
              }`}
            >
              <span className="text-xs">🏁</span>
              <span>Đua Vượt Chướng Ngại</span>
            </button>

            <button
              onClick={() => setActiveTab('camera')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'camera'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Góc Quan Sát</span>
            </button>
          </div>

          {/* Quick Utility Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={onResetRobot}
              title="Khôi phục vị trí mặc định"
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Đặt lại vị trí</span>
            </button>
            <button
              onClick={onTakeScreenshot}
              title="Chụp ảnh 3D phân giải cao"
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
            >
              <CameraIcon className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">Chụp 3D</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Explode View Controls */}
        {activeTab === 'explode' && (
          <div className="flex flex-wrap items-center justify-between gap-4 py-1">
            <div className="flex-1 min-w-[240px]">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Mức độ bóc tách từng tầng linh kiện:
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  {Math.round(explodeProgress * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodeProgress}
                onChange={(e) => onExplodeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onExplodeChange(0)}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  explodeProgress === 0
                    ? 'bg-slate-700 text-white font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Lắp ráp (0%)
              </button>
              <button
                onClick={() => onExplodeChange(0.5)}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  explodeProgress > 0.4 && explodeProgress < 0.6
                    ? 'bg-slate-700 text-white font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Vừa phải (50%)
              </button>
              <button
                onClick={() => onExplodeChange(1.0)}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  explodeProgress === 1.0
                    ? 'bg-slate-700 text-white font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Tách rời tối đa (100%)
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: LiDAR 360° Controls */}
        {activeTab === 'lidar' && (
          <div className="flex flex-wrap items-center justify-between gap-4 py-1 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleLidar}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                  isLidarActive
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {isLidarActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isLidarActive ? 'Tắt Laser Quét' : 'Kích Hoạt RPLIDAR 360°'}
              </button>

              <div className="text-slate-400">
                <span>Tốc độ quét: <strong className="text-white font-mono">6.0 Hz (360 RPM)</strong></span>
                <span className="mx-2">•</span>
                <span>Tần số mẫu: <strong className="text-white font-mono">4000 pts/s</strong></span>
                <span className="mx-2">•</span>
                <span>Tầm quét: <strong className="text-emerald-400 font-mono">12.0m</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-red-950/80 border border-red-800/80 text-red-300 px-2.5 py-1 rounded-lg text-xs font-mono">
                {isLidarActive ? '● SLAM MAPPING ACTIVE' : '○ STANDBY'}
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Drive Simulation Controls */}
        {activeTab === 'drive' && (
          <div className="flex flex-wrap items-center justify-between gap-4 py-1">
            {/* Virtual D-pad */}
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-3 gap-1 w-28">
                <div></div>
                <button
                  onMouseDown={() => onDriveInput(1, 0)}
                  onMouseUp={() => onDriveInput(0, 0)}
                  onTouchStart={() => onDriveInput(1, 0)}
                  onTouchEnd={() => onDriveInput(0, 0)}
                  className="p-1.5 bg-slate-800 hover:bg-cyan-600 rounded flex items-center justify-center text-white"
                  title="Tiến lên (Phím W / Mũi tên lên)"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <div></div>

                <button
                  onMouseDown={() => onDriveInput(0, 1)}
                  onMouseUp={() => onDriveInput(0, 0)}
                  onTouchStart={() => onDriveInput(0, 1)}
                  onTouchEnd={() => onDriveInput(0, 0)}
                  className="p-1.5 bg-slate-800 hover:bg-cyan-600 rounded flex items-center justify-center text-white"
                  title="Rẽ trái (Phím A / Mũi tên trái)"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDriveInput(0, 0)}
                  className="p-1.5 bg-rose-900/80 hover:bg-rose-700 rounded flex items-center justify-center text-white text-[10px] font-bold"
                  title="Phanh / Dừng xe (Phím Space)"
                >
                  STOP
                </button>

                <button
                  onMouseDown={() => onDriveInput(0, -1)}
                  onMouseUp={() => onDriveInput(0, 0)}
                  onTouchStart={() => onDriveInput(0, -1)}
                  onTouchEnd={() => onDriveInput(0, 0)}
                  className="p-1.5 bg-slate-800 hover:bg-cyan-600 rounded flex items-center justify-center text-white"
                  title="Rẽ phải (Phím D / Mũi tên phải)"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div></div>
                <button
                  onMouseDown={() => onDriveInput(-1, 0)}
                  onMouseUp={() => onDriveInput(0, 0)}
                  onTouchStart={() => onDriveInput(-1, 0)}
                  onTouchEnd={() => onDriveInput(0, 0)}
                  className="p-1.5 bg-slate-800 hover:bg-cyan-600 rounded flex items-center justify-center text-white"
                  title="Lùi lại (Phím S / Mũi tên xuống)"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <div></div>
              </div>

              <div className="text-xs text-slate-400 pl-2 space-y-1">
                <div className="font-semibold text-slate-300">Phím tắt bàn phím:</div>
                <div className="font-mono text-[11px] text-cyan-400">W, A, S, D / Mũi tên · Phím V: Góc nhìn xe</div>
                {onTriggerBoost && (
                  <button
                    type="button"
                    onClick={onTriggerBoost}
                    disabled={!!boostState && (boostState.isActive || boostState.cooldownRemaining > 0)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                      boostState?.isActive
                        ? 'bg-cyan-600/90 border-cyan-400 text-white'
                        : boostState && boostState.cooldownRemaining > 0
                        ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-amber-600/90 hover:bg-amber-500 border-amber-400 text-white'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>
                      {boostState?.isActive
                        ? `Đang Tăng Tốc x2 (${boostState.activeRemaining.toFixed(1)}s)`
                        : boostState && boostState.cooldownRemaining > 0
                        ? `Hồi chiêu Shift (${boostState.cooldownRemaining.toFixed(1)}s)`
                        : 'Tăng tốc x2 (Shift · 3s / Hồi 13s)'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Telemetry Display */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">Vận tốc V</span>
                <span className="text-emerald-400 font-bold">{driveState.linearVelocity} m/s</span>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <span className="text-slate-500 block text-[10px]">Tốc độ góc W</span>
                <span className="text-cyan-400 font-bold">{driveState.angularVelocity} rad/s</span>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <span className="text-slate-500 block text-[10px]">Động cơ L / R</span>
                <span className="text-yellow-400 font-bold">
                  {driveState.leftWheelSpeed} / {driveState.rightWheelSpeed} rpm
                </span>
              </div>
              <div className="border-l border-slate-800 pl-3">
                <span className="text-slate-500 block text-[10px]">Góc hướng</span>
                <span className="text-purple-400 font-bold">{driveState.heading}°</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Autonomous Code Editor & Runner */}
        {activeTab === 'code' && (
          <div className="space-y-2 py-1">
            {/* Top row: Sample presets + Run/Stop */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Code mẫu:</span>
                {AUTONOMOUS_CODE_SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      setSelectedSampleId(sample.id);
                      onAutoCodeChange?.(sample.code);
                    }}
                    title={sample.description}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                      selectedSampleId === sample.id
                        ? 'bg-indigo-600/90 text-white border-indigo-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    {sample.title}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onResetRobot}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1"
                  title="Đưa xe về vạch xuất phát (z = 0)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Về vạch xuất phát</span>
                </button>
                <button
                  type="button"
                  onClick={onToggleRunCode}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all ${
                    isCodeRunning
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isCodeRunning ? (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Dừng Code</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Chạy Code Tự Động</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Input Box */}
            <textarea
              value={autoCode}
              onChange={(e) => onAutoCodeChange?.(e.target.value)}
              spellCheck={false}
              rows={6}
              placeholder="Nhập code JavaScript điều khiển robot tự hành tại đây..."
              className="w-full rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:outline-none p-2.5 font-mono text-xs text-emerald-300 leading-relaxed resize-y"
            />

            {/* Error or Live Telemetry / API Hint */}
            {codeError ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/90 border border-red-700 text-red-200 text-xs font-mono">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="truncate">{codeError}</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5">
                <div className="font-mono text-slate-400 truncate">
                  <span className="text-indigo-400 font-semibold">API:</span>{' '}
                  robot.forward(v) · robot.turnLeft(w) · robot.turnRight(w) · robot.move(v, w) · robot.stop() · sensors.front/left/right/z
                </div>
                <div className="font-mono text-cyan-300 flex items-center gap-2 flex-shrink-0">
                  {autoSensors && (
                    <span>
                      Trước:{autoSensors.front}m | T:{autoSensors.frontLeft}m | P:{autoSensors.frontRight}m | Z:{autoSensors.z}m
                    </span>
                  )}
                  {codeLog && (
                    <span className="text-emerald-400 border-l border-slate-700 pl-2 max-w-[200px] truncate">
                      {codeLog}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Race Mode Controls */}
        {activeTab === 'race' && (
          <div className="flex flex-wrap items-center justify-between gap-4 py-1 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={onStartRace}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 rounded-xl font-bold text-white shadow-lg transition-all"
              >
                <span>🏁</span>
                <span>{isRacingMode ? 'Đua Lại Chặng Mới' : 'Bắt Đầu Đua Vượt Chướng Ngại'}</span>
              </button>

              <div className="text-slate-400">
                <span>Độ dài đường đua: <strong className="text-white font-mono">70m (Rộng 24m)</strong></span>
                <span className="mx-2">•</span>
                <span>Chướng ngại vật: <strong className="text-amber-400 font-mono">24 vật cản + 6 robot tuần tra</strong></span>
                <span className="mx-2">•</span>
                <span>Mục tiêu: <strong className="text-emerald-400 font-mono">4 Cổng &amp; Vạch Đích (Finish)</strong></span>
              </div>
            </div>

            {isRacingMode && (
              <button
                onClick={onExitRace}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                Thoát Chế Độ Đua
              </button>
            )}
          </div>
        )}

        {/* Tab 4: Camera Presets */}
        {activeTab === 'camera' && (
          <div className="flex flex-wrap items-center justify-between gap-2 py-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onCameraPreset('isometric')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-200 transition-colors"
              >
                Phối cảnh 3D
              </button>
              <button
                onClick={() => onCameraPreset('front')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-200 transition-colors"
              >
                Mặt trước (Front)
              </button>
              <button
                onClick={() => onCameraPreset('top')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-200 transition-colors"
              >
                Mặt trên (2D SLAM)
              </button>
              <button
                onClick={() => onCameraPreset('side')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-200 transition-colors"
              >
                Mặt bên (Profile)
              </button>
              <button
                onClick={() => (onToggleVehiclePov ? onToggleVehiclePov() : onCameraPreset('csi_pov'))}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  isVehiclePov
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                    : 'bg-cyan-900/80 hover:bg-cyan-800 text-cyan-200 border-cyan-700'
                }`}
              >
                Góc nhìn xe (POV) [V]
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Kéo chuột trái: Xoay | Chuột phải: Di chuyển | Cuộn: Thu phóng
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
