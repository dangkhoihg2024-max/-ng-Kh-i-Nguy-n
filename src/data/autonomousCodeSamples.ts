export interface AutonomousCodeSample {
  id: string;
  title: string;
  description: string;
  code: string;
}

export const AUTONOMOUS_CODE_SAMPLES: AutonomousCodeSample[] = [
  {
    id: 'lidar_avoidance',
    title: 'Mẫu 1: Tự hành né vật cản (LiDAR)',
    description: 'Dùng cảm biến trước/trái/phải để tự né chướng ngại vật và chạy tới đích (z = 68m).',
    code: `// Điều khiển tự động né chướng ngại vật bằng LiDAR tới vạch Đích (z = 68m)
if (sensors.z >= 69) {
  robot.stop();
  robot.log("Đã cán đích an toàn!");
} else if (sensors.front < 2.3 || sensors.frontLeft < 1.75 || sensors.frontRight < 1.75) {
  // Phát hiện vật cản phía trước -> rẽ sang hướng thoáng hơn
  const forwardSpeed = sensors.front < 1.3 ? 0.15 : 0.48;
  if (sensors.frontLeft >= sensors.frontRight) {
    robot.move(forwardSpeed, 0.85); // Né sang trái
    robot.log("Né trái | Trước: " + sensors.front + "m");
  } else {
    robot.move(forwardSpeed, -0.85); // Né sang phải
    robot.log("Né phải | Trước: " + sensors.front + "m");
  }
} else {
  // Đường thoáng -> bám về giữa làn (x = 0) và tiến thẳng
  const steer = -sensors.x * 0.1 - sensors.headingRad * 0.85;
  robot.move(0.95, Math.max(-0.7, Math.min(0.7, steer)));
  robot.log("Đang tiến thẳng | Z = " + sensors.z.toFixed(1) + "m");
}`,
  },
  {
    id: 'zigzag_patrol',
    title: 'Mẫu 2: Chạy Zig-Zag theo thời gian',
    description: 'Di chuyển theo kịch bản định sẵn: tiến thẳng 2 giây -> rẽ trái -> tiến -> rẽ phải.',
    code: `// Kịch bản di chuyển tự động theo chu kỳ 6 giây
const t = sensors.time % 6;

if (sensors.front < 1.4) {
  robot.turnLeft(0.85);
  robot.log("Gặp vật cản -> tự xoay tránh!");
} else if (t < 2.0) {
  robot.forward(0.75);
  robot.log("Bước 1: Tiến thẳng");
} else if (t < 2.9) {
  robot.turnLeft(0.75);
  robot.log("Bước 2: Rẽ trái");
} else if (t < 4.9) {
  robot.forward(0.75);
  robot.log("Bước 3: Tiến thẳng");
} else {
  robot.turnRight(0.75);
  robot.log("Bước 4: Rẽ phải");
}`,
  },
  {
    id: 'spin_and_go',
    title: 'Mẫu 3: Xoay quét 360° tìm đường thoáng',
    description: 'Xoay vi sai tại chỗ để quét đường, khi phía trước thoáng > 4m và đúng hướng sẽ lao tới.',
    code: `// Xoay tròn tại chỗ quét LiDAR, chỉ chạy thẳng khi phía trước thoáng
if (sensors.front > 4.0 && Math.abs(sensors.headingDeg) < 30) {
  robot.forward(0.85);
  robot.log("Đường thoáng (" + sensors.front + "m) -> Tăng tốc!");
} else {
  robot.move(0.0, 0.75); // Xoay tròn tại chỗ (Differential Spin)
  robot.log("Đang xoay quét... Góc: " + sensors.headingDeg + "°");
}`,
  },
];
