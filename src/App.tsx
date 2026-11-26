import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Navbar, AppViewMode } from './components/Navbar';
import { ThreeCanvas } from './components/ThreeCanvas';
import { ControlDock, ControlDockTab } from './components/ControlDock';
import { ComponentTable } from './components/ComponentTable';
import { LidarRadarHUD } from './components/LidarRadarHUD';
import { CameraFeedHUD } from './components/CameraFeedHUD';
import { ComponentDetailModal } from './components/ComponentDetailModal';
import { HelpModal } from './components/HelpModal';
import { RaceHUD } from './components/RaceHUD';
import { ComponentPartImage } from './components/ComponentPartImage';
import { RobotSceneManager, CameraPreset } from './three/SceneManager';
import { BoostState, ComponentId, DriveState, RobotComponentInfo, RaceGameState, AutonomousSensors } from './types/robot';
import { ROBOT_COMPONENTS } from './data/componentsData';
import { AUTONOMOUS_CODE_SAMPLES } from './data/autonomousCodeSamples';
import { Eye, Layers, Sparkles, Compass, ShieldAlert, Cpu, Video, Image as ImageIcon, Zap } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<AppViewMode>('split');
  const [selectedId, setSelectedId] = useState<ComponentId | null>('jetson_nano');
  const [hoveredId, setHoveredId] = useState<ComponentId | null>(null);
  const [detailModalComp, setDetailModalComp] = useState<RobotComponentInfo | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Simulation states
  const [explodeProgress, setExplodeProgress] = useState(0);
  const [isLidarActive, setIsLidarActive] = useState(true);
  const [showRadarHUD, setShowRadarHUD] = useState(true);
  const [showCameraHUD, setShowCameraHUD] = useState(false);
  const [isVehiclePov, setIsVehiclePov] = useState(false);
  const [isNearObstacle, setIsNearObstacle] = useState(false);
  const [autoCode, setAutoCode] = useState(AUTONOMOUS_CODE_SAMPLES[0].code);
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeLog, setCodeLog] = useState('');
  const [autoSensors, setAutoSensors] = useState<AutonomousSensors | null>(null);
  const [activeDockTab, setActiveDockTab] = useState<ControlDockTab>('explode');
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [radarPoints, setRadarPoints] = useState<{ angle: number; distance: number }[]>([]);
  const [driveState, setDriveState] = useState<DriveState>({
    linearVelocity: 0,
    angularVelocity: 0,
    leftWheelSpeed: 0,
    rightWheelSpeed: 0,
    heading: 0,
    distanceTraveled: 0,
  });
  const [boostState, setBoostState] = useState<BoostState>({
    isActive: false,
    activeRemaining: 0,
    cooldownRemaining: 0,
    duration: 3,
    cooldownDuration: 13,
  });

  // Race Game State
  const [raceState, setRaceState] = useState<RaceGameState>({
    status: 'idle',
    timeElapsed: 0,
    timeLimit: 90,
    health: 100,
    score: 0,
    currentCheckpoint: 0,
    totalCheckpoints: 4,
    collisions: 0,
    countdownNumber: 3,
    difficulty: 'medium',
  });

  const sceneManagerRef = useRef<RobotSceneManager | null>(null);
  const activeDockTabRef = useRef<ControlDockTab>(activeDockTab);
  const isDockCollapsedRef = useRef<boolean>(isDockCollapsed);
  const prevDockTabRef = useRef<ControlDockTab>('explode');

  useEffect(() => {
    activeDockTabRef.current = activeDockTab;
    if (activeDockTab !== 'code') {
      prevDockTabRef.current = activeDockTab;
    }
  }, [activeDockTab]);

  useEffect(() => {
    isDockCollapsedRef.current = isDockCollapsed;
  }, [isDockCollapsed]);

  // Active component info
  const activeComponent = ROBOT_COMPONENTS.find((c) => c.id === (selectedId || hoveredId)) || null;

  // Handlers
  const handleSelectComponent = useCallback((id: ComponentId | null) => {
    setSelectedId(id);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.selectComponent(id);
    }
  }, []);

  const handleHoverComponent = useCallback((id: ComponentId | null) => {
    setHoveredId(id);
  }, []);

  const handleExplodeChange = useCallback((val: number) => {
    setExplodeProgress(val);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setExplodeProgress(val);
    }
  }, []);

  const handleToggleLidar = useCallback(() => {
    setIsLidarActive((prev) => {
      const next = !prev;
      if (sceneManagerRef.current) {
        sceneManagerRef.current.toggleLidar(next);
      }
      return next;
    });
  }, []);

  const handleCameraPreset = useCallback((preset: CameraPreset) => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setCameraPreset(preset);
    }
  }, []);

  const handleToggleVehiclePov = useCallback(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.toggleVehiclePov();
    }
  }, []);

  const handleDriveInput = useCallback((forward: number, turn: number) => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.driveInput = { forward, turn };
    }
  }, []);

  const handleTriggerBoost = useCallback(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.triggerBoost();
    }
  }, []);

  const handleResetRobot = useCallback(() => {
    setIsCodeRunning(false);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.driveInput = { forward: 0, turn: 0 };
      sceneManagerRef.current.resetPosition();
    }
    setExplodeProgress(0);
  }, []);

  const handleToggleRunCode = useCallback(() => {
    setCodeError(null);
    setIsCodeRunning((prev) => !prev);
  }, []);

  const handleTakeScreenshot = useCallback(() => {
    if (sceneManagerRef.current) {
      const dataUrl = sceneManagerRef.current.captureScreenshot();
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `robot-jetson-nano-3d-${Date.now()}.png`;
      a.click();
    }
  }, []);

  // Race Game Handlers
  const handleStartRace = useCallback((diff: 'easy' | 'medium' | 'hard' = 'medium') => {
    setViewMode('3d_full');
    setSelectedId(null);
    setActiveDockTab('race');
    setIsDockCollapsed(false);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.startRace(diff);
    }
  }, []);

  const handleExitRace = useCallback(() => {
    setIsCodeRunning(false);
    setActiveDockTab('explode');
    if (sceneManagerRef.current) {
      sceneManagerRef.current.stopRace();
      sceneManagerRef.current.resetPosition();
    }
    setRaceState((prev) => ({ ...prev, status: 'idle' }));
  }, []);

  // Autonomous Script 20Hz Execution Loop
  useEffect(() => {
    if (!isCodeRunning) {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.driveInput = { forward: 0, turn: 0 };
      }
      return;
    }

    let stepFn: ((robot: unknown, sensors: AutonomousSensors) => void) | null = null;
    try {
      stepFn = new Function('robot', 'sensors', autoCode) as (
        robot: unknown,
        sensors: AutonomousSensors
      ) => void;
      setCodeError(null);
    } catch (err) {
      setCodeError(`Lỗi cú pháp: ${err instanceof Error ? err.message : String(err)}`);
      setIsCodeRunning(false);
      return;
    }

    const startTime = performance.now();
    const clamp = (n: number) => Math.max(-1, Math.min(1, Number.isFinite(n) ? n : 0));

    const timer = window.setInterval(() => {
      const mgr = sceneManagerRef.current;
      if (!mgr || !stepFn) return;

      const elapsed = (performance.now() - startTime) / 1000;
      const sensors = mgr.getAutonomousSensors(elapsed);
      setAutoSensors(sensors);

      let nextForward = 0;
      let nextTurn = 0;
      let latestLog = '';

      const robotApi = {
        move: (forward: number, turn = 0) => {
          nextForward = clamp(forward);
          nextTurn = clamp(turn);
        },
        forward: (speed = 0.8) => {
          nextForward = clamp(Math.abs(speed));
          nextTurn = 0;
        },
        backward: (speed = 0.6) => {
          nextForward = -clamp(Math.abs(speed));
          nextTurn = 0;
        },
        turnLeft: (speed = 0.8) => {
          nextForward = 0;
          nextTurn = clamp(Math.abs(speed));
        },
        turnRight: (speed = 0.8) => {
          nextForward = 0;
          nextTurn = -clamp(Math.abs(speed));
        },
        stop: () => {
          nextForward = 0;
          nextTurn = 0;
        },
        log: (msg: unknown) => {
          latestLog = String(msg);
        },
      };

      try {
        stepFn(robotApi, sensors);
        mgr.driveInput = { forward: nextForward, turn: nextTurn };
        if (latestLog) {
          setCodeLog(latestLog);
        }
      } catch (err) {
        mgr.driveInput = { forward: 0, turn: 0 };
        setCodeError(`Lỗi thực thi: ${err instanceof Error ? err.message : String(err)}`);
        setIsCodeRunning(false);
      }
    }, 50);

    return () => {
      window.clearInterval(timer);
      if (sceneManagerRef.current) {
        sceneManagerRef.current.driveInput = { forward: 0, turn: 0 };
      }
    };
  }, [isCodeRunning, autoCode]);

  // Keyboard navigation for driving and shortcuts
  useEffect(() => {
    const activeKeys = new Set<string>();

    const updateDriveFromKeys = () => {
      let forward = 0;
      let turn = 0;

      if (activeKeys.has('KeyW') || activeKeys.has('ArrowUp')) forward += 1;
      if (activeKeys.has('KeyS') || activeKeys.has('ArrowDown')) forward -= 1;
      if (activeKeys.has('KeyA') || activeKeys.has('ArrowLeft')) turn += 1;
      if (activeKeys.has('KeyD') || activeKeys.has('ArrowRight')) turn -= 1;

      handleDriveInput(forward, turn);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }

      if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
        setIsCodeRunning(false);
        activeKeys.add(e.code);
        updateDriveFromKeys();
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsCodeRunning(false);
        activeKeys.clear();
        handleDriveInput(0, 0);
      }

      if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) {
        e.preventDefault();
        handleTriggerBoost();
      }

      if (e.code === 'KeyV' && !e.repeat) {
        e.preventDefault();
        handleToggleVehiclePov();
      }

      if ((e.code === 'Digit1' || e.code === 'Numpad1') && !e.repeat) {
        e.preventDefault();
        setViewMode((prev) => (prev === 'table_full' ? 'split' : prev));
        if (isDockCollapsedRef.current || activeDockTabRef.current !== 'code') {
          setIsDockCollapsed(false);
          setActiveDockTab('code');
        } else {
          setActiveDockTab(prevDockTabRef.current === 'code' ? 'explode' : prevDockTabRef.current);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        activeKeys.delete(e.code);
        updateDriveFromKeys();
      }
    };

    const handleBlur = () => {
      activeKeys.clear();
      handleDriveInput(0, 0);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleDriveInput, handleToggleVehiclePov, handleTriggerBoost]);

  const isRacingMode = raceState.status !== 'idle';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Header Navigation */}
      <Navbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isLidarActive={isLidarActive}
        onToggleLidar={handleToggleLidar}
        showRadarHUD={showRadarHUD}
        onToggleRadarHUD={() => setShowRadarHUD((p) => !p)}
        showCameraHUD={showCameraHUD}
        onToggleCameraHUD={() => setShowCameraHUD((p) => !p)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onStartRaceMode={() => handleStartRace('medium')}
      />

      {/* 2. Main View Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Left / Main 3D Viewport */}
        <div
          className={`h-full relative transition-all duration-300 ${
            viewMode === '3d_full'
              ? 'w-full'
              : viewMode === 'split'
              ? 'w-full lg:w-7/12 xl:w-3/5'
              : 'hidden'
          }`}
        >
          {/* Isolated WebGL Mount */}
          <ThreeCanvas
            onSelectComponent={handleSelectComponent}
            onHoverComponent={handleHoverComponent}
            onDriveUpdate={setDriveState}
            onLidarPointUpdate={setRadarPoints}
            onGameStateUpdate={setRaceState}
            onCameraModeChange={setIsVehiclePov}
            onObstacleProximityChange={setIsNearObstacle}
            onBoostUpdate={setBoostState}
            sceneManagerRef={sceneManagerRef}
          />

          {/* Centered Medium Red Exclamation Mark When Too Close To Obstacle */}
          {isNearObstacle &&
            (raceState.status === 'idle' || raceState.status === 'racing') && (
              <div
                aria-label="Cảnh báo quá gần chướng ngại vật"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none select-none flex items-center justify-center w-14 h-14 rounded-full bg-slate-950/80 border-2 border-red-500 shadow-[0_0_22px_rgba(239,68,68,0.75)]"
              >
                <span className="text-red-500 font-black text-4xl leading-none drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                  !
                </span>
              </div>
            )}

          {/* Vehicle First-Person POV Indicator */}
          {isVehiclePov && (
            <div
              className={`absolute left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900/95 border border-cyan-500/80 shadow-xl text-xs text-cyan-200 ${
                isRacingMode ? 'top-20' : 'top-3'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="font-semibold tracking-wide">GÓC NHÌN CAMERA XE (POV)</span>
              <button
                onClick={handleToggleVehiclePov}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-mono text-slate-200 transition-colors"
                title="Nhấn V để thoát góc nhìn xe"
              >
                Nhấn V để thoát
              </button>
            </div>
          )}

          {/* Turbo Boost 2x Speed Indicator [Shift] */}
          <div
            className={`absolute right-3 z-30 pointer-events-auto ${
              isRacingMode ? 'top-16' : 'top-3'
            }`}
          >
            <button
              type="button"
              onClick={handleTriggerBoost}
              disabled={boostState.isActive || boostState.cooldownRemaining > 0}
              title="Nhấn Shift để tăng tốc gấp 2 lần trong 3 giây (Hồi chiêu 13 giây)"
              className={`flex flex-col gap-1 min-w-[168px] px-3 py-2 rounded-xl border shadow-xl text-left transition-all ${
                boostState.isActive
                  ? 'bg-cyan-950/95 border-cyan-400 text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.45)]'
                  : boostState.cooldownRemaining > 0
                  ? 'bg-slate-900/90 border-slate-700 text-slate-300 cursor-not-allowed'
                  : 'bg-slate-900/95 hover:bg-slate-800 border-amber-500/70 text-amber-200 hover:border-amber-400 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Zap
                    className={`w-3.5 h-3.5 ${
                      boostState.isActive
                        ? 'text-cyan-300 animate-pulse'
                        : boostState.cooldownRemaining > 0
                        ? 'text-slate-500'
                        : 'text-amber-400'
                    }`}
                  />
                  <span>
                    {boostState.isActive
                      ? 'TURBO x2 ĐANG BẬT'
                      : boostState.cooldownRemaining > 0
                      ? 'ĐANG HỒI CHIÊU'
                      : 'Tăng Tốc x2 [Shift]'}
                  </span>
                </span>
                <span className="font-mono text-[11px] tabular-nums">
                  {boostState.isActive
                    ? `${boostState.activeRemaining.toFixed(1)}s`
                    : boostState.cooldownRemaining > 0
                    ? `${boostState.cooldownRemaining.toFixed(1)}s`
                    : 'Sẵn sàng'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-75 ${
                    boostState.isActive
                      ? 'bg-gradient-to-r from-cyan-400 to-sky-300'
                      : boostState.cooldownRemaining > 0
                      ? 'bg-slate-500'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  }`}
                  style={{
                    width: `${
                      boostState.isActive
                        ? (boostState.activeRemaining / boostState.duration) * 100
                        : boostState.cooldownRemaining > 0
                        ? ((boostState.cooldownDuration - boostState.cooldownRemaining) /
                            boostState.cooldownDuration) *
                          100
                        : 100
                    }%`,
                  }}
                />
              </div>
            </button>
          </div>

          {/* In-Game Race HUD Overlay */}
          {isRacingMode && (
            <RaceHUD
              gameState={raceState}
              onRestart={() => handleStartRace(raceState.difficulty)}
              onExitRace={handleExitRace}
            />
          )}

          {/* Top-Left Non-Overlapping Column: Active Component Card + Quick Strip (Hidden during race) */}
          {!isRacingMode && (
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 pointer-events-none max-h-[calc(100%-125px)]">
              {/* Active Component Floating Card with Part Photo */}
              {activeComponent && (
                <div className="pointer-events-auto bg-slate-900/95 border-2 border-cyan-500/80 rounded-2xl p-3 shadow-2xl max-w-md text-slate-100 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full ring-2 ring-white/20 flex-shrink-0"
                        style={{ backgroundColor: activeComponent.highlightColor }}
                      ></span>
                      <span className="font-bold text-sm text-white tracking-tight truncate">
                        {activeComponent.name}
                      </span>
                    </div>
                    <span className="badge bg-cyan-950 text-cyan-300 border border-cyan-700/80 text-[10px] px-2 py-0.5 flex-shrink-0">
                      {activeComponent.categoryLabel}
                    </span>
                  </div>

                  {/* Hình ảnh bộ phận + Tác dụng chính */}
                  <div className="flex items-stretch gap-2.5 my-1.5">
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <ComponentPartImage
                        region={activeComponent.imageRegion}
                        className="w-24 h-24 shadow-md"
                        onClick={() => setDetailModalComp(activeComponent)}
                        title="Nhấn để phóng to hình ảnh và xem thông số chi tiết"
                      />
                      <button
                        onClick={() => setDetailModalComp(activeComponent)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                      >
                        <ImageIcon className="w-3 h-3" />
                        Phóng to ảnh
                      </button>
                    </div>

                    <div className="flex-1 p-2 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-0.5">
                          Tác dụng chính:
                        </div>
                        <p className="text-xs text-slate-200 mb-0 leading-relaxed font-normal line-clamp-4">
                          {activeComponent.functionSummary}
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1.5 pt-1 border-t border-slate-800/80">
                        {activeComponent.voltage}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 text-[11px]">
                    <span className="text-slate-400 text-[10px] truncate max-w-[170px]">
                      {activeComponent.imageRegion.label}
                    </span>
                    <button
                      onClick={() => setDetailModalComp(activeComponent)}
                      className="btn btn-sm btn-outline-info text-[11px] py-1 px-2.5 font-bold d-flex items-center gap-1 shadow-sm flex-shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Chi Tiết & Ảnh
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Component Selection Strip */}
              <div className="hidden md:flex flex-col gap-1 pointer-events-auto overflow-y-auto pr-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1 mb-0.5">
                  Chọn nhanh bộ phận (xem ảnh & 3D):
                </span>
                {ROBOT_COMPONENTS.map((comp) => {
                  const isSelected = selectedId === comp.id;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => handleSelectComponent(comp.id)}
                      className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-600/95 text-white shadow-md border border-cyan-400/60'
                          : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: comp.highlightColor }}
                      ></span>
                      <span className="truncate max-w-[165px]">{comp.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sleek Collapsible Bottom Dock (pinned bottom-center, <= 15% footprint) */}
          <ControlDock
            explodeProgress={explodeProgress}
            onExplodeChange={handleExplodeChange}
            isLidarActive={isLidarActive}
            onToggleLidar={handleToggleLidar}
            onCameraPreset={handleCameraPreset}
            isVehiclePov={isVehiclePov}
            onToggleVehiclePov={handleToggleVehiclePov}
            onDriveInput={handleDriveInput}
            driveState={driveState}
            boostState={boostState}
            onTriggerBoost={handleTriggerBoost}
            onResetRobot={handleResetRobot}
            onTakeScreenshot={handleTakeScreenshot}
            isRacingMode={isRacingMode}
            onStartRace={() => handleStartRace('medium')}
            onExitRace={handleExitRace}
            autoCode={autoCode}
            onAutoCodeChange={(nextCode) => {
              setAutoCode(nextCode);
              if (codeError) setCodeError(null);
            }}
            isCodeRunning={isCodeRunning}
            onToggleRunCode={handleToggleRunCode}
            codeError={codeError}
            codeLog={codeLog}
            autoSensors={autoSensors}
            activeTab={activeDockTab}
            onTabChange={setActiveDockTab}
            isCollapsed={isDockCollapsed}
            onCollapsedChange={setIsDockCollapsed}
          />
        </div>

        {/* Right / Separate Bootstrap Table Viewport */}
        <div
          className={`h-full overflow-y-auto p-4 bg-slate-950 transition-all duration-300 ${
            viewMode === 'table_full'
              ? 'w-full max-w-6xl mx-auto'
              : viewMode === 'split'
              ? 'w-full lg:w-5/12 xl:w-2/5 border-l border-slate-800'
              : 'hidden'
          }`}
        >
          {/* Race Banner Card in Split View */}
          <div className="card bg-gradient-to-r from-red-950/60 to-amber-950/60 border border-amber-600/50 text-white mb-4 shadow-lg rounded-xl overflow-hidden">
            <div className="card-body p-4 flex items-center justify-between gap-3">
              <div>
                <h6 className="card-title fw-bold text-amber-300 mb-1 d-flex items-center gap-2 text-sm">
                  <span>🏁</span> Thử Thách Đua Xe Vượt Chướng Ngại Vật
                </h6>
                <p className="card-text text-slate-300 text-xs mb-0">
                  Lái robot né cọc tiêu, thùng phuy và robot tuần tra để cán đích nhanh nhất!
                </p>
              </div>
              <button
                onClick={() => handleStartRace('medium')}
                className="btn btn-warning btn-sm font-bold text-xs text-slate-950 whitespace-nowrap px-3 py-2 shadow"
              >
                Chơi Ngay ➔
              </button>
            </div>
          </div>

          {/* Architecture Overview Card */}
          <div className="card bg-slate-900 border-slate-800 text-white mb-4 shadow-md rounded-xl overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex items-center justify-between mb-2">
                <h6 className="card-title fw-bold text-cyan-400 mb-0 d-flex items-center gap-2 text-sm">
                  <Compass className="w-4 h-4" />
                  Kiến Trúc Tự Hành Differential Drive (AMR)
                </h6>
                <span className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px]">
                  ROS2 Navigation Ready
                </span>
              </div>
              <p className="card-text text-slate-300 text-xs mb-3 leading-relaxed">
                Robot sử dụng vi xử lý <strong>NVIDIA Jetson Nano</strong> làm bộ não trung tâm, kết hợp dữ liệu quét không gian 360° từ <strong>RPLIDAR</strong> và hình ảnh độ trễ thấp từ <strong>Camera CSI</strong>. Hai động cơ DC giảm tốc vi sai điều khiển qua mạch cầu H cho phép xoay 360° tại chỗ với bánh xe xoay tự do (caster) giữ cân bằng ổn định.
              </p>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Cơ chế lái</div>
                  <div className="font-bold text-white text-[11px]">Vi sai 2 bánh (2WD)</div>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Cảm biến SLAM</div>
                  <div className="font-bold text-red-400 text-[11px]">RPLIDAR Laser 12m</div>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Tăng tốc AI</div>
                  <div className="font-bold text-emerald-400 text-[11px]">128 GPU Cores</div>
                </div>
              </div>
            </div>
          </div>

          {/* Requested Bootstrap Analysis Table */}
          <ComponentTable
            selectedId={selectedId}
            onSelectComponent={(id) => {
              handleSelectComponent(id);
              if (viewMode === 'table_full') {
                setViewMode('split');
              }
            }}
            onOpenDetailModal={(comp) => setDetailModalComp(comp)}
          />

          {/* System Block Diagram Guide */}
          <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
            <h6 className="font-bold text-white mb-2 flex items-center gap-1.5 text-xs">
              <Cpu className="w-4 h-4 text-purple-400" />
              Sơ Đồ Kết Nối Hệ Thống (System Dataflow)
            </h6>
            <div className="space-y-1.5 font-mono text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">Camera CSI</span>
                <span>──[MIPI-CSI2]──►</span>
                <span className="text-emerald-400 font-bold">Jetson Nano (AI Vision)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400">RPLIDAR</span>
                <span>──[UART/USB]──►</span>
                <span className="text-emerald-400 font-bold">Jetson Nano (SLAM 2D)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">Jetson Nano</span>
                <span>──[PWM / GPIO]──►</span>
                <span className="text-purple-400">Mạch Driver</span>
                <span>──[12V Power]──►</span>
                <span className="text-yellow-400">2 Động Cơ DC</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-400">Anten Wi-Fi</span>
                <span>──[SMA/IPEX]──►</span>
                <span className="text-slate-300">Máy Trạm Điều Khiển (Remote ROS2 PC)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Modals */}
      <ComponentDetailModal
        component={detailModalComp}
        onClose={() => setDetailModalComp(null)}
        onInspect3D={(id) => {
          handleSelectComponent(id);
          if (viewMode === 'table_full') {
            setViewMode('split');
          }
        }}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
