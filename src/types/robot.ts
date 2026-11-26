export type ComponentId =
  | 'jetson_nano'
  | 'rplidar'
  | 'camera_csi'
  | 'dc_motors'
  | 'drive_wheels'
  | 'caster_wheel'
  | 'motor_driver'
  | 'wifi_antennas'
  | 'robot_chassis';

export type SubsystemCategory = 'all' | 'compute_ai' | 'sensors' | 'actuation_motion' | 'power_structure';

export interface PartImageRegion {
  x: number;
  y: number;
  w: number;
  h: number;
  kitNumber: string;
  label: string;
}

export interface RobotComponentInfo {
  id: ComponentId;
  name: string;
  vietnameseName: string;
  category: SubsystemCategory;
  categoryLabel: string;
  functionSummary: string; // Chức năng gọn gàng theo yêu cầu
  detailedRole: string; // Phân tích vai trò kỹ thuật
  specs: {
    label: string;
    value: string;
  }[];
  interfaces: string; // Giao tiếp (I2C, SPI, UART, PWM, CSI, MIPI...)
  voltage: string;
  rosPackage: string; // Package điều khiển trong ROS / ROS2
  importance: 'Bắt buộc' | 'Trọng yếu' | 'Cần thiết';
  highlightColor: string; // Màu sắc nổi bật khi tương tác 3D
  imageRegion: PartImageRegion;
  extraRegions?: PartImageRegion[];
  realPhoto: string;
}

export interface DriveState {
  linearVelocity: number; // m/s
  angularVelocity: number; // rad/s
  leftWheelSpeed: number; // rpm
  rightWheelSpeed: number; // rpm
  heading: number; // degrees
  distanceTraveled: number; // meters
}

export interface BoostState {
  isActive: boolean;
  activeRemaining: number; // seconds remaining of 2x boost (max 3s)
  cooldownRemaining: number; // seconds remaining until ready (max 13s)
  duration: number; // 3s
  cooldownDuration: number; // 13s
}

export type GameStatus = 'idle' | 'countdown' | 'racing' | 'victory' | 'crashed' | 'timeout';

export interface RaceGameState {
  status: GameStatus;
  timeElapsed: number; // seconds
  timeLimit: number; // seconds
  health: number; // 0 - 100
  score: number;
  currentCheckpoint: number; // 0 to total
  totalCheckpoints: number;
  collisions: number;
  countdownNumber: number; // 3, 2, 1, 0
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ObstacleData {
  id: string;
  type: 'box' | 'cone' | 'barrier' | 'barrel' | 'moving_drone';
  x: number;
  z: number;
  radius: number;
  height: number;
  name: string;
  isMoving?: boolean;
  moveRange?: number;
  moveSpeed?: number;
  moveAxis?: 'x' | 'z';
}

export interface AutonomousSensors {
  front: number;
  frontLeft: number;
  frontRight: number;
  left: number;
  right: number;
  x: number;
  z: number;
  headingRad: number;
  headingDeg: number;
  time: number;
}
