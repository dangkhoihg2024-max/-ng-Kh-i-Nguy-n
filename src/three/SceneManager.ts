import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BoostState, ComponentId, DriveState, RaceGameState, GameStatus, ObstacleData, AutonomousSensors } from '../types/robot';
import { buildRobotModel, BuildRobotResult } from './RobotBuilder';
import { RACE_COURSE_OBSTACLES, RACE_CHECKPOINTS, buildRaceObstacles, buildRaceGates } from '../data/raceTrackData';
import { buildExplorationTerrain, TerrainCollider } from '../data/explorationTerrainData';
import { soundFX } from '../utils/soundFX';

export type CameraPreset = 'isometric' | 'front' | 'top' | 'side' | 'csi_pov' | 'focus' | 'chase_race';

export interface SceneManagerOptions {
  container: HTMLDivElement;
  onSelectComponent: (id: ComponentId | null) => void;
  onHoverComponent: (id: ComponentId | null) => void;
  onDriveUpdate?: (state: DriveState) => void;
  onLidarPointUpdate?: (points: { angle: number; distance: number }[]) => void;
  onGameStateUpdate?: (state: RaceGameState) => void;
  onCameraModeChange?: (isVehiclePov: boolean) => void;
  onObstacleProximityChange?: (isNear: boolean) => void;
  onBoostUpdate?: (state: BoostState) => void;
}

export class RobotSceneManager {
  private container: HTMLDivElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private isSoftwareGl: boolean;

  private robotResult!: BuildRobotResult;
  private clock = new THREE.Clock();
  private animFrameId: number = 0;
  private isDestroyed = false;

  // Interactivity
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2(-999, -999);
  private hoveredComponentId: ComponentId | null = null;
  private selectedComponentId: ComponentId | null = null;
  private onSelectCallback: (id: ComponentId | null) => void;
  private onHoverCallback: (id: ComponentId | null) => void;
  private onDriveUpdateCallback?: (state: DriveState) => void;
  private onLidarPointCallback?: (points: { angle: number; distance: number }[]) => void;
  private onGameStateCallback?: (state: RaceGameState) => void;
  private onCameraModeChangeCallback?: (isVehiclePov: boolean) => void;
  private onObstacleProximityCallback?: (isNear: boolean) => void;
  private onBoostUpdateCallback?: (state: BoostState) => void;

  // Robot State
  public explodeProgress = 0;
  private targetExplodeProgress = 0;
  public isLidarActive = true;
  private lidarAngle = 0;

  // Driving Simulation & Turbo Boost
  public driveInput = { forward: 0, turn: 0 }; // -1 to 1
  private robotPosition = new THREE.Vector3(0, 0, 0);
  private robotHeading = 0; // radians
  private leftWheelAngle = 0;
  private rightWheelAngle = 0;
  private totalDistance = 0;
  private readonly boostDuration = 3.0;
  private readonly boostCooldown = 13.0;
  private boostActiveRemaining = 0;
  private boostCooldownRemaining = 0;
  private lastBoostNotifyAt = 0;
  private boostLight!: THREE.PointLight;

  // Camera animation
  private targetCameraPos = new THREE.Vector3(3.2, 2.5, 3.2);
  private targetControlsTarget = new THREE.Vector3(0, 0.7, 0);
  private isAnimatingCamera = false;
  public isChaseCamera = false;
  public isVehiclePovCamera = false;
  private targetCameraFov = 45;
  private _povPos = new THREE.Vector3();
  private _povLookAt = new THREE.Vector3();

  // Materials map for highlighting
  private originalEmissives = new Map<THREE.MeshStandardMaterial, THREE.Color>();

  // Arena & Track Objects
  private contactShadow!: THREE.Mesh;
  private explorationGroup!: THREE.Group;
  private explorationColliders: TerrainCollider[] = [];
  private explorationBeaconRings: THREE.Mesh[] = [];
  private raceTrackGroup!: THREE.Group;
  private raceObstaclesGroup!: THREE.Group;
  private raceGatesGroup!: THREE.Group;
  private dynamicObstacles: { data: ObstacleData; mesh: THREE.Group; initialX: number; initialZ: number }[] = [];
  private gateMeshes = new Map<number, { archMesh: THREE.Group; bannerMesh: THREE.Mesh; lightMesh: THREE.PointLight }>();
  private lidarWorldPoints!: THREE.Points;
  private readonly lidarRayCount = 72;

  // Particle burst & collision sparks
  private sparkParticles!: THREE.Points;
  private sparkVelocities: THREE.Vector3[] = [];
  private sparkLife = 0;

  // Race Game State
  public gameState: RaceGameState = {
    status: 'idle',
    timeElapsed: 0,
    timeLimit: 90, // 90 seconds to finish 70m course
    health: 100,
    score: 0,
    currentCheckpoint: 0,
    totalCheckpoints: 4,
    collisions: 0,
    countdownNumber: 3,
    difficulty: 'medium',
  };

  private countdownTimer = 0;
  private lastCollisionTime = 0;
  private isNearObstacle = false;

  constructor(options: SceneManagerOptions) {
    this.container = options.container;
    this.onSelectCallback = options.onSelectComponent;
    this.onHoverCallback = options.onHoverComponent;
    this.onDriveUpdateCallback = options.onDriveUpdate;
    this.onLidarPointCallback = options.onLidarPointUpdate;
    this.onGameStateCallback = options.onGameStateUpdate;
    this.onCameraModeChangeCallback = options.onCameraModeChange;
    this.onObstacleProximityCallback = options.onObstacleProximityChange;
    this.onBoostUpdateCallback = options.onBoostUpdate;

    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.init();
  }

  private init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 2. Scene & Studio Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.02);

    // 3. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 180);
    this.camera.position.set(3.4, 2.6, 3.4);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.controls.minDistance = 0.8;
    this.controls.maxDistance = 24;
    this.controls.target.set(0, 0.65, 0);
    this.controls.update();

    // 5. Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 6. Studio Lighting Rig
    this.setupLighting();

    // 7. Ground Field, Extended Race Track & Arena
    this.setupArena();

    // 8. Build 3D Robot & rear turbo boost glow light
    this.robotResult = buildRobotModel();
    this.boostLight = new THREE.PointLight(0x06b6d4, 0, 5.5);
    this.boostLight.position.set(0, 0.55, -1.25);
    this.robotResult.rootGroup.add(this.boostLight);
    this.scene.add(this.robotResult.rootGroup);

    // 9. Particle spark effects
    this.setupSparks();

    // 10. Event Listeners
    this.setupEventListeners();

    // 11. Start Animation Loop
    this.tick();
  }

  private setupLighting() {
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 1.3);
    this.scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.6);
    keyLight.position.set(8, 14, 12);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 60;
    const d = 20;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(-10, 8, -8);
    this.scene.add(rimLight);

    // Additional course lights along expanded 70m track
    const courseLight1 = new THREE.PointLight(0x38bdf8, 1.3, 32);
    courseLight1.position.set(0, 4.5, 18);
    this.scene.add(courseLight1);

    const courseLight2 = new THREE.PointLight(0x10b981, 1.4, 32);
    courseLight2.position.set(0, 4.5, 42);
    this.scene.add(courseLight2);

    const courseLight3 = new THREE.PointLight(0x38bdf8, 1.4, 32);
    courseLight3.position.set(0, 4.5, 64);
    this.scene.add(courseLight3);
  }

  private setupArena() {
    // 0. Rich Exploration Terrain (Default visible mode with LiDAR targets)
    const { group: expGroup, colliders, beaconRings } = buildExplorationTerrain();
    this.explorationGroup = expGroup;
    this.explorationColliders = colliders;
    this.explorationBeaconRings = beaconRings;
    this.explorationGroup.visible = true;
    this.scene.add(this.explorationGroup);

    // 1. Race Track Map Group (Hidden until user starts Race Mode!)
    this.raceTrackGroup = new THREE.Group();
    this.raceTrackGroup.name = 'RaceTrackMapRoot';
    this.raceTrackGroup.visible = false;

    const trackWidth = 24;
    const trackLength = 86;
    const trackCenterZ = 35; // Covers Z ∈ [-8, +78], Finish gate at Z = 68
    const trackGeo = new THREE.PlaneGeometry(trackWidth, trackLength);
    trackGeo.rotateX(-Math.PI / 2);

    // Procedural Runway Track Canvas Texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;

    // Dark asphalt / high-tech rubber racing tarmac
    ctx.fillStyle = '#141e2e';
    ctx.fillRect(0, 0, 1024, 2048);

    // Curbs on edges (Red & White racing curbs)
    const curbW = 40;
    const stripeH = 64;
    for (let y = 0; y < 2048; y += stripeH) {
      const isRed = (y / stripeH) % 2 === 0;
      ctx.fillStyle = isRed ? '#ef4444' : '#f8fafc';
      ctx.fillRect(0, y, curbW, stripeH);
      ctx.fillRect(1024 - curbW, y, curbW, stripeH);
    }

    // Lane border stripes
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(curbW + 20, 0);
    ctx.lineTo(curbW + 20, 2048);
    ctx.moveTo(1024 - curbW - 20, 0);
    ctx.lineTo(1024 - curbW - 20, 2048);
    ctx.stroke();

    // Multi-lane subtle white dashed dividers (left & right sub-lanes)
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)';
    ctx.lineWidth = 6;
    ctx.setLineDash([65, 55]);
    ctx.beginPath();
    ctx.moveTo(285, 0);
    ctx.lineTo(285, 2048);
    ctx.moveTo(739, 0);
    ctx.lineTo(739, 2048);
    ctx.stroke();

    // Center Dashed Navigation Guideline
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 10;
    ctx.setLineDash([80, 50]);
    ctx.beginPath();
    ctx.moveTo(512, 0);
    ctx.lineTo(512, 2048);
    ctx.stroke();
    ctx.setLineDash([]);

    // START GRID MARKINGS at Z ≈ 0 (y ≈ 1858)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('START / XUẤT PHÁT', 512, 1865);

    // Arrow pointing forward (+Z direction in world)
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(512, 1710);
    ctx.lineTo(464, 1775);
    ctx.lineTo(496, 1775);
    ctx.lineTo(496, 1815);
    ctx.lineTo(528, 1815);
    ctx.lineTo(528, 1775);
    ctx.lineTo(560, 1775);
    ctx.closePath();
    ctx.fill();

    // FINISH GRID CHESSBOARD at Z ≈ 68 (y ≈ 238)
    const fBoxSize = 32;
    for (let y = 195; y <= 265; y += fBoxSize) {
      for (let x = curbW + 20; x < 1024 - curbW - 20; x += fBoxSize) {
        ctx.fillStyle = ((x + y) / fBoxSize) % 2 === 0 ? '#ffffff' : '#0f172a';
        ctx.fillRect(x, y, fBoxSize, fBoxSize);
      }
    }
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 58px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('🏁 FINISH 🏁', 512, 165);

    const trackTex = new THREE.CanvasTexture(canvas);
    trackTex.colorSpace = THREE.SRGBColorSpace;
    trackTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const trackMat = new THREE.MeshStandardMaterial({
      map: trackTex,
      roughness: 0.65,
      metalness: 0.2,
    });

    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.position.set(0, -0.005, trackCenterZ);
    trackMesh.receiveShadow = true;
    this.raceTrackGroup.add(trackMesh);

    // Surrounding outer race arena turf
    const outerGeo = new THREE.PlaneGeometry(130, 130);
    outerGeo.rotateX(-Math.PI / 2);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x0f2619,
      roughness: 0.9,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    outerMesh.position.set(0, -0.015, trackCenterZ);
    outerMesh.receiveShadow = true;
    this.raceTrackGroup.add(outerMesh);

    // Track safety side barriers
    for (const side of [-trackWidth / 2, trackWidth / 2]) {
      const railGeo = new THREE.BoxGeometry(0.4, 0.75, trackLength);
      const railMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.4,
        metalness: 0.8,
      });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(side, 0.375, trackCenterZ);
      rail.castShadow = true;
      rail.receiveShadow = true;
      this.raceTrackGroup.add(rail);

      const tapeGeo = new THREE.BoxGeometry(0.42, 0.1, trackLength);
      const tapeMat = new THREE.MeshStandardMaterial({ color: 0xeab308 });
      const tape = new THREE.Mesh(tapeGeo, tapeMat);
      tape.position.set(side, 0.75, trackCenterZ);
      this.raceTrackGroup.add(tape);
    }

    // Build Race Obstacles & Checkpoint Gates inside raceTrackGroup
    const { group: obsGroup, dynamicMeshes } = buildRaceObstacles(RACE_COURSE_OBSTACLES);
    this.raceObstaclesGroup = obsGroup;
    this.dynamicObstacles = dynamicMeshes;
    this.raceTrackGroup.add(obsGroup);

    const { group: gatesGroup, gateMeshes } = buildRaceGates(RACE_CHECKPOINTS);
    this.raceGatesGroup = gatesGroup;
    this.gateMeshes = gateMeshes;
    this.raceTrackGroup.add(gatesGroup);

    this.scene.add(this.raceTrackGroup);

    // Soft Radial Contact Shadow under Robot (shared across both maps)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(3.2, 3.2);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    this.contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.contactShadow.position.y = 0.005;
    this.scene.add(this.contactShadow);

    // 3D Real-time LiDAR Hit Point Cloud
    this.setupLidarPointCloud();
  }

  private setupLidarPointCloud() {
    const totalPts = this.lidarRayCount * 2;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(totalPts * 3);
    const colors = new Float32Array(totalPts * 3);

    for (let i = 0; i < totalPts; i++) {
      positions[i * 3 + 1] = -20;
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.2;
      colors[i * 3 + 2] = 0.3;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });

    this.lidarWorldPoints = new THREE.Points(geo, mat);
    this.lidarWorldPoints.frustumCulled = false;
    this.scene.add(this.lidarWorldPoints);
  }

  private setupSparks() {
    const sparkCount = 45;
    const sparkGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(sparkCount * 3);
    this.sparkVelocities = [];

    for (let i = 0; i < sparkCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -10;
      positions[i * 3 + 2] = 0;
      this.sparkVelocities.push(new THREE.Vector3());
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.16,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    this.sparkParticles = new THREE.Points(sparkGeo, sparkMat);
    this.scene.add(this.sparkParticles);
  }

  private triggerSparkBurst(pos: THREE.Vector3) {
    const posAttr = this.sparkParticles.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < this.sparkVelocities.length; i++) {
      arr[i * 3] = pos.x;
      arr[i * 3 + 1] = pos.y + 0.35;
      arr[i * 3 + 2] = pos.z;

      this.sparkVelocities[i].set(
        (Math.random() - 0.5) * 6,
        Math.random() * 4 + 1.5,
        (Math.random() - 0.5) * 6
      );
    }
    posAttr.needsUpdate = true;
    this.sparkLife = 0.55;
  }

  private setupEventListeners() {
    const el = this.renderer.domElement;

    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.checkHover();
    });

    el.addEventListener('pointerdown', () => {
      this.isAnimatingCamera = false;
    });

    el.addEventListener('click', () => {
      this.handleClick();
    });

    window.addEventListener('resize', this.onWindowResize);
  }

  private onWindowResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private checkHover() {
    if (this.gameState.status === 'racing' || this.gameState.status === 'countdown' || this.isVehiclePovCamera) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.robotResult.rootGroup.children, true);

    let foundId: ComponentId | null = null;
    for (const hit of intersects) {
      let curr: THREE.Object3D | null = hit.object;
      while (curr && curr !== this.robotResult.rootGroup) {
        if (curr.userData.componentId) {
          foundId = curr.userData.componentId as ComponentId;
          break;
        }
        curr = curr.parent;
      }
      if (foundId) break;
    }

    if (foundId !== this.hoveredComponentId) {
      this.hoveredComponentId = foundId;
      this.container.style.cursor = foundId ? 'pointer' : 'default';
      this.onHoverCallback(foundId);
      this.applyHighlight();
    }
  }

  private handleClick() {
    if (this.gameState.status === 'racing' || this.gameState.status === 'countdown' || this.isVehiclePovCamera) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.robotResult.rootGroup.children, true);

    let foundId: ComponentId | null = null;
    for (const hit of intersects) {
      let curr: THREE.Object3D | null = hit.object;
      while (curr && curr !== this.robotResult.rootGroup) {
        if (curr.userData.componentId) {
          foundId = curr.userData.componentId as ComponentId;
          break;
        }
        curr = curr.parent;
      }
      if (foundId) break;
    }

    this.selectComponent(foundId);
  }

  public selectComponent(id: ComponentId | null) {
    this.selectedComponentId = id;
    this.onSelectCallback(id);
    this.applyHighlight();

    if (id) {
      const objects = this.robotResult.componentGroups.get(id);
      if (objects && objects.length > 0) {
        const box = new THREE.Box3();
        objects.forEach((obj) => box.expandByObject(obj));
        const center = new THREE.Vector3();
        box.getCenter(center);
        this.focusOnPoint(center, 1.8);
      }
    }
  }

  private computeVehiclePovVectors() {
    const sinH = Math.sin(this.robotHeading);
    const cosH = Math.cos(this.robotHeading);
    // Placed right ahead of the CSI fisheye lens dome so robot geometry never clips the near plane
    this._povPos.set(
      this.robotPosition.x + sinH * 1.28,
      1.0,
      this.robotPosition.z + cosH * 1.28
    );
    this._povLookAt.set(
      this.robotPosition.x + sinH * 8.0,
      0.45,
      this.robotPosition.z + cosH * 8.0
    );
  }

  private setVehiclePovState(active: boolean) {
    const changed = this.isVehiclePovCamera !== active;
    this.isVehiclePovCamera = active;

    if (active) {
      this.isChaseCamera = false;
      this.isAnimatingCamera = false;
      this.controls.enabled = false;
      this.targetCameraFov = 68;
      this.hoveredComponentId = null;
      this.container.style.cursor = 'default';
      this.computeVehiclePovVectors();
      this.camera.position.copy(this._povPos);
      this.controls.target.copy(this._povLookAt);
      this.camera.lookAt(this._povLookAt);
    } else {
      this.controls.enabled = true;
      this.targetCameraFov = 45;
    }

    if (changed) {
      this.onCameraModeChangeCallback?.(active);
    }
  }

  public toggleVehiclePov(): boolean {
    if (this.isVehiclePovCamera) {
      this.setVehiclePovState(false);
      if (this.gameState.status !== 'idle') {
        this.isChaseCamera = true;
      } else {
        this.setCameraPreset('isometric');
      }
    } else {
      this.setVehiclePovState(true);
    }
    return this.isVehiclePovCamera;
  }

  public focusOnPoint(targetPos: THREE.Vector3, distance = 2.2) {
    this.setVehiclePovState(false);
    this.isChaseCamera = false;
    this.targetControlsTarget.copy(targetPos);
    this.targetCameraPos.set(
      targetPos.x + distance * 0.7,
      targetPos.y + distance * 0.55,
      targetPos.z + distance * 0.7
    );
    this.isAnimatingCamera = true;
  }

  public setCameraPreset(preset: CameraPreset) {
    if (preset === 'csi_pov') {
      this.setVehiclePovState(true);
      return;
    }

    this.setVehiclePovState(false);
    this.isAnimatingCamera = true;
    const center = this.robotResult.rootGroup.position.clone().add(new THREE.Vector3(0, 0.65, 0));
    this.targetControlsTarget.copy(center);

    if (preset === 'chase_race') {
      this.isChaseCamera = true;
      return;
    }

    this.isChaseCamera = false;

    switch (preset) {
      case 'isometric':
        this.targetCameraPos.set(center.x + 3.2, center.y + 2.4, center.z + 3.2);
        break;
      case 'front':
        this.targetCameraPos.set(center.x, center.y + 0.5, center.z + 3.8);
        break;
      case 'top':
        this.targetCameraPos.set(center.x + 0.01, center.y + 6.0, center.z);
        break;
      case 'side':
        this.targetCameraPos.set(center.x + 4.0, center.y + 0.5, center.z);
        break;
      case 'focus':
        this.targetCameraPos.set(center.x + 2.0, center.y + 1.2, center.z + 2.0);
        break;
    }
  }

  public setExplodeProgress(value: number) {
    this.targetExplodeProgress = Math.max(0, Math.min(1, value));
  }

  public toggleLidar(active?: boolean) {
    this.isLidarActive = active !== undefined ? active : !this.isLidarActive;
    this.robotResult.partsMap.lidarLaserBeam.visible = this.isLidarActive;
    if (this.lidarWorldPoints) {
      this.lidarWorldPoints.visible = this.isLidarActive;
    }
  }

  private applyHighlight() {
    const activeId = this.selectedComponentId || this.hoveredComponentId;

    this.robotResult.componentGroups.forEach((objects, compId) => {
      const isTarget = compId === activeId;
      objects.forEach((obj) => {
        obj.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (!mat || !mat.emissive) return;

            if (!this.originalEmissives.has(mat)) {
              this.originalEmissives.set(mat, mat.emissive.clone());
            }

            if (isTarget) {
              mat.emissive.setHex(0x38bdf8);
              mat.emissiveIntensity = 0.5;
            } else {
              const orig = this.originalEmissives.get(mat);
              if (orig) {
                mat.emissive.copy(orig);
                mat.emissiveIntensity = 0.0;
              }
            }
          }
        });
      });
    });
  }

  private setRaceMapVisible(show: boolean) {
    if (this.raceTrackGroup) {
      this.raceTrackGroup.visible = show;
    }
    if (this.explorationGroup) {
      this.explorationGroup.visible = !show;
    }
  }

  private raycastActiveMap(
    originX: number,
    originZ: number,
    dirX: number,
    dirZ: number,
    maxRange: number,
    inflateRadius = 0
  ): number {
    let minDist = maxRange;

    if (this.raceTrackGroup?.visible) {
      // Track side barriers at X = ±11.7
      const boundX = 11.7 - inflateRadius;
      if (Math.abs(dirX) > 0.001) {
        const distL = (-boundX - originX) / dirX;
        if (distL > 0 && distL < minDist) minDist = distL;
        const distR = (boundX - originX) / dirX;
        if (distR > 0 && distR < minDist) minDist = distR;
      }

      if (Math.abs(dirZ) > 0.001) {
        const distBack = (-4.0 - originZ) / dirZ;
        if (distBack > 0 && distBack < minDist) minDist = distBack;
        const distFront = (74.0 - originZ) / dirZ;
        if (distFront > 0 && distFront < minDist) minDist = distFront;
      }

      for (const obs of RACE_COURSE_OBSTACLES) {
        let obsX = obs.x;
        let obsZ = obs.z;

        if (obs.isMoving) {
          const dObj = this.dynamicObstacles.find((o) => o.data.id === obs.id);
          if (dObj) {
            obsX = dObj.mesh.position.x;
            obsZ = dObj.mesh.position.z;
          }
        }

        const r = obs.radius + inflateRadius;
        const toObsX = obsX - originX;
        const toObsZ = obsZ - originZ;
        const dot = toObsX * dirX + toObsZ * dirZ;
        if (dot > 0) {
          const perpSq = toObsX * toObsX + toObsZ * toObsZ - dot * dot;
          const rSq = r * r;
          if (perpSq <= rSq) {
            const hitDist = dot - Math.sqrt(Math.max(0, rSq - perpSq));
            if (hitDist > 0 && hitDist < minDist) {
              minDist = hitDist;
            }
          }
        }
      }
      return minDist;
    }

    // Exploration Rich Terrain colliders (circles & rotated boxes)
    for (const col of this.explorationColliders) {
      if (col.kind === 'circle') {
        const r = col.radius + inflateRadius;
        const toX = col.x - originX;
        const toZ = col.z - originZ;
        const dot = toX * dirX + toZ * dirZ;
        if (dot > 0) {
          const perpSq = toX * toX + toZ * toZ - dot * dot;
          const rSq = r * r;
          if (perpSq <= rSq) {
            const hitDist = dot - Math.sqrt(Math.max(0, rSq - perpSq));
            if (hitDist > 0 && hitDist < minDist) {
              minDist = hitDist;
            }
          }
        }
      } else {
        // Transform ray to box-local space (undo rotY around Y axis)
        const cosR = Math.cos(col.rotY);
        const sinR = Math.sin(col.rotY);
        const dx = originX - col.x;
        const dz = originZ - col.z;

        const lx = dx * cosR - dz * sinR;
        const lz = dx * sinR + dz * cosR;
        const lDirX = dirX * cosR - dirZ * sinR;
        const lDirZ = dirX * sinR + dirZ * cosR;

        const hw = col.halfW + inflateRadius;
        const hd = col.halfD + inflateRadius;

        let tMin = 0;
        let tMax = minDist;

        if (Math.abs(lDirX) < 1e-6) {
          if (lx < -hw || lx > hw) continue;
        } else {
          let t1 = (-hw - lx) / lDirX;
          let t2 = (hw - lx) / lDirX;
          if (t1 > t2) [t1, t2] = [t2, t1];
          tMin = Math.max(tMin, t1);
          tMax = Math.min(tMax, t2);
          if (tMin > tMax) continue;
        }

        if (Math.abs(lDirZ) < 1e-6) {
          if (lz < -hd || lz > hd) continue;
        } else {
          let t1 = (-hd - lz) / lDirZ;
          let t2 = (hd - lz) / lDirZ;
          if (t1 > t2) [t1, t2] = [t2, t1];
          tMin = Math.max(tMin, t1);
          tMax = Math.min(tMax, t2);
          if (tMin > tMax) continue;
        }

        if (tMin > 0.05 && tMin < minDist) {
          minDist = tMin;
        }
      }
    }

    return minDist;
  }

  // LiDAR Ranging across active terrain/track & 3D point cloud update
  private simulateLidarRanging() {
    if (!this.isLidarActive) return;

    const points: { angle: number; distance: number }[] = [];
    const robotX = this.robotPosition.x;
    const robotZ = this.robotPosition.z;

    // 1. 2D Costmap Radar points (robot-relative angles so front aligns with UP on HUD)
    for (let deg = 0; deg < 360; deg += 10) {
      const worldRad = this.robotHeading - (deg * Math.PI) / 180;
      const dirX = Math.sin(worldRad);
      const dirZ = Math.cos(worldRad);
      let minDist = this.raycastActiveMap(robotX, robotZ, dirX, dirZ, 8.0, 0);
      minDist = Math.max(0.25, minDist + (Math.random() - 0.5) * 0.03);
      points.push({ angle: deg, distance: Number(minDist.toFixed(2)) });
    }

    if (this.onLidarPointCallback) {
      this.onLidarPointCallback(points);
    }

    // 2. 3D World LiDAR Hit Point Cloud (72 rays at laser plane & ground echo)
    if (this.lidarWorldPoints) {
      const posAttr = this.lidarWorldPoints.geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = this.lidarWorldPoints.geometry.attributes.color as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const colArr = colAttr.array as Float32Array;
      const max3DRange = 10.5;
      const laserY = 1.98 + this.explodeProgress * 2.85;

      for (let i = 0; i < this.lidarRayCount; i++) {
        const rad = (i / this.lidarRayCount) * Math.PI * 2;
        const dirX = Math.sin(rad);
        const dirZ = Math.cos(rad);
        const dist = this.raycastActiveMap(robotX, robotZ, dirX, dirZ, max3DRange, 0);

        const idxHigh = i * 2;
        const idxLow = i * 2 + 1;

        if (dist < max3DRange - 0.15) {
          const hitX = robotX + dirX * dist;
          const hitZ = robotZ + dirZ * dist;

          // Laser plane hit marker
          posArr[idxHigh * 3] = hitX;
          posArr[idxHigh * 3 + 1] = laserY;
          posArr[idxHigh * 3 + 2] = hitZ;

          // Ground SLAM contour dot
          posArr[idxLow * 3] = hitX;
          posArr[idxLow * 3 + 1] = 0.07;
          posArr[idxLow * 3 + 2] = hitZ;

          const isClose = dist < 2.5;
          colArr[idxHigh * 3] = 1.0;
          colArr[idxHigh * 3 + 1] = isClose ? 0.18 : 0.35;
          colArr[idxHigh * 3 + 2] = isClose ? 0.25 : 0.45;

          colArr[idxLow * 3] = isClose ? 1.0 : 0.13;
          colArr[idxLow * 3 + 1] = isClose ? 0.22 : 0.88;
          colArr[idxLow * 3 + 2] = isClose ? 0.22 : 0.95;
        } else {
          posArr[idxHigh * 3 + 1] = -20;
          posArr[idxLow * 3 + 1] = -20;
        }
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }
  }

  private castRobotRay(angleOffsetRad: number): number {
    const worldAngle = this.robotHeading + angleOffsetRad;
    const dirX = Math.sin(worldAngle);
    const dirZ = Math.cos(worldAngle);
    const dist = this.raycastActiveMap(this.robotPosition.x, this.robotPosition.z, dirX, dirZ, 10.0, 0.55);
    return Number(Math.max(0.1, dist).toFixed(2));
  }

  public getAutonomousSensors(scriptElapsedTime = 0): AutonomousSensors {
    let normHeading = this.robotHeading % (Math.PI * 2);
    if (normHeading > Math.PI) normHeading -= Math.PI * 2;
    if (normHeading < -Math.PI) normHeading += Math.PI * 2;

    return {
      front: this.castRobotRay(0),
      frontLeft: this.castRobotRay(0.48),
      frontRight: this.castRobotRay(-0.48),
      left: this.castRobotRay(1.22),
      right: this.castRobotRay(-1.22),
      x: Number(this.robotPosition.x.toFixed(2)),
      z: Number(this.robotPosition.z.toFixed(2)),
      headingRad: Number(normHeading.toFixed(3)),
      headingDeg: Math.round((normHeading * 180) / Math.PI),
      time: Number(scriptElapsedTime.toFixed(2)),
    };
  }

  // RACE GAME CONTROLS & LIFECYCLE
  public startRace(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    // Show the obstacle race track map and hide normal exploration terrain
    this.setRaceMapVisible(true);

    // Reset gate beacon intensities
    this.gateMeshes.forEach((gMesh) => {
      gMesh.lightMesh.intensity = 1.8;
    });

    this.gameState = {
      status: 'countdown',
      timeElapsed: 0,
      timeLimit: difficulty === 'easy' ? 115 : difficulty === 'medium' ? 90 : 70,
      health: 100,
      score: 0,
      currentCheckpoint: 0,
      totalCheckpoints: RACE_CHECKPOINTS.length,
      collisions: 0,
      countdownNumber: 3,
      difficulty,
    };

    this.countdownTimer = 3.5;
    this.explodeProgress = 0;
    this.targetExplodeProgress = 0;
    this.robotResult.updateExplode(0);

    // Reset robot to starting grid
    this.robotPosition.set(0, 0, 0);
    this.robotHeading = 0;
    this.driveInput = { forward: 0, turn: 0 };
    this.robotResult.rootGroup.position.set(0, 0, 0);
    this.robotResult.rootGroup.rotation.y = 0;
    this.contactShadow.position.set(0, 0.005, 0);

    // Switch to chase race camera & reset turbo boost
    this.resetBoostState();
    this.setVehiclePovState(false);
    this.isChaseCamera = true;

    soundFX.playCountdown(false);
    this.notifyGameState();
  }

  public stopRace() {
    this.gameState.status = 'idle';
    // Hide the race track map and restore rich exploration terrain
    this.resetBoostState();
    this.setRaceMapVisible(false);
    this.setVehiclePovState(false);
    this.isChaseCamera = false;
    this.driveInput = { forward: 0, turn: 0 };
    this.notifyGameState();
  }

  public triggerBoost(): boolean {
    if (
      this.boostActiveRemaining > 0 ||
      this.boostCooldownRemaining > 0 ||
      this.gameState.status === 'countdown' ||
      this.gameState.status === 'crashed' ||
      this.gameState.status === 'timeout'
    ) {
      return false;
    }

    this.boostActiveRemaining = this.boostDuration;
    if (this.boostLight) {
      this.boostLight.intensity = 3.0;
    }
    soundFX.playBoost();
    this.notifyBoostState(true);
    return true;
  }

  private resetBoostState() {
    this.boostActiveRemaining = 0;
    this.boostCooldownRemaining = 0;
    if (this.boostLight) {
      this.boostLight.intensity = 0;
    }
    this.notifyBoostState(true);
  }

  private notifyBoostState(force = false) {
    if (!this.onBoostUpdateCallback) return;
    const now = performance.now();
    if (!force && now - this.lastBoostNotifyAt < 75) return;
    this.lastBoostNotifyAt = now;

    this.onBoostUpdateCallback({
      isActive: this.boostActiveRemaining > 0,
      activeRemaining: Number(this.boostActiveRemaining.toFixed(1)),
      cooldownRemaining: Number(this.boostCooldownRemaining.toFixed(1)),
      duration: this.boostDuration,
      cooldownDuration: this.boostCooldown,
    });
  }

  private notifyGameState() {
    if (this.onGameStateCallback) {
      this.onGameStateCallback({ ...this.gameState });
    }
  }

  private updateRaceSimulation(delta: number) {
    const state = this.gameState;

    // 1. Countdown handling
    if (state.status === 'countdown') {
      this.countdownTimer -= delta;
      const count = Math.ceil(this.countdownTimer);

      if (count !== state.countdownNumber && count >= 0) {
        state.countdownNumber = count;
        soundFX.playCountdown(count === 0);
        this.notifyGameState();
      }

      if (this.countdownTimer <= 0) {
        state.status = 'racing';
        state.countdownNumber = 0;
        this.notifyGameState();
      }
      return;
    }

    // 2. Active Racing
    if (state.status === 'racing') {
      state.timeElapsed += delta;

      // Timeout check -> hide race map when lost
      if (state.timeElapsed >= state.timeLimit) {
        state.status = 'timeout';
        this.setRaceMapVisible(false);
        this.resetToCenterForExploration();
        soundFX.playGameOver();
        this.notifyGameState();
        return;
      }

      // Check Checkpoints & Finish Line
      RACE_CHECKPOINTS.forEach((gate) => {
        if (state.currentCheckpoint < gate.id) {
          // If robot crossed gate.z plane within gate width
          const prevZ = this.robotPosition.z - 0.2;
          const currZ = this.robotPosition.z;

          if (prevZ <= gate.z && currZ >= gate.z) {
            const halfW = gate.width / 2;
            if (Math.abs(this.robotPosition.x) <= halfW) {
              // Valid checkpoint pass
              state.currentCheckpoint = gate.id;
              state.score += 500;

              // Visual green flash on gate
              const gMesh = this.gateMeshes.get(gate.id);
              if (gMesh) {
                gMesh.lightMesh.intensity = 4.0;
              }

              if (gate.id === RACE_CHECKPOINTS.length) {
                // VICTORY!
                state.status = 'victory';
                const timeBonus = Math.max(0, Math.round((state.timeLimit - state.timeElapsed) * 50));
                const healthBonus = Math.round(state.health * 10);
                state.score += timeBonus + healthBonus;
                soundFX.playVictory();
              } else {
                soundFX.playCheckpoint();
              }

              this.notifyGameState();
            }
          }
        }
      });

      // Periodic state broadcast
      this.notifyGameState();
    }
  }

  private updateObstacles(delta: number) {
    const elapsed = this.clock.getElapsedTime();

    if (this.raceTrackGroup?.visible) {
      this.dynamicObstacles.forEach((item, idx) => {
        const speed = item.data.moveSpeed || 1.8;
        const range = item.data.moveRange || 2.5;
        const offset = Math.sin(elapsed * speed + idx * 1.35) * range;

        if (item.data.moveAxis === 'x') {
          item.mesh.position.x = item.initialX + offset;
        } else {
          item.mesh.position.z = item.initialZ + offset;
        }
      });
    } else if (this.explorationGroup?.visible) {
      this.explorationBeaconRings.forEach((ring, idx) => {
        ring.rotation.z = elapsed * (1.2 + idx * 0.15);
      });
    }

    // Animate sparks
    if (this.sparkLife > 0) {
      this.sparkLife -= delta;
      const posAttr = this.sparkParticles.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < this.sparkVelocities.length; i++) {
        arr[i * 3] += this.sparkVelocities[i].x * delta;
        arr[i * 3 + 1] += this.sparkVelocities[i].y * delta;
        arr[i * 3 + 2] += this.sparkVelocities[i].z * delta;

        this.sparkVelocities[i].y -= 9.8 * delta; // Gravity
      }
      posAttr.needsUpdate = true;
    }
  }

  private getExplorationMinClearance(posX: number, posZ: number, robotRadius: number): number {
    let minClearance = Infinity;

    for (const col of this.explorationColliders) {
      if (col.kind === 'circle') {
        const dist = Math.hypot(posX - col.x, posZ - col.z);
        const clearance = dist - (robotRadius + col.radius);
        if (clearance < minClearance) minClearance = clearance;
      } else {
        const cosR = Math.cos(col.rotY);
        const sinR = Math.sin(col.rotY);
        const dx = posX - col.x;
        const dz = posZ - col.z;
        const lx = dx * cosR - dz * sinR;
        const lz = dx * sinR + dz * cosR;

        const clampedX = Math.max(-col.halfW, Math.min(col.halfW, lx));
        const clampedZ = Math.max(-col.halfD, Math.min(col.halfD, lz));
        const dist = Math.hypot(lx - clampedX, lz - clampedZ);
        const clearance = dist - robotRadius;
        if (clearance < minClearance) minClearance = clearance;
      }
    }

    return minClearance;
  }

  private checkCollisionAndDamage(pos: THREE.Vector3): boolean {
    const now = performance.now();
    const robotRadius = 1.25;

    if (this.raceTrackGroup?.visible) {
      // Check track sidewall barriers (-12 to +12)
      if (Math.abs(pos.x) > 11.7 - robotRadius * 0.4) {
        if (now - this.lastCollisionTime > 600) {
          this.lastCollisionTime = now;
          this.handleHit(pos, 15);
        }
        return true;
      }

      // Check race obstacle meshes
      for (const obs of RACE_COURSE_OBSTACLES) {
        let obsX = obs.x;
        let obsZ = obs.z;

        if (obs.isMoving) {
          const dObj = this.dynamicObstacles.find((o) => o.data.id === obs.id);
          if (dObj) {
            obsX = dObj.mesh.position.x;
            obsZ = dObj.mesh.position.z;
          }
        }

        const dist = Math.hypot(pos.x - obsX, pos.z - obsZ);
        const minDist = robotRadius * 0.65 + obs.radius;

        if (dist < minDist) {
          if (now - this.lastCollisionTime > 600) {
            this.lastCollisionTime = now;
            this.handleHit(pos, obs.type === 'moving_drone' ? 25 : 18);
          }
          return true;
        }
      }

      return false;
    }

    // Exploration terrain collision
    const clearance = this.getExplorationMinClearance(pos.x, pos.z, robotRadius * 0.65);
    if (clearance < 0) {
      if (now - this.lastCollisionTime > 600) {
        this.lastCollisionTime = now;
        this.handleHit(pos, 0);
      }
      return true;
    }

    return false;
  }

  private handleHit(hitPos: THREE.Vector3, damage: number) {
    soundFX.playCollision();
    this.triggerSparkBurst(hitPos);

    if (this.gameState.status === 'racing') {
      this.gameState.health = Math.max(0, this.gameState.health - damage);
      this.gameState.collisions += 1;
      this.gameState.score = Math.max(0, this.gameState.score - 100);

      if (this.gameState.health <= 0) {
        this.gameState.status = 'crashed';
        // Hide race map immediately when lost
        this.setRaceMapVisible(false);
        this.resetToCenterForExploration();
        soundFX.playGameOver();
      }
      this.notifyGameState();
    }
  }

  private updateObstacleProximity() {
    const canWarn = this.gameState.status === 'idle' || this.gameState.status === 'racing';
    let near = false;

    if (canWarn) {
      const warningClearance = 1.35; // meters before collision threshold
      const robotCollisionRadius = 1.25 * 0.65;

      if (this.raceTrackGroup?.visible) {
        if (11.1 - Math.abs(this.robotPosition.x) < warningClearance) {
          near = true;
        } else {
          for (const obs of RACE_COURSE_OBSTACLES) {
            let obsX = obs.x;
            let obsZ = obs.z;

            if (obs.isMoving) {
              const dObj = this.dynamicObstacles.find((o) => o.data.id === obs.id);
              if (dObj) {
                obsX = dObj.mesh.position.x;
                obsZ = dObj.mesh.position.z;
              }
            }

            const dist = Math.hypot(this.robotPosition.x - obsX, this.robotPosition.z - obsZ);
            const minDist = robotCollisionRadius + obs.radius;
            if (dist - minDist < warningClearance) {
              near = true;
              break;
            }
          }
        }
      } else {
        const clearance = this.getExplorationMinClearance(
          this.robotPosition.x,
          this.robotPosition.z,
          robotCollisionRadius
        );
        if (clearance < warningClearance) {
          near = true;
        }
      }
    }

    if (near !== this.isNearObstacle) {
      this.isNearObstacle = near;
      this.onObstacleProximityCallback?.(near);
    }
  }

  private updateDrivePhysics(delta: number) {
    let maxLinearSpeed = 2.4; // m/s
    let maxAngularSpeed = 2.8; // rad/s

    // Speed up in hard mode
    if (this.gameState.difficulty === 'hard') {
      maxLinearSpeed = 3.2;
      maxAngularSpeed = 3.4;
    }

    // Disable drive inputs during countdown or game over
    if (
      this.gameState.status === 'countdown' ||
      this.gameState.status === 'crashed' ||
      this.gameState.status === 'timeout'
    ) {
      return;
    }

    // Update 3s Boost (2x speed) & 13s Cooldown timers
    if (this.boostActiveRemaining > 0) {
      this.boostActiveRemaining = Math.max(0, this.boostActiveRemaining - delta);
      if (this.boostActiveRemaining === 0) {
        this.boostCooldownRemaining = this.boostCooldown;
        if (this.boostLight) this.boostLight.intensity = 0;
        this.notifyBoostState(true);
      } else {
        this.notifyBoostState(false);
      }
    } else if (this.boostCooldownRemaining > 0) {
      this.boostCooldownRemaining = Math.max(0, this.boostCooldownRemaining - delta);
      this.notifyBoostState(this.boostCooldownRemaining === 0);
    }

    const isBoosting = this.boostActiveRemaining > 0;
    if (isBoosting) {
      maxLinearSpeed *= 2.0;
      maxAngularSpeed *= 1.3;
    }
    this.targetCameraFov = this.isVehiclePovCamera
      ? (isBoosting ? 76 : 68)
      : (isBoosting ? 53 : 45);

    const v = this.driveInput.forward * maxLinearSpeed;
    const w = this.driveInput.turn * maxAngularSpeed;

    if (Math.abs(v) > 0.01 || Math.abs(w) > 0.01) {
      this.robotHeading += w * delta;
      const moveDist = v * delta;

      const newX = this.robotPosition.x + Math.sin(this.robotHeading) * moveDist;
      const newZ = this.robotPosition.z + Math.cos(this.robotHeading) * moveDist;

      let clampedX = newX;
      let clampedZ = newZ;

      if (this.raceTrackGroup?.visible) {
        // Restrict track bounds: X [-11.6, 11.6], Z [-4.0, 74.0]
        clampedX = Math.max(-11.6, Math.min(11.6, newX));
        clampedZ = Math.max(-4.0, Math.min(74.0, newZ));
      } else {
        // Restrict exploration arena circular bounds (R <= 14.8)
        const r = Math.hypot(newX, newZ);
        if (r > 14.8) {
          clampedX = (newX / r) * 14.8;
          clampedZ = (newZ / r) * 14.8;
        }
      }

      const candidatePos = new THREE.Vector3(clampedX, this.robotPosition.y, clampedZ);

      // Check collision
      const isBlocked = this.checkCollisionAndDamage(candidatePos);
      if (isBlocked) {
        // Bounce back slightly
        this.robotPosition.x -= Math.sin(this.robotHeading) * moveDist * 0.4;
        this.robotPosition.z -= Math.cos(this.robotHeading) * moveDist * 0.4;
      } else {
        this.robotPosition.copy(candidatePos);
      }

      this.totalDistance += Math.abs(moveDist);

      // Wheel rotation
      const wheelR = 0.38;
      const trackWidth = 2.04;
      const leftV = v + (w * trackWidth) / 2;
      const rightV = v - (w * trackWidth) / 2;

      this.leftWheelAngle += (leftV / wheelR) * delta;
      this.rightWheelAngle += (rightV / wheelR) * delta;

      this.robotResult.updateWheelRotation(this.leftWheelAngle, this.rightWheelAngle);

      // Update robot transform & contact shadow
      this.robotResult.rootGroup.position.copy(this.robotPosition);
      this.robotResult.rootGroup.rotation.y = this.robotHeading;
      this.contactShadow.position.set(this.robotPosition.x, 0.005, this.robotPosition.z);

      // Telemetry
      if (this.onDriveUpdateCallback) {
        this.onDriveUpdateCallback({
          linearVelocity: Number(v.toFixed(2)),
          angularVelocity: Number(w.toFixed(2)),
          leftWheelSpeed: Math.round((leftV / (2 * Math.PI * wheelR)) * 60),
          rightWheelSpeed: Math.round((rightV / (2 * Math.PI * wheelR)) * 60),
          heading: Math.round(((this.robotHeading * 180) / Math.PI) % 360),
          distanceTraveled: Number(this.totalDistance.toFixed(2)),
        });
      }
    }
  }

  private updateChaseCamera(delta: number) {
    if (!this.isChaseCamera) return;

    // Follow robot from behind and above with spring damping
    const followDistance = 4.2;
    const height = 2.4;

    const backX = this.robotPosition.x - Math.sin(this.robotHeading) * followDistance;
    const backZ = this.robotPosition.z - Math.cos(this.robotHeading) * followDistance;

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, backX, 8, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, height, 8, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, backZ, 8, delta);

    // Look at robot center + slightly forward
    const lookTarget = new THREE.Vector3(
      this.robotPosition.x + Math.sin(this.robotHeading) * 1.5,
      0.8,
      this.robotPosition.z + Math.cos(this.robotHeading) * 1.5
    );

    this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, lookTarget.x, 10, delta);
    this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, lookTarget.y, 10, delta);
    this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, lookTarget.z, 10, delta);
  }

  private updateVehiclePovCamera(delta: number) {
    if (!this.isVehiclePovCamera) return;

    this.computeVehiclePovVectors();

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this._povPos.x, 24, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this._povPos.y, 24, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this._povPos.z, 24, delta);

    this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, this._povLookAt.x, 24, delta);
    this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, this._povLookAt.y, 24, delta);
    this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, this._povLookAt.z, 24, delta);

    this.camera.lookAt(this.controls.target);
  }

  private tick = () => {
    if (this.isDestroyed) return;

    const delta = Math.min(this.clock.getDelta(), 0.05);

    // 1. Explode interpolation
    if (Math.abs(this.explodeProgress - this.targetExplodeProgress) > 0.001) {
      this.explodeProgress = THREE.MathUtils.damp(
        this.explodeProgress,
        this.targetExplodeProgress,
        8,
        delta
      );
      this.robotResult.updateExplode(this.explodeProgress);
    }

    // 2. RPLIDAR Turret spinning & Jetson cooling fan spinning
    if (this.isLidarActive) {
      this.lidarAngle = (this.lidarAngle + 12 * delta) % (Math.PI * 2);
      this.robotResult.updateLidarRotation(this.lidarAngle);
    }
    this.robotResult.setFanSpeed(3200); // 3200 RPM cooling fan

    // 3. Race Course Simulation & Dynamic Obstacles
    this.updateRaceSimulation(delta);
    this.updateObstacles(delta);

    // 4. Drive Physics & Obstacle Proximity Check
    this.updateDrivePhysics(delta);
    this.updateObstacleProximity();

    // 5. Camera Modes (Vehicle POV > Chase > Manual Preset)
    if (Math.abs(this.camera.fov - this.targetCameraFov) > 0.05) {
      this.camera.fov = THREE.MathUtils.damp(this.camera.fov, this.targetCameraFov, 10, delta);
      this.camera.updateProjectionMatrix();
    }

    if (this.isVehiclePovCamera) {
      this.updateVehiclePovCamera(delta);
    } else if (this.isChaseCamera) {
      this.updateChaseCamera(delta);
    }

    // 6. LiDAR Ranging
    this.simulateLidarRanging();

    // 7. Manual Camera Damping Animation
    if (this.isAnimatingCamera && !this.isChaseCamera && !this.isVehiclePovCamera) {
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.targetCameraPos.x, 6, delta);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCameraPos.y, 6, delta);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCameraPos.z, 6, delta);

      this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, this.targetControlsTarget.x, 6, delta);
      this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, this.targetControlsTarget.y, 6, delta);
      this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, this.targetControlsTarget.z, 6, delta);

      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.02) {
        this.isAnimatingCamera = false;
      }
    }

    if (!this.isVehiclePovCamera) {
      this.controls.update();
    }
    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.animFrameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.animFrameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.animFrameId = window.setTimeout(cb, 80);
      }
    };
    this.animFrameId = window.setTimeout(poll, 5);
  }

  private resetToCenterForExploration() {
    this.resetBoostState();
    this.robotPosition.set(0, 0, 0);
    this.robotHeading = 0;
    this.driveInput = { forward: 0, turn: 0 };
    this.robotResult.rootGroup.position.set(0, 0, 0);
    this.robotResult.rootGroup.rotation.y = 0;
    this.contactShadow.position.set(0, 0.005, 0);
    this.setVehiclePovState(false);
    this.isChaseCamera = false;
    this.setCameraPreset('isometric');
  }

  public resetPosition() {
    this.resetToCenterForExploration();
  }

  public captureScreenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrameId);
    clearTimeout(this.animFrameId);
    window.removeEventListener('resize', this.onWindowResize);

    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
