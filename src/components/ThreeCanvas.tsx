import React, { useEffect, useRef } from 'react';
import { RobotSceneManager } from '../three/SceneManager';
import { BoostState, ComponentId, DriveState, RaceGameState } from '../types/robot';

interface ThreeCanvasProps {
  onSelectComponent: (id: ComponentId | null) => void;
  onHoverComponent: (id: ComponentId | null) => void;
  onDriveUpdate: (state: DriveState) => void;
  onLidarPointUpdate: (points: { angle: number; distance: number }[]) => void;
  onGameStateUpdate?: (state: RaceGameState) => void;
  onCameraModeChange?: (isVehiclePov: boolean) => void;
  onObstacleProximityChange?: (isNear: boolean) => void;
  onBoostUpdate?: (state: BoostState) => void;
  sceneManagerRef: React.MutableRefObject<RobotSceneManager | null>;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  onSelectComponent,
  onHoverComponent,
  onDriveUpdate,
  onLidarPointUpdate,
  onGameStateUpdate,
  onCameraModeChange,
  onObstacleProximityChange,
  onBoostUpdate,
  sceneManagerRef,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const manager = new RobotSceneManager({
      container: mountRef.current,
      onSelectComponent,
      onHoverComponent,
      onDriveUpdate,
      onLidarPointUpdate,
      onGameStateUpdate,
      onCameraModeChange,
      onObstacleProximityChange,
      onBoostUpdate,
    });

    sceneManagerRef.current = manager;

    return () => {
      manager.destroy();
      sceneManagerRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative overflow-hidden select-none bg-slate-950"
      style={{ touchAction: 'none' }}
    />
  );
};
