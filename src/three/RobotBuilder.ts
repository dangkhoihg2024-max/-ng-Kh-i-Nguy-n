import * as THREE from 'three';
import { ComponentId } from '../types/robot';

export interface RobotPartsMap {
  baseChassis: THREE.Group;
  leftMotor: THREE.Group;
  rightMotor: THREE.Group;
  leftWheel: THREE.Group;
  rightWheel: THREE.Group;
  rearCaster: THREE.Group;
  lowerStandoffs: THREE.Group;
  middleDeck: THREE.Group;
  batteryPack: THREE.Group;
  jetsonNano: THREE.Group;
  motorDriver: THREE.Group;
  coolingFan: THREE.Group;
  csiCamera: THREE.Group;
  cameraTiltJoint: THREE.Group;
  cameraRibbon: THREE.Mesh;
  wifiAntennas: THREE.Group;
  upperStandoffs: THREE.Group;
  topDeck: THREE.Group;
  lidarPulleyMotor: THREE.Group;
  rplidar: THREE.Group;
  lidarTurret: THREE.Group;
  lidarLaserBeam: THREE.Group;
  ethernetCable: THREE.Group;
  uartCable: THREE.Group;
}

export interface BuildRobotResult {
  rootGroup: THREE.Group;
  partsMap: RobotPartsMap;
  componentGroups: Map<ComponentId, THREE.Object3D[]>;
  updateExplode: (progress: number) => void;
  updateWheelRotation: (leftRad: number, rightRad: number) => void;
  updateLidarRotation: (angle: number) => void;
  setFanSpeed: (rpm: number) => void;
}

// Procedural Texture Generators
function createTireTreadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#17191d';
  ctx.fillRect(0, 0, 512, 128);

  // Rugged off-road block treads (matches actual JetBot tire in photos)
  ctx.fillStyle = '#0f1115';
  for (let x = 0; x < 512; x += 32) {
    // V-shaped interlocking tread blocks
    ctx.beginPath();
    ctx.moveTo(x + 4, 10);
    ctx.lineTo(x + 22, 64);
    ctx.lineTo(x + 4, 118);
    ctx.lineTo(x + 12, 118);
    ctx.lineTo(x + 30, 64);
    ctx.lineTo(x + 12, 10);
    ctx.closePath();
    ctx.fill();

    // Side grip sipes
    ctx.fillRect(x + 16, 2, 8, 8);
    ctx.fillRect(x + 16, 118, 8, 8);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  return texture;
}

function createJetsonCarrierBoardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Matte black PCB (WaveShare / Jetson Carrier)
  ctx.fillStyle = '#11141a';
  ctx.fillRect(0, 0, 1024, 1024);

  // Surface traces
  ctx.strokeStyle = '#1e2530';
  ctx.lineWidth = 2;
  for (let i = 40; i < 980; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 20);
    ctx.lineTo(i + 30, 1000);
    ctx.stroke();
  }

  // Gold surface mount pads
  ctx.fillStyle = '#c7b275';
  for (let r = 0; r < 24; r++) {
    const rx = 100 + (r % 6) * 140;
    const ry = 100 + Math.floor(r / 6) * 220;
    ctx.fillRect(rx, ry, 12, 8);
  }

  // White silkscreen text
  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  ctx.fillText('Waveshare JetBot Expansion Rev 2.1', 80, 80);
  ctx.fillText('NVIDIA JETSON NANO 4GB', 80, 120);

  ctx.font = '18px monospace';
  ctx.fillText('POWER [DC 12V 3A]', 80, 920);
  ctx.fillText('PWR SWITCH', 540, 920);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createGreenAnodizedTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Metallic lime-green anodized base
  ctx.fillStyle = '#489828';
  ctx.fillRect(0, 0, 512, 512);

  // Brushed aluminum micro-streaks
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const len = 15 + Math.random() * 35;
    ctx.strokeStyle = Math.random() > 0.5 ? '#5ab834' : '#38781e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createCameraRibbonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // White glossy flexible cable
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 256, 1024);

  // Fine conductive copper lanes
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 4;
  for (let x = 20; x < 240; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }

  // Cyan silkscreen text "AWM 20706 105C 60V VW-1" (exactly as seen in photo!)
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 22px monospace';
  for (let y = -220; y < -20; y += 45) {
    ctx.fillText('AWM 20706 105C 60V VW-1', -900, y);
    ctx.fillText('AWM 20706 105C 60V VW-1', -450, y);
  }
  ctx.restore();

  // Blue stiffener reinforcement at connector end
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 960, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createOledScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#05080f';
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = '#0ea5e9';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 120);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('JETBOT AMR v2.1', 18, 36);
  ctx.fillStyle = '#e0f2fe';
  ctx.font = '18px monospace';
  ctx.fillText('IP: 192.168.1.45', 18, 70);
  ctx.fillStyle = '#34d399';
  ctx.fillText('BAT: 12.4V [96%]', 18, 102);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createQrDongleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Green PCB solder mask
  ctx.fillStyle = '#15803d';
  ctx.fillRect(0, 0, 256, 256);

  // Copper trace lines
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(20, 40);
  ctx.lineTo(70, 90);
  ctx.lineTo(70, 210);
  ctx.moveTo(230, 50);
  ctx.lineTo(190, 90);
  ctx.lineTo(190, 200);
  ctx.stroke();

  // White QR sticker square in center (as seen in rear photo)
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(78, 78, 100, 100);
  ctx.fillStyle = '#0f172a';
  const cell = 10;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const isCorner = (r < 3 && c < 3) || (r < 3 && c > 4) || (r > 4 && c < 3);
      if (isCorner || (r * 7 + c * 3) % 2 === 0) {
        ctx.fillRect(88 + c * cell, 88 + r * cell, cell - 1, cell - 1);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function buildRobotModel(): BuildRobotResult {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'JetBotAutonomousRobot';

  const componentGroups = new Map<ComponentId, THREE.Object3D[]>();

  function registerPart(id: ComponentId, obj: THREE.Object3D) {
    if (!componentGroups.has(id)) {
      componentGroups.set(id, []);
    }
    componentGroups.get(id)!.push(obj);
    obj.userData.componentId = id;
  }

  // ==========================================
  // PBR MATERIALS ACCORDING TO ACTUAL PHOTOS
  // ==========================================

  // 1. Vibrant Anodized Green Aluminum Chassis & Bracket (Photos #1, #2, #3, #4)
  const greenAnodizedMaterial = new THREE.MeshStandardMaterial({
    color: 0x4aa32b,
    roughness: 0.32,
    metalness: 0.75,
    map: createGreenAnodizedTexture(),
  });

  // 2. High-Gloss Metallic Blue Rim (Deep chrome blue reflection as in photos)
  const chromeBlueRimMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.12,
    metalness: 0.92,
  });

  // 3. Heavy-Duty Rubber Tire with Tread Pattern
  const ruggedTireMaterial = new THREE.MeshStandardMaterial({
    color: 0x141619,
    roughness: 0.88,
    metalness: 0.08,
    bumpMap: createTireTreadTexture(),
    bumpScale: 0.05,
  });

  // 4. Black Matte Acrylic Decks & Carrier Boards
  const blackPcbDeckMaterial = new THREE.MeshStandardMaterial({
    color: 0x181a1f,
    roughness: 0.42,
    metalness: 0.25,
    map: createJetsonCarrierBoardTexture(),
  });

  const blackAcrylicDeckMaterial = new THREE.MeshStandardMaterial({
    color: 0x111317,
    roughness: 0.25,
    metalness: 0.15,
  });

  // 5. Brass Hex Standoffs
  const brassStandoffMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.28,
    metalness: 0.88,
  });

  // 6. Chrome & Polished Steel (Rear caster, screws, RJ45)
  const chromeMetalMaterial = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.18,
    metalness: 0.92,
  });

  // 7. Jetson Heatsink Cast Aluminum Fins
  const heatsinkMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f1115,
    roughness: 0.45,
    metalness: 0.75,
  });

  // 8. Flat White Ribbon Cable
  const ribbonCableMaterial = new THREE.MeshStandardMaterial({
    map: createCameraRibbonTexture(),
    roughness: 0.5,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  // 9. RPLIDAR Matte Black Cylindrical Shell
  const lidarBodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x14161a,
    roughness: 0.35,
    metalness: 0.55,
  });

  // Flat Blue Ethernet Cable Material
  const flatBlueCableMaterial = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.4,
    metalness: 0.1,
  });

  // Base dimensions
  const CHASSIS_RADIUS = 1.35; // Rộng hơn một chút để bánh xe nằm gọn trong hốc
  const WHEEL_RADIUS = 0.44; // Bánh xe lớn hơn theo ảnh
  const CHASSIS_Y = WHEEL_RADIUS * 0.9;

  // ==========================================
  // 1. SÀN ĐẾ NHÔM ANOD XANH LÁ (CHASSIS PLATE)
  // Đối xứng bo tròn cả phía trước lẫn phía sau với 2 hốc cắt bánh xe hai bên (theo ảnh thật)
  // ==========================================
  const baseChassis = new THREE.Group();
  baseChassis.name = 'BaseChassis_AnodizedGreen';

  const chassisR = 1.32;
  const arcOffset = 0.15;
  const notchHalfZ = 0.46; // |z| where wheel cutout meets outer rim
  const dy = notchHalfZ - arcOffset; // 0.31
  const startAngle = Math.asin(dy / chassisR);

  // Outer contour with integrated left & right wheel cutouts (no self-intersecting holes)
  const chassisShape = new THREE.Shape();
  // Front rounded half-circle (+Y in 2D -> +Z in 3D)
  chassisShape.absarc(0, arcOffset, chassisR, startAngle, Math.PI - startAngle, false);
  // Right (-X) wheel notch
  chassisShape.lineTo(-0.90, notchHalfZ);
  chassisShape.lineTo(-0.90, -notchHalfZ);
  chassisShape.lineTo(-Math.sqrt(chassisR * chassisR - dy * dy), -notchHalfZ);
  // Rear rounded half-circle (-Y in 2D -> -Z in 3D)
  chassisShape.absarc(0, -arcOffset, chassisR, Math.PI + startAngle, Math.PI * 2 - startAngle, false);
  // Left (+X) wheel notch
  chassisShape.lineTo(0.90, -notchHalfZ);
  chassisShape.lineTo(0.90, notchHalfZ);
  chassisShape.closePath();

  const extrudeSettings = { depth: 0.035, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.015, bevelThickness: 0.01 };
  const chassisGeo = new THREE.ExtrudeGeometry(chassisShape, extrudeSettings);
  chassisGeo.rotateX(Math.PI / 2); // Lay flat on ground

  const chassisMesh = new THREE.Mesh(chassisGeo, greenAnodizedMaterial);
  chassisMesh.castShadow = true;
  chassisMesh.receiveShadow = true;
  baseChassis.add(chassisMesh);

  // Mounting screws across chassis (including the 4 rear caster bolts visible in rear photo)
  const screwPositions = [
    [-0.35, 0.85], [0.35, 0.85], [0, 1.18],
    [-0.55, 0.2], [0.55, 0.2],
    [-0.14, -0.92], [0.14, -0.92], [-0.14, -1.14], [0.14, -1.14]
  ];
  screwPositions.forEach(([sx, sz]) => {
    const sGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.024, 12);
    const sMesh = new THREE.Mesh(sGeo, chromeMetalMaterial);
    sMesh.position.set(sx, 0.018, sz);
    baseChassis.add(sMesh);
  });

  baseChassis.position.set(0, CHASSIS_Y, 0);
  rootGroup.add(baseChassis);
  registerPart('robot_chassis', baseChassis);

  // ==========================================
  // 2. HAI BÁNH XE THỂ THAO MÂM ĐÚC XANH CROM (WHEELS)
  // Trong ảnh: Mâm đúc 10 chấu xoắn kép màu xanh dương chrome bóng loáng, ốc siết tâm
  // ==========================================
  function createJetBotWheel(isLeft: boolean): THREE.Group {
    const wheelGroup = new THREE.Group();
    wheelGroup.name = isLeft ? 'LeftJetBotWheel' : 'RightJetBotWheel';

    const width = 0.24;

    // 1. Off-road Rubber Tire with bump tread
    const tireGeo = new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, width, 36);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, ruggedTireMaterial);
    tire.castShadow = true;
    wheelGroup.add(tire);

    // 2. Deep dish outer rim shell
    const outerRimGeo = new THREE.CylinderGeometry(WHEEL_RADIUS * 0.78, WHEEL_RADIUS * 0.78, width + 0.005, 32);
    outerRimGeo.rotateZ(Math.PI / 2);
    const outerRim = new THREE.Mesh(outerRimGeo, chromeBlueRimMaterial);
    wheelGroup.add(outerRim);

    // 3. Multi-spoke chrome blue sport wheel face (10 spokes)
    const spokeCount = 10;
    const spokeR = WHEEL_RADIUS * 0.68;
    const faceX = isLeft ? width / 2 + 0.005 : -width / 2 - 0.005;

    for (let i = 0; i < spokeCount; i++) {
      const angle = (i * Math.PI * 2) / spokeCount;
      const spokeGeo = new THREE.BoxGeometry(0.03, spokeR * 0.85, 0.035);
      const spoke = new THREE.Mesh(spokeGeo, chromeBlueRimMaterial);
      spoke.position.set(faceX, Math.cos(angle) * (spokeR * 0.45), Math.sin(angle) * (spokeR * 0.45));
      spoke.rotation.x = angle;
      wheelGroup.add(spoke);
    }

    // Center hub cap & hex locking screw
    const hubCapGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.05, 16);
    hubCapGeo.rotateZ(Math.PI / 2);
    const hubCap = new THREE.Mesh(hubCapGeo, chromeBlueRimMaterial);
    hubCap.position.x = faceX;
    wheelGroup.add(hubCap);

    // Center zinc screw
    const screwGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.06, 6);
    screwGeo.rotateZ(Math.PI / 2);
    const screw = new THREE.Mesh(screwGeo, chromeMetalMaterial);
    screw.position.x = faceX + (isLeft ? 0.01 : -0.01);
    wheelGroup.add(screw);

    return wheelGroup;
  }

  const leftWheel = createJetBotWheel(true);
  leftWheel.position.set(1.12, WHEEL_RADIUS, 0);
  rootGroup.add(leftWheel);
  registerPart('drive_wheels', leftWheel);

  const rightWheel = createJetBotWheel(false);
  rightWheel.position.set(-1.12, WHEEL_RADIUS, 0);
  rootGroup.add(rightWheel);
  registerPart('drive_wheels', rightWheel);

  // ==========================================
  // 3. HAI ĐỘNG CƠ DC GIẢM TỐC (dc_motors)
  // Gắn bên dưới sàn đế truyền lực ra 2 bánh
  // ==========================================
  function createDCMotor(isLeft: boolean): THREE.Group {
    const motorGroup = new THREE.Group();
    motorGroup.name = isLeft ? 'LeftMotor' : 'RightMotor';

    // Metal Gearbox
    const gbGeo = new THREE.BoxGeometry(0.28, 0.22, 0.25);
    const gb = new THREE.Mesh(gbGeo, chromeMetalMaterial);
    gb.castShadow = true;
    motorGroup.add(gb);

    // Motor canister
    const canGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.36, 24);
    canGeo.rotateZ(Math.PI / 2);
    const can = new THREE.Mesh(canGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.3 }));
    can.position.set(isLeft ? -0.28 : 0.28, 0, 0);
    motorGroup.add(can);

    // Output shaft
    const shaftGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.18, 16);
    shaftGeo.rotateZ(Math.PI / 2);
    const shaft = new THREE.Mesh(shaftGeo, brassStandoffMaterial);
    shaft.position.set(isLeft ? 0.2 : -0.2, 0, 0);
    motorGroup.add(shaft);

    return motorGroup;
  }

  const leftMotor = createDCMotor(true);
  leftMotor.position.set(0.72, CHASSIS_Y - 0.16, 0);
  rootGroup.add(leftMotor);
  registerPart('dc_motors', leftMotor);

  const rightMotor = createDCMotor(false);
  rightMotor.position.set(-0.72, CHASSIS_Y - 0.16, 0);
  rootGroup.add(rightMotor);
  registerPart('dc_motors', rightMotor);

  // ==========================================
  // 4. BÁNH XE XOAY TỰ DO PHÍA SAU (CASTER WHEEL)
  // Trong ảnh #2: Bánh xe xoay tự do gắn dưới đuôi sau bo tròn, có tấm đế vuông bắt 4 ốc,
  // gá kim loại dập hình chữ U mạ kẽm và bánh lăn cao su xám lõi trắng
  // ==========================================
  const rearCaster = new THREE.Group();
  rearCaster.name = 'RearSwivelCaster';

  // Rectangular mounting plate bolted under rear chassis
  const casterMountGeo = new THREE.BoxGeometry(0.34, 0.025, 0.30);
  const casterMount = new THREE.Mesh(casterMountGeo, chromeMetalMaterial);
  casterMount.position.y = CHASSIS_Y - 0.04;
  rearCaster.add(casterMount);

  // Swivel bearing raceway collar
  const casterTopGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.045, 24);
  const casterTop = new THREE.Mesh(casterTopGeo, chromeMetalMaterial);
  casterTop.position.y = CHASSIS_Y - 0.07;
  rearCaster.add(casterTop);

  // Heavy stamped metal fork (U-bracket swept slightly backward)
  const forkBaseGeo = new THREE.BoxGeometry(0.24, 0.03, 0.16);
  const forkBase = new THREE.Mesh(forkBaseGeo, chromeMetalMaterial);
  forkBase.position.set(0, 0.29, -0.02);
  rearCaster.add(forkBase);

  const forkArmGeo = new THREE.BoxGeometry(0.035, 0.22, 0.12);
  const forkLeft = new THREE.Mesh(forkArmGeo, chromeMetalMaterial);
  forkLeft.position.set(-0.105, 0.20, -0.06);
  forkLeft.rotation.x = 0.25;
  rearCaster.add(forkLeft);

  const forkRight = new THREE.Mesh(forkArmGeo, chromeMetalMaterial);
  forkRight.position.set(0.105, 0.20, -0.06);
  forkRight.rotation.x = 0.25;
  rearCaster.add(forkRight);

  // Grey caster wheel roller + white inner hub (matches photo #2)
  const rollerGeo = new THREE.CylinderGeometry(0.145, 0.145, 0.15, 24);
  rollerGeo.rotateZ(Math.PI / 2);
  const roller = new THREE.Mesh(rollerGeo, new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.65 }));
  roller.position.set(0, 0.145, -0.08);
  roller.castShadow = true;
  rearCaster.add(roller);

  const rollerHubGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.156, 20);
  rollerHubGeo.rotateZ(Math.PI / 2);
  const rollerHub = new THREE.Mesh(rollerHubGeo, new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35 }));
  rollerHub.position.set(0, 0.145, -0.08);
  rearCaster.add(rollerHub);

  // Roller axle pin & hex nut
  const pinGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.27, 12);
  pinGeo.rotateZ(Math.PI / 2);
  const pin = new THREE.Mesh(pinGeo, chromeMetalMaterial);
  pin.position.set(0, 0.145, -0.08);
  rearCaster.add(pin);

  rearCaster.position.set(0, 0, -1.03);
  rootGroup.add(rearCaster);
  registerPart('caster_wheel', rearCaster);

  // ==========================================
  // 5. TRỤ ĐỒNG TẦNG DƯỚI (LOWER STANDOFFS)
  // 4 trụ đồng lục giác đỡ bo mạch mở rộng JetBot
  // ==========================================
  const lowerStandoffs = new THREE.Group();
  lowerStandoffs.name = 'LowerStandoffs';
  const LOWER_GAP = 0.42;

  const lowerPostCoords = [
    [-0.55, 0.48], [0.55, 0.48],
    [-0.55, -0.58], [0.55, -0.58]
  ];

  lowerPostCoords.forEach(([px, pz]) => {
    const postGeo = new THREE.CylinderGeometry(0.038, 0.038, LOWER_GAP, 6);
    const post = new THREE.Mesh(postGeo, brassStandoffMaterial);
    post.position.set(px, CHASSIS_Y + LOWER_GAP / 2, pz);
    post.castShadow = true;
    lowerStandoffs.add(post);
  });
  rootGroup.add(lowerStandoffs);
  registerPart('robot_chassis', lowerStandoffs);

  // ==========================================
  // 6. TẦNG GIỮA: BO MẠCH MỞ RỘNG JETBOT & KHỐI PIN
  // Trong ảnh #1, #2, #3: Bo mạch đen WaveShare Expansion Board có công tắc nguồn gạt (AI PWR),
  // giắc cắm DC, hàng chân cắm trắng, màn hình hiển thị OLED phía sau và dây nguồn pin
  // ==========================================
  const MIDDLE_Y = CHASSIS_Y + LOWER_GAP;
  const middleDeck = new THREE.Group();
  middleDeck.name = 'JetBotExpansionBoardDeck';

  // Expansion PCB
  const expPcbGeo = new THREE.BoxGeometry(1.36, 0.035, 1.35);
  const expPcb = new THREE.Mesh(expPcbGeo, blackPcbDeckMaterial);
  expPcb.castShadow = true;
  expPcb.receiveShadow = true;
  middleDeck.add(expPcb);

  // Power slide switch toggle (AI PWR) on rear-left (looking from rear)
  const switchMetalGeo = new THREE.BoxGeometry(0.16, 0.065, 0.09);
  const switchMetal = new THREE.Mesh(switchMetalGeo, chromeMetalMaterial);
  switchMetal.position.set(0.42, 0.045, -0.61);
  middleDeck.add(switchMetal);

  const switchKnobGeo = new THREE.BoxGeometry(0.055, 0.075, 0.06);
  const switchKnob = new THREE.Mesh(switchKnobGeo, new THREE.MeshStandardMaterial({ color: 0x09090b }));
  switchKnob.position.set(0.44, 0.052, -0.62);
  middleDeck.add(switchKnob);

  // DC Barrel Power Jack on rear-right (5.5x2.1mm jack visible in photo #2)
  const dcHousingGeo = new THREE.BoxGeometry(0.13, 0.11, 0.16);
  const dcHousing = new THREE.Mesh(dcHousingGeo, new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 }));
  dcHousing.position.set(-0.44, 0.065, -0.59);
  middleDeck.add(dcHousing);

  const dcBoreGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.03, 16);
  dcBoreGeo.rotateX(Math.PI / 2);
  const dcBore = new THREE.Mesh(dcBoreGeo, new THREE.MeshBasicMaterial({ color: 0x020617 }));
  dcBore.position.set(-0.44, 0.065, -0.665);
  middleDeck.add(dcBore);

  const dcPinGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.04, 10);
  dcPinGeo.rotateX(Math.PI / 2);
  const dcPin = new THREE.Mesh(dcPinGeo, brassStandoffMaterial);
  dcPin.position.set(-0.44, 0.065, -0.66);
  middleDeck.add(dcPin);

  // 0.91 inch OLED Display mounted along rear edge of WaveShare board (visible in photo #2)
  const oledBezelGeo = new THREE.BoxGeometry(0.42, 0.025, 0.18);
  const oledBezel = new THREE.Mesh(oledBezelGeo, new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3 }));
  oledBezel.position.set(0, 0.028, -0.56);
  middleDeck.add(oledBezel);

  const oledScreenGeo = new THREE.PlaneGeometry(0.36, 0.13);
  oledScreenGeo.rotateX(-Math.PI / 2);
  const oledScreen = new THREE.Mesh(oledScreenGeo, new THREE.MeshBasicMaterial({ map: createOledScreenTexture() }));
  oledScreen.position.set(0, 0.042, -0.56);
  middleDeck.add(oledScreen);

  // White 4-pin power connector underneath rear edge of expansion PCB
  const pwrPlugGeo = new THREE.BoxGeometry(0.16, 0.055, 0.09);
  const pwrPlug = new THREE.Mesh(pwrPlugGeo, new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 }));
  pwrPlug.position.set(0, -0.04, -0.58);
  middleDeck.add(pwrPlug);

  // Side buzzer/wheel & white JST headers on expansion board (+X & -X sides)
  const dialGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 20);
  const dial = new THREE.Mesh(dialGeo, new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 }));
  dial.position.set(0.56, 0.035, 0.45);
  middleDeck.add(dial);

  const sideJstGeo = new THREE.BoxGeometry(0.16, 0.05, 0.08);
  const sideJst = new THREE.Mesh(sideJstGeo, new THREE.MeshStandardMaterial({ color: 0xf1f5f9 }));
  sideJst.position.set(-0.62, 0.04, 0.12);
  middleDeck.add(sideJst);

  middleDeck.position.set(0, MIDDLE_Y, 0);
  rootGroup.add(middleDeck);
  registerPart('motor_driver', middleDeck);

  // Khay pin Lithium 18650 x3 (bọc vỏ xanh dương bên trong khay đen) & bó dây nguồn phía sau
  const batteryPack = new THREE.Group();
  batteryPack.name = 'BatteryPack3S';
  const battGeo = new THREE.BoxGeometry(0.92, 0.26, 0.68);
  const batt = new THREE.Mesh(battGeo, new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.6 }));
  batt.castShadow = true;
  batteryPack.add(batt);

  // 3x Blue-wrapped 18650 cells peeking through rear of tray (visible in photo #2)
  const cellMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.35, metalness: 0.15 });
  for (const cx of [-0.26, 0, 0.26]) {
    const cellGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.69, 18);
    cellGeo.rotateX(Math.PI / 2);
    const cell = new THREE.Mesh(cellGeo, cellMat);
    cell.position.set(cx, 0.02, -0.01);
    batteryPack.add(cell);
  }

  // Curled rear battery wiring harness (red/black/white cables from tray up to rear JST connector)
  const battWireColors = [0xef4444, 0x0f172a, 0xe2e8f0];
  battWireColors.forEach((col, idx) => {
    const xOff = (idx - 1) * 0.035;
    const bCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(xOff, 0.02, -0.34),
      new THREE.Vector3(xOff * 1.4 - 0.04, -0.06, -0.46),
      new THREE.Vector3(xOff, 0.08, -0.53),
    ]);
    const bWire = new THREE.Mesh(
      new THREE.TubeGeometry(bCurve, 14, 0.014, 6, false),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 })
    );
    batteryPack.add(bWire);
  });

  batteryPack.position.set(0, MIDDLE_Y - 0.16, -0.05);
  rootGroup.add(batteryPack);
  registerPart('robot_chassis', batteryPack);

  // ==========================================
  // 7. NVIDIA JETSON NANO + QUẠT TẢN NHIỆT (FAN)
  // Trong ảnh #1, #2, #3: Bo mạch Jetson Nano màu đen, tản nhiệt nhôm đen có gắn QUẠT TẢN NHIỆT (Cooling Fan)
  // 40mm với dây điện đỏ/đen/vàng nối xuống bo mạch
  // ==========================================
  const JETSON_Y = MIDDLE_Y + 0.06;
  const jetsonNano = new THREE.Group();
  jetsonNano.name = 'NVIDIA_Jetson_Nano_Board';

  // Jetson Nano PCB
  const jetsonPcbGeo = new THREE.BoxGeometry(0.92, 0.03, 0.76);
  const jetsonPcb = new THREE.Mesh(jetsonPcbGeo, blackPcbDeckMaterial);
  jetsonPcb.castShadow = true;
  jetsonNano.add(jetsonPcb);

  // Finned aluminum heatsink
  const hsGeo = new THREE.BoxGeometry(0.56, 0.12, 0.48);
  const hs = new THREE.Mesh(hsGeo, heatsinkMaterial);
  hs.position.set(0, 0.075, 0.04);
  hs.castShadow = true;
  jetsonNano.add(hs);

  // Heatsink fins
  for (let f = -0.2; f <= 0.2; f += 0.05) {
    const finGeo = new THREE.BoxGeometry(0.54, 0.16, 0.015);
    const fin = new THREE.Mesh(finGeo, heatsinkMaterial);
    fin.position.set(0, 0.16, 0.04 + f);
    jetsonNano.add(fin);
  }

  // Active 40mm Cooling Fan on top of Heatsink (Clearly visible in photos #1, #2, #3!)
  const coolingFan = new THREE.Group();
  coolingFan.name = 'JetsonCoolingFan';

  const fanFrameGeo = new THREE.BoxGeometry(0.48, 0.1, 0.48);
  const fanFrame = new THREE.Mesh(fanFrameGeo, new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 }));
  fanFrame.position.set(0, 0.28, 0.04);
  coolingFan.add(fanFrame);

  // Fan circular vent
  const ventGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.105, 24);
  const vent = new THREE.Mesh(ventGeo, new THREE.MeshStandardMaterial({ color: 0x09090b }));
  vent.position.set(0, 0.28, 0.04);
  coolingFan.add(vent);

  // Fan rotor blades
  const rotorGroup = new THREE.Group();
  rotorGroup.position.set(0, 0.28, 0.04);
  const hubGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16);
  const hub = new THREE.Mesh(hubGeo, new THREE.MeshStandardMaterial({ color: 0x222222 }));
  rotorGroup.add(hub);

  for (let b = 0; b < 7; b++) {
    const bAngle = (b * Math.PI * 2) / 7;
    const bladeGeo = new THREE.BoxGeometry(0.03, 0.02, 0.14);
    const blade = new THREE.Mesh(bladeGeo, new THREE.MeshStandardMaterial({ color: 0x111111 }));
    blade.position.set(Math.cos(bAngle) * 0.1, 0, Math.sin(bAngle) * 0.1);
    blade.rotation.y = bAngle + 0.4;
    rotorGroup.add(blade);
  }
  coolingFan.add(rotorGroup);

  // Fan wires (Red, Black, Yellow curled wires)
  const wireCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.22, 0.28, 0.15),
    new THREE.Vector3(0.28, 0.20, 0.22),
    new THREE.Vector3(0.25, 0.05, 0.25),
  ]);
  const wireGeo = new THREE.TubeGeometry(wireCurve, 12, 0.012, 6, false);
  const redWire = new THREE.Mesh(wireGeo, new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  coolingFan.add(redWire);

  jetsonNano.add(coolingFan);

  // Metal Connectors along Left Side (+X edge, matches photo #3!)
  // Jetson Nano DC jack + HDMI/DP stack + 2x USB 3.0 stacks + RJ45 Ethernet
  const jetsonDcGeo = new THREE.BoxGeometry(0.14, 0.11, 0.11);
  const jetsonDc = new THREE.Mesh(jetsonDcGeo, new THREE.MeshStandardMaterial({ color: 0x0f172a }));
  jetsonDc.position.set(0.40, 0.07, 0.30);
  jetsonNano.add(jetsonDc);

  const hdmiDpGeo = new THREE.BoxGeometry(0.16, 0.18, 0.16);
  const hdmiDp = new THREE.Mesh(hdmiDpGeo, chromeMetalMaterial);
  hdmiDp.position.set(0.39, 0.11, 0.14);
  jetsonNano.add(hdmiDp);

  const usbStackGeo = new THREE.BoxGeometry(0.16, 0.18, 0.14);
  const usbStack1 = new THREE.Mesh(usbStackGeo, chromeMetalMaterial);
  usbStack1.position.set(0.39, 0.11, -0.03);
  jetsonNano.add(usbStack1);

  const usbStack2 = new THREE.Mesh(usbStackGeo, chromeMetalMaterial);
  usbStack2.position.set(0.39, 0.11, -0.19);
  jetsonNano.add(usbStack2);

  // Blue USB 3.0 tabs facing +X side
  for (const uz of [-0.03, -0.19]) {
    for (const uy of [0.07, 0.15]) {
      const tabGeo = new THREE.BoxGeometry(0.03, 0.02, 0.08);
      const tab = new THREE.Mesh(tabGeo, new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
      tab.position.set(0.46, uy, uz);
      jetsonNano.add(tab);
    }
  }

  // RJ45 Ethernet port facing +X rear-side
  const rj45Geo = new THREE.BoxGeometry(0.18, 0.16, 0.16);
  const rj45 = new THREE.Mesh(rj45Geo, chromeMetalMaterial);
  rj45.position.set(0.38, 0.10, -0.35);
  jetsonNano.add(rj45);

  // 40-pin GPIO header in back (-Z)
  const gpioGeo = new THREE.BoxGeometry(0.56, 0.04, 0.09);
  const gpio = new THREE.Mesh(gpioGeo, new THREE.MeshStandardMaterial({ color: 0x09090b }));
  gpio.position.set(0, 0.04, -0.33);
  jetsonNano.add(gpio);

  for (let g = -0.25; g <= 0.25; g += 0.025) {
    const pGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.075, 6);
    const p1 = new THREE.Mesh(pGeo, brassStandoffMaterial);
    p1.position.set(g, 0.07, -0.35);
    jetsonNano.add(p1);

    const p2 = new THREE.Mesh(pGeo, brassStandoffMaterial);
    p2.position.set(g, 0.07, -0.31);
    jetsonNano.add(p2);
  }

  jetsonNano.position.set(0, JETSON_Y, 0);
  rootGroup.add(jetsonNano);
  registerPart('jetson_nano', jetsonNano);

  // ==========================================
  // 8. CAMERA CSI VỚI GIÁ ĐỠ NHÔM ANOD XANH LÁ & KHỚP XOAY
  // Trong ảnh #1, #4: Giá đỡ nhôm anod xanh lá (Green Anodized Mount) uốn nghiêng vững chãi,
  // camera Sony IMX219 có 2 ốc siết bằng đồng (brass thumbscrews) chỉnh góc ngẩng/cúi (Tilt joint),
  // và sợi cáp dẹp FFC trắng in chữ "AWM 20706" uốn cong hình vòm ngược lên tầng RPLIDAR
  // ==========================================
  const csiCamera = new THREE.Group();
  csiCamera.name = 'CSICamera_GreenMount';

  // Green Anodized Base Bracket
  const bracketFootGeo = new THREE.BoxGeometry(0.38, 0.035, 0.22);
  const bracketFoot = new THREE.Mesh(bracketFootGeo, greenAnodizedMaterial);
  bracketFoot.position.set(0, 0.018, 0);
  bracketFoot.castShadow = true;
  csiCamera.add(bracketFoot);

  // Angled upright green arm
  const armShape = new THREE.Shape();
  armShape.moveTo(-0.16, 0);
  armShape.lineTo(-0.13, 0.52);
  armShape.lineTo(0.13, 0.52);
  armShape.lineTo(0.16, 0);
  armShape.closePath();

  const armGeo = new THREE.ExtrudeGeometry(armShape, { depth: 0.035, bevelEnabled: true, bevelSize: 0.01 });
  armGeo.rotateY(Math.PI / 2);
  const armMesh = new THREE.Mesh(armGeo, greenAnodizedMaterial);
  armMesh.position.set(0.018, 0.02, 0);
  armMesh.castShadow = true;
  csiCamera.add(armMesh);

  // Tilting camera joint (khớp xoay gật gù)
  const cameraTiltJoint = new THREE.Group();
  cameraTiltJoint.name = 'CameraTiltJoint';
  cameraTiltJoint.position.set(0, 0.52, 0.05);

  // Camera Sensor PCB (Sony IMX219)
  const camPcbGeo = new THREE.BoxGeometry(0.24, 0.24, 0.02);
  const camPcb = new THREE.Mesh(camPcbGeo, new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.4 }));
  cameraTiltJoint.add(camPcb);

  // Two brass knurled thumb adjustment screws on both sides (seen clearly in photo #4!)
  for (const side of [-0.15, 0.15]) {
    const thumbGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.06, 12);
    thumbGeo.rotateZ(Math.PI / 2);
    const thumb = new THREE.Mesh(thumbGeo, brassStandoffMaterial);
    thumb.position.set(side, 0, 0);
    cameraTiltJoint.add(thumb);
  }

  // Camera lens mount & barrel
  const lensBarrelGeo = new THREE.CylinderGeometry(0.075, 0.09, 0.10, 24);
  lensBarrelGeo.rotateX(Math.PI / 2);
  const lensBarrel = new THREE.Mesh(lensBarrelGeo, new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.8, roughness: 0.2 }));
  lensBarrel.position.set(0, 0, 0.06);
  cameraTiltJoint.add(lensBarrel);

  // Wide-angle fisheye lens glass element (convex dome)
  const lensGlassGeo = new THREE.SphereGeometry(0.065, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  lensGlassGeo.rotateX(Math.PI / 2);
  const lensGlass = new THREE.Mesh(lensGlassGeo, new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.9,
    transparent: true,
    opacity: 0.85,
  }));
  lensGlass.position.set(0, 0, 0.11);
  cameraTiltJoint.add(lensGlass);

  csiCamera.add(cameraTiltJoint);

  // Place camera at the front lip of the green base plate
  csiCamera.position.set(0, CHASSIS_Y + 0.035, 1.02);
  rootGroup.add(csiCamera);
  registerPart('camera_csi', csiCamera);

  // 15-pin FFC Ribbon Cable curving upward over the Jetson as in photos #1, #3, #4!
  const ribbonCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, CHASSIS_Y + 0.54, 1.02),
    new THREE.Vector3(0, CHASSIS_Y + 0.98, 0.72),
    new THREE.Vector3(0, CHASSIS_Y + 1.25, 0.42),
    new THREE.Vector3(0, CHASSIS_Y + 1.15, 0.18),
  ]);
  const ribbonGeo = new THREE.TubeGeometry(ribbonCurve, 32, 0.045, 4, false);
  const cameraRibbon = new THREE.Mesh(ribbonGeo, ribbonCableMaterial);
  cameraRibbon.castShadow = true;
  rootGroup.add(cameraRibbon);
  registerPart('camera_csi', cameraRibbon);

  // ==========================================
  // 9. HAI ANTEN WI-FI KÉP ĐA HƯỚNG
  // Gắn trên tầng đế với đầu nối SMA mạ vàng (Photo #1, #2)
  // ==========================================
  const wifiAntennas = new THREE.Group();
  wifiAntennas.name = 'DualWifiAntennas';

  function createJetBotAntenna(isLeft: boolean): THREE.Group {
    const antGroup = new THREE.Group();

    // Gold SMA nut
    const nutGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.07, 6);
    const nut = new THREE.Mesh(nutGeo, brassStandoffMaterial);
    antGroup.add(nut);

    // Rubber hinge
    const hingeGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.06, 16);
    hingeGeo.rotateZ(Math.PI / 2);
    const hinge = new THREE.Mesh(hingeGeo, new THREE.MeshStandardMaterial({ color: 0x111317 }));
    hinge.position.y = 0.06;
    antGroup.add(hinge);

    // Tapered antenna stick
    const stickGeo = new THREE.CylinderGeometry(0.016, 0.028, 1.15, 16);
    const stick = new THREE.Mesh(stickGeo, new THREE.MeshStandardMaterial({ color: 0x0f1115, roughness: 0.7 }));
    stick.position.y = 0.62;
    stick.castShadow = true;

    const tiltGroup = new THREE.Group();
    tiltGroup.position.y = 0.06;
    tiltGroup.add(stick);
    // Tilt backwards and outwards
    tiltGroup.rotation.x = -0.22;
    tiltGroup.rotation.z = isLeft ? 0.18 : -0.18;
    antGroup.add(tiltGroup);

    return antGroup;
  }

  const leftAnt = createJetBotAntenna(true);
  leftAnt.position.set(0.76, CHASSIS_Y + 0.035, -0.82);
  wifiAntennas.add(leftAnt);

  const rightAnt = createJetBotAntenna(false);
  rightAnt.position.set(-0.76, CHASSIS_Y + 0.035, -0.82);
  wifiAntennas.add(rightAnt);

  // Black U.FL/IPEX coax antenna cables curving from SMA nuts inward toward Jetson (photo #2)
  const coaxMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.7 });
  for (const side of [1, -1]) {
    const coaxCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.72, CHASSIS_Y + 0.09, -0.78),
      new THREE.Vector3(side * 0.64, CHASSIS_Y + 0.56, -0.68),
      new THREE.Vector3(side * 0.42, CHASSIS_Y + 0.68, -0.45),
      new THREE.Vector3(side * 0.28, JETSON_Y + 0.03, -0.18),
    ]);
    const coaxMesh = new THREE.Mesh(new THREE.TubeGeometry(coaxCurve, 20, 0.011, 6, false), coaxMat);
    wifiAntennas.add(coaxMesh);
  }

  rootGroup.add(wifiAntennas);
  registerPart('wifi_antennas', wifiAntennas);

  // ==========================================
  // 10. TRỤ ĐỒNG TẦNG TRÊN & TẦNG NÓC (LIDAR MOUNTING DECK)
  // Trong ảnh #1, #2, #3: 4 trụ đồng dài nâng cao tấm mica đen (Acrylic deck)
  // để đặt RPLIDAR cao hơn quạt tản nhiệt của Jetson
  // ==========================================
  const upperStandoffs = new THREE.Group();
  upperStandoffs.name = 'UpperBrassStandoffs';
  const UPPER_GAP = 0.58;

  const upperCoords = [
    [-0.42, 0.35], [0.42, 0.35],
    [-0.42, -0.32], [0.42, -0.32]
  ];

  upperCoords.forEach(([ux, uz]) => {
    const postGeo = new THREE.CylinderGeometry(0.032, 0.032, UPPER_GAP, 6);
    const post = new THREE.Mesh(postGeo, brassStandoffMaterial);
    post.position.set(ux, JETSON_Y + 0.03 + UPPER_GAP / 2, uz);
    post.castShadow = true;
    upperStandoffs.add(post);
  });
  rootGroup.add(upperStandoffs);
  registerPart('robot_chassis', upperStandoffs);

  // Tầng nóc đặt RPLIDAR
  const TOP_Y = JETSON_Y + 0.03 + UPPER_GAP;
  const topDeck = new THREE.Group();
  topDeck.name = 'LidarDeckPlate';

  const topPlateGeo = new THREE.BoxGeometry(1.05, 0.035, 0.95);
  const topPlate = new THREE.Mesh(topPlateGeo, blackAcrylicDeckMaterial);
  topPlate.castShadow = true;
  topPlate.receiveShadow = true;
  topDeck.add(topPlate);

  topDeck.position.set(0, TOP_Y, 0);
  rootGroup.add(topDeck);
  registerPart('robot_chassis', topDeck);

  // ==========================================
  // 11. RPLIDAR A1/A2 VỚI ĐỘNG CƠ DÂY CUROA (BELT DRIVE MOTOR)
  // Trong ảnh #1, #2, #3: Nhìn thấy cực kỳ rõ ràng động cơ nhỏ kéo dây curoa (Silver DC Pulley Motor)
  // nằm ngay phía sau đầu quét LiDAR, dây curoa đen quấn quanh thân
  // ==========================================
  const rplidar = new THREE.Group();
  rplidar.name = 'RPLIDAR_Slamtec_Sensor';

  // Small silver pulley drive motor at rear of RPLIDAR (visible in photos #1, #2, #3!)
  const lidarPulleyMotor = new THREE.Group();
  lidarPulleyMotor.name = 'LidarBeltDriveMotor';

  const pMotorCanGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.21, 24);
  const pMotorCan = new THREE.Mesh(pMotorCanGeo, chromeMetalMaterial);
  pMotorCan.position.set(0, -0.105, -0.31);
  pMotorCan.castShadow = true;
  lidarPulleyMotor.add(pMotorCan);

  // Motor shaft extending up through mounting plate to pulley
  const pShaftGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 12);
  const pShaft = new THREE.Mesh(pShaftGeo, chromeMetalMaterial);
  pShaft.position.set(0, 0.04, -0.31);
  lidarPulleyMotor.add(pShaft);

  // Motor pulley wheel above mounting plate
  const pulleyWheelGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.045, 16);
  const pulleyWheel = new THREE.Mesh(pulleyWheelGeo, new THREE.MeshStandardMaterial({ color: 0x222222 }));
  pulleyWheel.position.set(0, 0.09, -0.31);
  lidarPulleyMotor.add(pulleyWheel);

  // Rubber drive belt connecting pulley to main scanner cylinder
  const beltGeo = new THREE.TorusGeometry(0.35, 0.018, 8, 36);
  beltGeo.rotateX(Math.PI / 2);
  const belt = new THREE.Mesh(beltGeo, new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 }));
  belt.position.set(0, 0.09, -0.08);
  lidarPulleyMotor.add(belt);

  rplidar.add(lidarPulleyMotor);

  // Stationary RPLIDAR lower base
  const lidarBaseGeo = new THREE.CylinderGeometry(0.36, 0.40, 0.14, 36);
  const lidarBase = new THREE.Mesh(lidarBaseGeo, lidarBodyMaterial);
  lidarBase.position.y = 0.07;
  lidarBase.castShadow = true;
  rplidar.add(lidarBase);

  // Rotating Turret Scanner Head
  const lidarTurret = new THREE.Group();
  lidarTurret.name = 'RPLidarTurret';

  const turretHeadGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.24, 36);
  const turretHead = new THREE.Mesh(turretHeadGeo, lidarBodyMaterial);
  turretHead.position.y = 0.26;
  turretHead.castShadow = true;
  lidarTurret.add(turretHead);

  // Front optical window aperture
  const apertureGeo = new THREE.BoxGeometry(0.14, 0.12, 0.36);
  const aperture = new THREE.Mesh(apertureGeo, new THREE.MeshBasicMaterial({ color: 0x020202 }));
  aperture.position.set(0, 0.26, 0.18);
  lidarTurret.add(aperture);

  // Red Laser Diode Emitter
  const emitterGeo = new THREE.SphereGeometry(0.025, 12, 12);
  const emitterMat = new THREE.MeshBasicMaterial({ color: 0xff1e1e });
  const emitter = new THREE.Mesh(emitterGeo, emitterMat);
  emitter.position.set(0.04, 0.26, 0.34);
  lidarTurret.add(emitter);

  // Receiver optical lens
  const recGeo = new THREE.SphereGeometry(0.03, 12, 12);
  const receiver = new THREE.Mesh(recGeo, new THREE.MeshBasicMaterial({ color: 0x1a1a1a }));
  receiver.position.set(-0.04, 0.26, 0.34);
  lidarTurret.add(receiver);

  rplidar.add(lidarTurret);

  // 360 Laser Scanning Fan / Disk (simulating active LIDAR plane)
  const lidarLaserBeam = new THREE.Group();
  lidarLaserBeam.name = 'LidarLaserBeam';

  const laserRingGeo = new THREE.RingGeometry(0.38, 4.5, 64);
  laserRingGeo.rotateX(-Math.PI / 2);
  const laserRingMat = new THREE.MeshBasicMaterial({
    color: 0xff0044,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const laserRing = new THREE.Mesh(laserRingGeo, laserRingMat);
  laserRing.position.y = 0.26;
  lidarLaserBeam.add(laserRing);

  const sweepRayGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.26, 0),
    new THREE.Vector3(0, 0.26, 4.5),
  ]);
  const sweepRayMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
  const sweepRay = new THREE.Line(sweepRayGeo, sweepRayMat);
  lidarTurret.add(sweepRay);

  rplidar.add(lidarLaserBeam);

  // RPLIDAR mounting ring & 4 black nylon rear/front standoffs (clearly seen in photo #2!)
  const lidarRingPlateGeo = new THREE.BoxGeometry(0.84, 0.025, 0.88);
  const lidarRingPlate = new THREE.Mesh(lidarRingPlateGeo, blackAcrylicDeckMaterial);
  lidarRingPlate.position.set(0, 0.015, -0.06);
  rplidar.add(lidarRingPlate);

  for (const [lx, lz] of [[-0.36, 0.30], [0.36, 0.30], [-0.36, -0.40], [0.36, -0.40]]) {
    const nylonPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, 0.24, 6),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    );
    nylonPost.position.set(lx, -0.11, lz);
    rplidar.add(nylonPost);
  }

  // Bottom solder tabs & bracket on silver pulley drive motor at rear
  const motorTabMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 });
  for (const tx of [-0.04, 0.04]) {
    const tab = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.015), motorTabMat);
    tab.position.set(tx, -0.22, -0.31);
    lidarPulleyMotor.add(tab);
  }

  rplidar.position.set(0, TOP_Y + 0.24, 0.05);
  rootGroup.add(rplidar);
  registerPart('rplidar', rplidar);

  // ==========================================
  // 12. DÂY CÁP XANH PHẲNG USB/ETHERNET & BO CHUYỂN ĐỔI USB-UART CÓ MÃ QR
  // Trong ảnh #2 & #3: Cáp dẹp màu xanh da trời cắm vào cổng USB cạnh bên (+X),
  // cuộn vòng ra phía sau và nối vào bo mạch xanh lá USB-UART có tem mã QR phía sau RPLIDAR
  // ==========================================
  const ethernetCable = new THREE.Group();
  ethernetCable.name = 'FlatBlueEthernetCable';

  // Flat blue USB cable plugged into Jetson side USB port (+X) looping out toward the rear
  const ethCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.47, JETSON_Y + 0.14, -0.03),
    new THREE.Vector3(0.78, JETSON_Y + 0.08, -0.18),
    new THREE.Vector3(0.95, JETSON_Y - 0.12, -0.58),
    new THREE.Vector3(0.78, JETSON_Y + 0.05, -0.95),
    new THREE.Vector3(0.92, JETSON_Y + 0.22, -0.78),
    new THREE.Vector3(0.80, TOP_Y + 0.04, -0.71),
  ]);
  const ethCableGeo = new THREE.TubeGeometry(ethCurve, 40, 0.024, 6, false);
  const ethCableMesh = new THREE.Mesh(ethCableGeo, flatBlueCableMaterial);
  ethernetCable.add(ethCableMesh);

  // White USB connector boot on Jetson side USB port
  const bootGeo = new THREE.BoxGeometry(0.11, 0.09, 0.10);
  const boot = new THREE.Mesh(bootGeo, new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
  boot.position.set(0.51, JETSON_Y + 0.14, -0.03);
  ethernetCable.add(boot);

  rootGroup.add(ethernetCable);
  registerPart('jetson_nano', ethernetCable);

  // LiDAR Green USB-UART Dongle Board hanging at rear-left with QR code & 5-wire harness (photo #2!)
  const uartCable = new THREE.Group();
  uartCable.name = 'LidarUartDongle';

  const uartPcbGeo = new THREE.BoxGeometry(0.24, 0.34, 0.02);
  const uartPcbMat = new THREE.MeshStandardMaterial({
    map: createQrDongleTexture(),
    roughness: 0.45,
  });
  const uartPcb = new THREE.Mesh(uartPcbGeo, uartPcbMat);
  uartPcb.position.set(0.62, TOP_Y + 0.14, -0.68);
  uartPcb.rotation.set(-0.18, 0.35, -0.68);
  uartPcb.castShadow = true;
  uartCable.add(uartPcb);

  // White USB plug & blue boot entering bottom of UART board
  const uartUsbBoot = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.12, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc })
  );
  uartUsbBoot.position.set(0.80, TOP_Y + 0.04, -0.71);
  uartUsbBoot.rotation.copy(uartPcb.rotation);
  uartCable.add(uartUsbBoot);

  // White 5-pin JST socket & multi-color ribbon wires from RPLIDAR rear to UART PCB
  const jstPlug = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.06, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc })
  );
  jstPlug.position.set(0.46, TOP_Y + 0.25, -0.62);
  jstPlug.rotation.copy(uartPcb.rotation);
  uartCable.add(jstPlug);

  const wirePalette = [0xef4444, 0xeab308, 0x3b82f6, 0x22c55e, 0x111827];
  wirePalette.forEach((col, i) => {
    const zShift = (i - 2) * 0.015;
    const hCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.45, TOP_Y + 0.25, -0.60 + zShift),
      new THREE.Vector3(0.26, TOP_Y + 0.32, -0.58 + zShift),
      new THREE.Vector3(0.05, TOP_Y + 0.22, -0.35 + zShift),
    ]);
    const hWire = new THREE.Mesh(
      new THREE.TubeGeometry(hCurve, 14, 0.009, 5, false),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 })
    );
    uartCable.add(hWire);
  });

  rootGroup.add(uartCable);
  registerPart('rplidar', uartCable);

  // Initial reference positions for Explode animations
  const initialPositions = {
    baseChassisY: baseChassis.position.y,
    leftMotor: leftMotor.position.clone(),
    rightMotor: rightMotor.position.clone(),
    leftWheelX: leftWheel.position.x,
    rightWheelX: rightWheel.position.x,
    rearCasterZ: rearCaster.position.z,
    lowerStandoffsY: lowerStandoffs.position.y,
    middleDeckY: middleDeck.position.y,
    batteryPackY: batteryPack.position.y,
    jetsonNanoY: jetsonNano.position.y,
    csiCameraZ: csiCamera.position.z,
    csiCameraY: csiCamera.position.y,
    wifiAntennasY: wifiAntennas.position.y,
    upperStandoffsY: upperStandoffs.position.y,
    topDeckY: topDeck.position.y,
    rplidarY: rplidar.position.y,
    ethernetCableY: ethernetCable.position.y,
    uartCableY: uartCable.position.y,
  };

  const updateExplode = (progress: number) => {
    const p = Math.max(0, Math.min(1, progress));

    baseChassis.position.y = initialPositions.baseChassisY - p * 0.35;

    leftMotor.position.y = initialPositions.leftMotor.y - p * 0.65;
    leftMotor.position.x = initialPositions.leftMotor.x + p * 0.25;

    rightMotor.position.y = initialPositions.rightMotor.y - p * 0.65;
    rightMotor.position.x = initialPositions.rightMotor.x - p * 0.25;

    leftWheel.position.x = initialPositions.leftWheelX + p * 0.85;
    rightWheel.position.x = initialPositions.rightWheelX - p * 0.85;

    rearCaster.position.z = initialPositions.rearCasterZ - p * 0.45;

    lowerStandoffs.position.y = initialPositions.lowerStandoffsY + p * 0.25;

    middleDeck.position.y = initialPositions.middleDeckY + p * 0.75;
    batteryPack.position.y = initialPositions.batteryPackY + p * 0.45;

    jetsonNano.position.y = initialPositions.jetsonNanoY + p * 1.35;
    ethernetCable.position.y = initialPositions.ethernetCableY + p * 1.35;

    csiCamera.position.z = initialPositions.csiCameraZ + p * 0.75;
    csiCamera.position.y = initialPositions.csiCameraY + p * 0.65;

    wifiAntennas.position.y = initialPositions.wifiAntennasY + p * 0.95;

    upperStandoffs.position.y = initialPositions.upperStandoffsY + p * 1.65;

    topDeck.position.y = initialPositions.topDeckY + p * 2.15;

    rplidar.position.y = initialPositions.rplidarY + p * 2.85;
    uartCable.position.y = initialPositions.uartCableY + p * 2.85;
  };

  const updateWheelRotation = (leftRad: number, rightRad: number) => {
    leftWheel.rotation.x = leftRad;
    rightWheel.rotation.x = rightRad;
  };

  const updateLidarRotation = (angle: number) => {
    lidarTurret.rotation.y = angle;
    // Pulley wheel spins along with turret
    pulleyWheel.rotation.y = angle * 2.5;
  };

  const setFanSpeed = (rpm: number) => {
    rotorGroup.rotation.y += (rpm / 60) * 0.05;
  };

  return {
    rootGroup,
    partsMap: {
      baseChassis,
      leftMotor,
      rightMotor,
      leftWheel,
      rightWheel,
      rearCaster,
      lowerStandoffs,
      middleDeck,
      batteryPack,
      jetsonNano,
      motorDriver: middleDeck,
      coolingFan,
      csiCamera,
      cameraTiltJoint,
      cameraRibbon,
      wifiAntennas,
      upperStandoffs,
      topDeck,
      lidarPulleyMotor,
      rplidar,
      lidarTurret,
      lidarLaserBeam,
      ethernetCable,
      uartCable,
    },
    componentGroups,
    updateExplode,
    updateWheelRotation,
    updateLidarRotation,
    setFanSpeed,
  };
}
