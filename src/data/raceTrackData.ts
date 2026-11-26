import * as THREE from 'three';
import { ObstacleData } from '../types/robot';

export const RACE_COURSE_OBSTACLES: ObstacleData[] = [
  // Chặng 1 (Z = 5..15): Xuất phát tới Checkpoint 1 (Slalom rộng & Robot tuần tra #1)
  { id: 'cone_1', type: 'cone', x: -3.2, z: 5.0, radius: 0.5, height: 0.9, name: 'Cọc tiêu cảnh báo #1' },
  { id: 'cone_2', type: 'cone', x: 3.0, z: 5.5, radius: 0.5, height: 0.9, name: 'Cọc tiêu cảnh báo #2' },
  { id: 'barrel_1', type: 'barrel', x: -0.6, z: 8.2, radius: 0.65, height: 1.1, name: 'Thùng phuy hóa chất #1' },
  { id: 'box_1', type: 'box', x: -6.2, z: 9.2, radius: 0.9, height: 1.4, name: 'Khối container thiết bị #1' },
  { id: 'cone_3', type: 'cone', x: 5.8, z: 10.2, radius: 0.5, height: 0.9, name: 'Cọc tiêu cảnh báo #3' },
  {
    id: 'moving_drone_1',
    type: 'moving_drone',
    x: 0,
    z: 12.8,
    radius: 0.65,
    height: 0.7,
    name: 'Robot tuần tra di động #1',
    isMoving: true,
    moveAxis: 'x',
    moveRange: 4.8,
    moveSpeed: 1.7,
  },

  // Chặng 2 (Z = 18..31): Checkpoint 1 tới Checkpoint 2 (Chướng ngại vật hỗn hợp & 2 Drone)
  { id: 'barrier_1', type: 'barrier', x: -4.2, z: 19.2, radius: 1.0, height: 0.95, name: 'Hàng rào Barricade #1' },
  { id: 'barrel_2', type: 'barrel', x: 4.5, z: 19.5, radius: 0.65, height: 1.1, name: 'Thùng phuy hóa chất #2' },
  { id: 'box_2', type: 'box', x: 0.2, z: 22.0, radius: 0.95, height: 1.4, name: 'Khối container thiết bị #2' },
  {
    id: 'moving_drone_2',
    type: 'moving_drone',
    x: 0,
    z: 25.0,
    radius: 0.65,
    height: 0.7,
    name: 'Robot tuần tra di động #2',
    isMoving: true,
    moveAxis: 'x',
    moveRange: 6.2,
    moveSpeed: 2.0,
  },
  { id: 'cone_4', type: 'cone', x: -7.5, z: 25.5, radius: 0.5, height: 0.9, name: 'Cọc tiêu cảnh báo #4' },
  { id: 'cone_5', type: 'cone', x: 7.5, z: 25.5, radius: 0.5, height: 0.9, name: 'Cọc tiêu cảnh báo #5' },
  { id: 'barrel_3', type: 'barrel', x: -3.2, z: 28.5, radius: 0.65, height: 1.1, name: 'Thùng phuy hóa chất #3' },
  { id: 'barrier_2', type: 'barrier', x: 3.8, z: 29.5, radius: 1.0, height: 0.95, name: 'Hàng rào Barricade #2' },

  // Chặng 3 (Z = 35..49): Checkpoint 2 tới Checkpoint 3 (Mê cung công nghiệp & Drone tuần tra kép)
  { id: 'box_3', type: 'box', x: -5.4, z: 36.2, radius: 0.95, height: 1.4, name: 'Khối container thiết bị #3' },
  { id: 'box_4', type: 'box', x: 5.4, z: 36.5, radius: 0.95, height: 1.4, name: 'Khối container thiết bị #4' },
  { id: 'cone_6', type: 'cone', x: 0.0, z: 38.2, radius: 0.5, height: 0.9, name: 'Cọc tiêu trung tâm #6' },
  {
    id: 'moving_drone_3',
    type: 'moving_drone',
    x: 0,
    z: 41.2,
    radius: 0.65,
    height: 0.7,
    name: 'Robot tuần tra di động #3',
    isMoving: true,
    moveAxis: 'x',
    moveRange: 6.8,
    moveSpeed: 2.2,
  },
  { id: 'barrel_4', type: 'barrel', x: -7.2, z: 43.5, radius: 0.65, height: 1.1, name: 'Thùng phuy hóa chất #4' },
  { id: 'barrel_5', type: 'barrel', x: 2.2, z: 44.5, radius: 0.65, height: 1.1, name: 'Thùng phuy hóa chất #5' },
  {
    id: 'moving_drone_4',
    type: 'moving_drone',
    x: -3.8,
    z: 46.8,
    radius: 0.65,
    height: 0.7,
    name: 'Robot tuần tra dọc #4',
    isMoving: true,
    moveAxis: 'z',
    moveRange: 2.2,
    moveSpeed: 1.9,
  },
  { id: 'barrier_3', type: 'barrier', x: 6.2, z: 47.8, radius: 1.0, height: 0.95, name: 'Hàng rào Barricade #3' },

  // Chặng 4 (Z = 53..65): Checkpoint 3 tới Vạch Đích (Nước rút vượt chướng ngại mật độ cao)
  { id: 'cone_7', type: 'cone', x: -3.5, z: 53.5, radius: 0.5, height: 0.9, name: 'Cọc tiêu chặng cuối #7' },
  { id: 'cone_8', type: 'cone', x: 3.5, z: 53.5, radius: 0.5, height: 0.9, name: 'Cọc tiêu chặng cuối #8' },
  { id: 'box_5', type: 'box', x: 0.0, z: 56.2, radius: 0.95, height: 1.4, name: 'Khối hộp chắn trung tâm #5' },
  { id: 'barrel_6', type: 'barrel', x: -6.8, z: 57.5, radius: 0.65, height: 1.1, name: 'Thùng phuy hóa chất #6' },
  { id: 'barrel_7', type: 'barrel', x: 6.8, z: 57.5, radius: 0.65, height: 1.1, name: 'Thùng phuy hóa chất #7' },
  {
    id: 'moving_drone_5',
    type: 'moving_drone',
    x: 0,
    z: 60.2,
    radius: 0.65,
    height: 0.7,
    name: 'Robot tuần tra di động #5',
    isMoving: true,
    moveAxis: 'x',
    moveRange: 6.0,
    moveSpeed: 2.3,
  },
  { id: 'barrier_4', type: 'barrier', x: -3.6, z: 63.2, radius: 1.0, height: 0.95, name: 'Hàng rào Barricade #4' },
  {
    id: 'moving_drone_6',
    type: 'moving_drone',
    x: 4.5,
    z: 64.2,
    radius: 0.65,
    height: 0.7,
    name: 'Robot tuần tra chốt đích #6',
    isMoving: true,
    moveAxis: 'x',
    moveRange: 3.6,
    moveSpeed: 2.4,
  },
];

export interface CheckpointGate {
  id: number;
  z: number;
  width: number;
  name: string;
}

export const RACE_CHECKPOINTS: CheckpointGate[] = [
  { id: 1, z: 16.0, width: 12.0, name: 'Checkpoint 1 (Sector 1)' },
  { id: 2, z: 33.0, width: 12.0, name: 'Checkpoint 2 (Sector 2)' },
  { id: 3, z: 51.0, width: 12.0, name: 'Checkpoint 3 (Sector 3)' },
  { id: 4, z: 68.0, width: 13.0, name: 'Vạch ĐÍCH (FINISH LINE)' },
];

// 3D Procedural builders for track props
export function buildRaceObstacles(obstacles: ObstacleData[]): {
  group: THREE.Group;
  dynamicMeshes: { data: ObstacleData; mesh: THREE.Group; initialX: number; initialZ: number }[];
} {
  const group = new THREE.Group();
  group.name = 'RaceObstaclesRoot';
  const dynamicMeshes: { data: ObstacleData; mesh: THREE.Group; initialX: number; initialZ: number }[] = [];

  // PBR materials
  const orangeConeMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    roughness: 0.4,
    metalness: 0.1,
  });

  const whiteReflectMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.6,
  });

  const blackBaseMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.7,
  });

  const hazardMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.35,
    metalness: 0.3,
  });

  const barrelBlueMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.35,
    metalness: 0.6,
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.25,
  });

  obstacles.forEach((obs) => {
    const itemGroup = new THREE.Group();
    itemGroup.name = `Obs_${obs.id}`;
    itemGroup.position.set(obs.x, 0, obs.z);

    if (obs.type === 'cone') {
      // Traffic cone
      const baseGeo = new THREE.BoxGeometry(0.7, 0.08, 0.7);
      const base = new THREE.Mesh(baseGeo, blackBaseMat);
      base.position.y = 0.04;
      base.castShadow = true;
      itemGroup.add(base);

      const coneGeo = new THREE.ConeGeometry(0.28, 0.82, 24);
      const cone = new THREE.Mesh(coneGeo, orangeConeMat);
      cone.position.y = 0.48;
      cone.castShadow = true;
      itemGroup.add(cone);

      // White reflective tape
      const ringGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.14, 24);
      const ring = new THREE.Mesh(ringGeo, whiteReflectMat);
      ring.position.y = 0.45;
      itemGroup.add(ring);
    } else if (obs.type === 'barrel') {
      // Industrial oil barrel
      const barrelGeo = new THREE.CylinderGeometry(0.48, 0.48, 1.1, 24);
      const barrel = new THREE.Mesh(barrelGeo, barrelBlueMat);
      barrel.position.y = 0.55;
      barrel.castShadow = true;
      barrel.receiveShadow = true;
      itemGroup.add(barrel);

      // Metal bands
      for (const yOffset of [0.25, 0.55, 0.85]) {
        const bandGeo = new THREE.TorusGeometry(0.49, 0.02, 8, 24);
        bandGeo.rotateX(Math.PI / 2);
        const band = new THREE.Mesh(bandGeo, metalMat);
        band.position.y = yOffset;
        itemGroup.add(band);
      }
    } else if (obs.type === 'box') {
      // Lab equipment container box
      const boxGeo = new THREE.BoxGeometry(1.4, 1.2, 1.4);
      const boxMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.5,
        metalness: 0.4,
      });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.y = 0.6;
      box.castShadow = true;
      box.receiveShadow = true;
      itemGroup.add(box);

      // Yellow caution rim
      const rimGeo = new THREE.BoxGeometry(1.44, 0.08, 1.44);
      const rim = new THREE.Mesh(rimGeo, hazardMat);
      rim.position.y = 1.16;
      itemGroup.add(rim);

      const rimBot = new THREE.Mesh(rimGeo, hazardMat);
      rimBot.position.y = 0.08;
      itemGroup.add(rimBot);
    } else if (obs.type === 'barrier') {
      // Roadwork Barricade
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.95, 12);
      const legL = new THREE.Mesh(legGeo, metalMat);
      legL.position.set(-0.7, 0.475, 0);
      legL.castShadow = true;
      itemGroup.add(legL);

      const legR = new THREE.Mesh(legGeo, metalMat);
      legR.position.set(0.7, 0.475, 0);
      legR.castShadow = true;
      itemGroup.add(legR);

      // Hazard plank
      const plankGeo = new THREE.BoxGeometry(1.8, 0.28, 0.06);
      const plank = new THREE.Mesh(plankGeo, hazardMat);
      plank.position.set(0, 0.72, 0);
      plank.castShadow = true;
      itemGroup.add(plank);

      const plank2 = new THREE.Mesh(plankGeo, hazardMat);
      plank2.position.set(0, 0.35, 0);
      plank2.castShadow = true;
      itemGroup.add(plank2);
    } else if (obs.type === 'moving_drone') {
      // Moving obstacle bot
      const droneBaseGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.28, 24);
      const droneBase = new THREE.Mesh(droneBaseGeo, new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.6 }));
      droneBase.position.y = 0.25;
      droneBase.castShadow = true;
      itemGroup.add(droneBase);

      // Rotating warning beacon
      const beaconGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.18, 16);
      const beacon = new THREE.Mesh(beaconGeo, new THREE.MeshBasicMaterial({ color: 0xff0044 }));
      beacon.position.y = 0.48;
      itemGroup.add(beacon);

      // Wheels
      for (const side of [-0.46, 0.46]) {
        const wGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
        wGeo.rotateZ(Math.PI / 2);
        const wMesh = new THREE.Mesh(wGeo, blackBaseMat);
        wMesh.position.set(side, 0.2, 0);
        itemGroup.add(wMesh);
      }
    }

    group.add(itemGroup);

    if (obs.isMoving) {
      dynamicMeshes.push({
        data: obs,
        mesh: itemGroup,
        initialX: obs.x,
        initialZ: obs.z,
      });
    }
  });

  return { group, dynamicMeshes };
}

// Procedural Checkpoint Gates Builder
export function buildRaceGates(checkpoints: CheckpointGate[]): {
  group: THREE.Group;
  gateMeshes: Map<number, { archMesh: THREE.Group; bannerMesh: THREE.Mesh; lightMesh: THREE.PointLight }>;
} {
  const group = new THREE.Group();
  group.name = 'RaceGatesRoot';
  const gateMeshes = new Map<number, { archMesh: THREE.Group; bannerMesh: THREE.Mesh; lightMesh: THREE.PointLight }>();

  checkpoints.forEach((gate) => {
    const isFinish = gate.id === checkpoints[checkpoints.length - 1].id;
    const archGroup = new THREE.Group();
    archGroup.name = `Gate_${gate.id}`;
    archGroup.position.set(0, 0, gate.z);

    const halfW = gate.width / 2;
    const archH = 3.2;

    // Truss Pillar Materials
    const pillarMat = new THREE.MeshStandardMaterial({
      color: isFinish ? 0x10b981 : 0x0284c7,
      metalness: 0.8,
      roughness: 0.3,
    });

    // Left & Right Pillars
    const postGeo = new THREE.BoxGeometry(0.28, archH, 0.28);
    const postL = new THREE.Mesh(postGeo, pillarMat);
    postL.position.set(-halfW, archH / 2, 0);
    postL.castShadow = true;
    archGroup.add(postL);

    const postR = new THREE.Mesh(postGeo, pillarMat);
    postR.position.set(halfW, archH / 2, 0);
    postR.castShadow = true;
    archGroup.add(postR);

    // Cross Beam
    const beamGeo = new THREE.BoxGeometry(gate.width, 0.35, 0.35);
    const beam = new THREE.Mesh(beamGeo, pillarMat);
    beam.position.set(0, archH, 0);
    beam.castShadow = true;
    archGroup.add(beam);

    // Banner Texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = isFinish ? '#059669' : '#0369a1';
    ctx.fillRect(0, 0, 512, 128);

    if (isFinish) {
      // Checkerboard edge for finish line
      const checkerSize = 24;
      for (let x = 0; x < 512; x += checkerSize) {
        ctx.fillStyle = (x / checkerSize) % 2 === 0 ? '#ffffff' : '#000000';
        ctx.fillRect(x, 0, checkerSize, 20);
        ctx.fillRect(x, 108, checkerSize, 20);
      }
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isFinish ? '🏁 VẠCH ĐÍCH (FINISH) 🏁' : `CHECKPOINT ${gate.id}`, 256, 64);

    const bannerTex = new THREE.CanvasTexture(canvas);
    bannerTex.colorSpace = THREE.SRGBColorSpace;
    const bannerGeo = new THREE.PlaneGeometry(gate.width * 0.75, 0.95);
    const bannerMat = new THREE.MeshStandardMaterial({
      map: bannerTex,
      roughness: 0.4,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0, archH - 0.5, 0);
    archGroup.add(banner);

    // Ground Laser Line / Gate beam
    const lineGeo = new THREE.PlaneGeometry(gate.width, 0.25);
    lineGeo.rotateX(-Math.PI / 2);
    const lineMat = new THREE.MeshBasicMaterial({
      color: isFinish ? 0x10b981 : 0x38bdf8,
      transparent: true,
      opacity: 0.8,
    });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.y = 0.02;
    archGroup.add(line);

    // Glowing gate beacon point light
    const pointLight = new THREE.PointLight(isFinish ? 0x10b981 : 0x38bdf8, 1.8, 6);
    pointLight.position.set(0, archH - 0.2, 0);
    archGroup.add(pointLight);

    group.add(archGroup);
    gateMeshes.set(gate.id, { archMesh: archGroup, bannerMesh: banner, lightMesh: pointLight });
  });

  return { group, gateMeshes };
}
