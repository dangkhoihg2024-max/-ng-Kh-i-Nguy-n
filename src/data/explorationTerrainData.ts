import * as THREE from 'three';

export type TerrainCollider =
  | {
      kind: 'circle';
      id: string;
      x: number;
      z: number;
      radius: number;
      height: number;
    }
  | {
      kind: 'box';
      id: string;
      x: number;
      z: number;
      halfW: number;
      halfD: number;
      rotY: number;
      height: number;
    };

function createTerrainGroundTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep slate proving-ground base
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle biome zoning quadrants in background
  // NW: Moss/forest zone
  const nwGrad = ctx.createRadialGradient(260, 260, 20, 260, 260, 340);
  nwGrad.addColorStop(0, 'rgba(22, 101, 52, 0.28)');
  nwGrad.addColorStop(1, 'rgba(22, 101, 52, 0)');
  ctx.fillStyle = nwGrad;
  ctx.fillRect(0, 0, 512, 512);

  // SE: Earth/nature berm
  const seGrad = ctx.createRadialGradient(780, 760, 20, 780, 760, 320);
  seGrad.addColorStop(0, 'rgba(21, 128, 61, 0.24)');
  seGrad.addColorStop(1, 'rgba(21, 128, 61, 0)');
  ctx.fillStyle = seGrad;
  ctx.fillRect(512, 512, 512, 512);

  // SW: Industrial amber pad
  const swGrad = ctx.createRadialGradient(260, 760, 20, 260, 760, 300);
  swGrad.addColorStop(0, 'rgba(180, 83, 9, 0.16)');
  swGrad.addColorStop(1, 'rgba(180, 83, 9, 0)');
  ctx.fillStyle = swGrad;
  ctx.fillRect(0, 512, 512, 512);

  // Subtle metric grid (64m world -> 16px per meter)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 1024; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 1024);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(1024, i);
    ctx.stroke();
  }

  // Concentric LiDAR range rings centered at (512, 512)
  // 1024px = 64m -> 16px = 1m
  const pxPerMeter = 16;
  const ringRadiiMeters = [2, 4, 6, 8, 10, 12, 15.5];
  ringRadiiMeters.forEach((m, idx) => {
    ctx.beginPath();
    ctx.arc(512, 512, m * pxPerMeter, 0, Math.PI * 2);
    ctx.strokeStyle = idx === ringRadiiMeters.length - 1
      ? 'rgba(56, 189, 248, 0.45)'
      : 'rgba(56, 189, 248, 0.16)';
    ctx.lineWidth = idx === ringRadiiMeters.length - 1 ? 3 : 1.5;
    if (idx < ringRadiiMeters.length - 1) ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    if (m <= 12) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.fillText(`${m}m`, 516, 512 - m * pxPerMeter + 14);
    }
  });

  // Crosshair axes
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(512, 160);
  ctx.lineTo(512, 864);
  ctx.moveTo(160, 512);
  ctx.lineTo(864, 512);
  ctx.stroke();

  // Center calibration pad text
  ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('JETBOT SLAM PROVING GROUND', 512, 558);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function buildExplorationTerrain(): {
  group: THREE.Group;
  colliders: TerrainCollider[];
  beaconRings: THREE.Mesh[];
} {
  const group = new THREE.Group();
  group.name = 'ExplorationRichTerrain';
  const colliders: TerrainCollider[] = [];
  const beaconRings: THREE.Mesh[] = [];

  // 1. Ground Floor (64m x 64m)
  const floorGeo = new THREE.PlaneGeometry(64, 64);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({
    map: createTerrainGroundTexture(),
    roughness: 0.85,
    metalness: 0.12,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.y = -0.005;
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // Shared PBR Materials
  const slateWallMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.55,
    metalness: 0.35,
  });
  const cyanAccentMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.65,
    roughness: 0.25,
  });
  const amberAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xb45309,
    emissiveIntensity: 0.45,
    roughness: 0.35,
  });
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.92,
    metalness: 0.05,
    flatShading: true,
  });
  const darkRockMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.95,
    flatShading: true,
  });
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x166534,
    roughness: 0.9,
    flatShading: true,
  });
  const foliageLightMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.82,
    flatShading: true,
  });
  const foliageDarkMat = new THREE.MeshStandardMaterial({
    color: 0x14532d,
    roughness: 0.85,
    flatShading: true,
  });
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x5c4033,
    roughness: 0.9,
  });
  const crateMat = new THREE.MeshStandardMaterial({
    color: 0x92400e,
    roughness: 0.72,
    metalness: 0.15,
  });
  const crateTrimMat = new THREE.MeshStandardMaterial({
    color: 0x451a03,
    roughness: 0.6,
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.35,
    metalness: 0.8,
  });

  // Helper: Add Box Wall / Crate
  const addBoxStructure = (
    id: string,
    x: number,
    z: number,
    w: number,
    h: number,
    d: number,
    rotY = 0,
    mat: THREE.Material = slateWallMat,
    stripeMat?: THREE.Material
  ) => {
    const wrapper = new THREE.Group();
    wrapper.position.set(x, 0, z);
    wrapper.rotation.y = rotY;

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.y = h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    wrapper.add(mesh);

    if (stripeMat) {
      // Optical LiDAR reflector band at ~1.95m (or top if shorter)
      const bandY = Math.min(h - 0.12, 1.98);
      const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.03, 0.12, d + 0.03), stripeMat);
      band.position.y = bandY;
      wrapper.add(band);
    }

    group.add(wrapper);
    colliders.push({
      kind: 'box',
      id,
      x,
      z,
      halfW: w / 2,
      halfD: d / 2,
      rotY,
      height: h,
    });
  };

  // Helper: Add Low-Poly Boulder Cluster (tall enough for LiDAR laser slice)
  const addBoulder = (id: string, x: number, z: number, radius: number, height: number, seed: number) => {
    const rockGroup = new THREE.Group();
    rockGroup.position.set(x, 0, z);

    const mainGeo = new THREE.DodecahedronGeometry(radius, 0);
    const mainRock = new THREE.Mesh(mainGeo, seed % 2 === 0 ? rockMat : darkRockMat);
    mainRock.scale.set(1, height / (radius * 1.6), 0.92);
    mainRock.position.y = height * 0.42;
    mainRock.rotation.set(seed * 0.3, seed * 0.9, seed * 0.2);
    mainRock.castShadow = true;
    mainRock.receiveShadow = true;
    rockGroup.add(mainRock);

    // Secondary side rock
    const subGeo = new THREE.DodecahedronGeometry(radius * 0.58, 0);
    const subRock = new THREE.Mesh(subGeo, darkRockMat);
    subRock.position.set(radius * 0.55, radius * 0.35, radius * 0.35);
    subRock.rotation.set(seed * 0.7, seed * 0.4, 0.2);
    subRock.castShadow = true;
    rockGroup.add(subRock);

    group.add(rockGroup);
    colliders.push({ kind: 'circle', id, x, z, radius: radius * 1.05, height });
  };

  // Helper: Add Stylized Pine Tree
  const addPineTree = (id: string, x: number, z: number, scale = 1.0) => {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16 * scale, 0.24 * scale, 1.1 * scale, 8),
      trunkMat
    );
    trunk.position.y = 0.55 * scale;
    trunk.castShadow = true;
    tree.add(trunk);

    const tiers = [
      { r: 1.05, h: 1.25, y: 1.45, mat: foliageDarkMat },
      { r: 0.82, h: 1.15, y: 2.15, mat: foliageLightMat },
      { r: 0.55, h: 0.95, y: 2.8, mat: foliageDarkMat },
    ];
    tiers.forEach((t) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(t.r * scale, t.h * scale, 7), t.mat);
      cone.position.y = t.y * scale;
      cone.castShadow = true;
      cone.receiveShadow = true;
      tree.add(cone);
    });

    group.add(tree);
    colliders.push({ kind: 'circle', id, x, z, radius: 0.85 * scale, height: 3.3 * scale });
  };

  // Helper: Add Glowing SLAM Calibration Pillar
  const addBeaconPillar = (id: string, x: number, z: number, radius = 0.42, height = 2.6, isAmber = false) => {
    const pillar = new THREE.Group();
    pillar.position.set(x, 0, z);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.15, radius * 1.25, 0.25, 8), metalMat);
    base.position.y = 0.125;
    base.castShadow = true;
    pillar.add(base);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.85, radius, height - 0.3, 8), slateWallMat);
    body.position.y = height / 2 + 0.1;
    body.castShadow = true;
    pillar.add(body);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.96, 0.045, 8, 20),
      isAmber ? amberAccentMat : cyanAccentMat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = Math.min(height - 0.15, 1.98);
    pillar.add(ring);
    beaconRings.push(ring);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.7, radius * 0.9, 0.18, 8), isAmber ? amberAccentMat : cyanAccentMat);
    cap.position.y = height + 0.05;
    pillar.add(cap);

    group.add(pillar);
    colliders.push({ kind: 'circle', id, x, z, radius: radius * 1.15, height });
  };

  // Helper: Grassy Elevation Mound (outer scenic hills)
  const addTerrainMound = (x: number, z: number, radius: number, height: number) => {
    const moundGeo = new THREE.CylinderGeometry(radius * 0.55, radius, height, 10);
    const mound = new THREE.Mesh(moundGeo, grassMat);
    mound.position.set(x, height / 2 - 0.05, z);
    mound.receiveShadow = true;
    group.add(mound);
  };

  // ======================================================
  // 2. NEAR-FIELD LIDAR TARGETS (r ≈ 4.3m, clear of spawn!)
  // Immediately visible in 360° laser sweep & 2D Costmap
  // ======================================================
  addBeaconPillar('near_beacon_ne', 3.7, 2.3, 0.36, 2.4, false);
  addBoulder('near_rock_nw', -3.6, 2.4, 0.85, 2.3, 1);
  addBoxStructure('near_crate_sw', -3.3, -2.9, 1.25, 2.15, 1.25, 0.35, crateMat, amberAccentMat);
  addBoxStructure('near_baffle_se', 3.6, -2.8, 2.1, 2.15, 0.32, 0.65, slateWallMat, cyanAccentMat);

  // ======================================================
  // 3. SENSOR CALIBRATION ARCHWAY (Drive-through at Z = +6.4)
  // ======================================================
  const archZ = 6.4;
  addBoxStructure('arch_pillar_l', -2.35, archZ, 0.42, 2.8, 0.42, 0, metalMat, cyanAccentMat);
  addBoxStructure('arch_pillar_r', 2.35, archZ, 0.42, 2.8, 0.42, 0, metalMat, cyanAccentMat);
  const archBeam = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.32, 0.46), slateWallMat);
  archBeam.position.set(0, 2.85, archZ);
  archBeam.castShadow = true;
  group.add(archBeam);
  const archStrip = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.08, 0.48), cyanAccentMat);
  archStrip.position.set(0, 2.85, archZ);
  group.add(archStrip);

  // ======================================================
  // 4. NE QUADRANT: SLAM L-SHAPED CALIBRATION WALLS
  // ======================================================
  addBoxStructure('slam_wall_1', 6.4, 6.8, 4.6, 2.3, 0.45, 0, slateWallMat, cyanAccentMat);
  addBoxStructure('slam_wall_2', 8.5, 4.7, 0.45, 2.3, 4.6, 0, slateWallMat, cyanAccentMat);
  addBoxStructure('slam_wall_3', 5.2, 10.6, 3.6, 2.2, 0.42, -0.4, slateWallMat, amberAccentMat);
  addBeaconPillar('pillar_ne_outer', 10.5, 8.2, 0.45, 2.8, true);

  // ======================================================
  // 5. NW QUADRANT: ROCKY HILLS & STYLIZED FOREST
  // ======================================================
  addTerrainMound(-8.6, 7.2, 4.4, 0.45);
  addBoulder('rock_nw_1', -6.8, 5.8, 1.15, 2.5, 2);
  addPineTree('tree_nw_1', -8.8, 7.6, 1.15);
  addPineTree('tree_nw_2', -5.8, 9.8, 1.0);
  addBoulder('rock_nw_2', -2.9, 10.2, 0.95, 2.25, 3);
  addPineTree('tree_nw_3', -10.8, 3.6, 0.95);

  // ======================================================
  // 6. SW QUADRANT: CARGO CRATES, DRUMS & TEST RAMP
  // ======================================================
  addBoxStructure('crate_sw_1', -6.8, -5.6, 1.85, 2.25, 1.85, 0.22, crateMat, crateTrimMat);
  addBoxStructure('crate_sw_2', -4.8, -7.2, 1.4, 2.1, 1.4, -0.25, crateMat, amberAccentMat);
  addBeaconPillar('pillar_sw_1', -8.6, -2.5, 0.42, 2.5, true);
  addBoulder('rock_sw_1', -9.2, -7.8, 1.05, 2.3, 4);

  // Sloped Lab Test Ramp (visual + side rail colliders)
  const rampGroup = new THREE.Group();
  rampGroup.position.set(-1.6, 0, -9.2);
  const rampMesh = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.25, 4.0), slateWallMat);
  rampMesh.rotation.x = -0.18;
  rampMesh.position.y = 0.32;
  rampMesh.castShadow = true;
  rampMesh.receiveShadow = true;
  rampGroup.add(rampMesh);
  const rampTop = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.72, 2.2), metalMat);
  rampTop.position.set(0, 0.36, -2.9);
  rampTop.castShadow = true;
  rampGroup.add(rampTop);
  group.add(rampGroup);
  addBoxStructure('ramp_side_l', -3.05, -10.2, 0.3, 2.1, 4.2, 0, slateWallMat, amberAccentMat);
  addBoxStructure('ramp_side_r', -0.15, -10.2, 0.3, 2.1, 4.2, 0, slateWallMat, amberAccentMat);

  // ======================================================
  // 7. SE QUADRANT: NATURE BERM, BOULDERS & PINES
  // ======================================================
  addTerrainMound(8.2, -7.4, 4.2, 0.42);
  addBoulder('rock_se_1', 6.4, -6.2, 1.05, 2.4, 5);
  addPineTree('tree_se_1', 8.9, -7.5, 1.1);
  addPineTree('tree_se_2', 6.4, -9.6, 0.95);
  addBoxStructure('wall_se_1', 9.2, -1.8, 0.45, 2.25, 3.6, 0.35, slateWallMat, cyanAccentMat);

  // ======================================================
  // 8. OUTER CARDINAL BEACONS & OCTAGONAL PERIMETER WALL
  // ======================================================
  addBeaconPillar('cardinal_n', 0, 12.2, 0.45, 2.7, false);
  addBeaconPillar('cardinal_e', 12.0, 0, 0.45, 2.7, false);
  addBeaconPillar('cardinal_w', -12.0, 0, 0.45, 2.7, false);

  const perimeterSides = 16;
  const perimeterRadius = 15.8;
  const segLen = 2 * perimeterRadius * Math.tan(Math.PI / perimeterSides) + 0.25;
  for (let i = 0; i < perimeterSides; i++) {
    const angle = (i / perimeterSides) * Math.PI * 2;
    const px = Math.sin(angle) * perimeterRadius;
    const pz = Math.cos(angle) * perimeterRadius;
    addBoxStructure(
      `perimeter_${i}`,
      px,
      pz,
      segLen,
      2.1,
      0.45,
      angle,
      slateWallMat,
      i % 2 === 0 ? cyanAccentMat : undefined
    );
  }

  return { group, colliders, beaconRings };
}
