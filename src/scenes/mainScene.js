// Main Gameplay Scene for Palmetto Shores '86
import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { DISTRICTS, getDistrictAt, BUILDINGS, PROPS, WATER_BODIES } from '../world/mapData.js';
import { ChunkRenderer } from '../world/chunkRenderer.js';
import { Player } from '../entities/player.js';
import { Vehicle } from '../entities/vehicle.js';
import { PedestrianManager } from '../entities/pedestrian.js';
import { TrafficManager } from '../entities/traffic.js';
import { Minimap } from '../ui/minimap.js';
import { FullMap } from '../ui/fullMap.js';
import { SoundSynth } from '../audio/soundSynth.js';

export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    // 1. World Bounds
    this.physics.world.setBounds(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);

    // 2. Audio Engine
    this.soundSynth = new SoundSynth();

    // 3. Procedural Chunk Terrain & Road Renderer
    this.chunkRenderer = new ChunkRenderer(this);

    // 4. Tire Skid Marks Layer (decals)
    this.skidMarksGraphics = this.add.graphics();
    this.skidMarksGraphics.setDepth(5);

    // 5. Buildings Rendering & Spatial Collision Grid
    this.setupBuildingsAndCollisions();

    // 6. Props Rendering (Trees, Streetlights, Marina Yachts, Planes)
    this.setupProps();

    // 7. World Vehicles Collection
    this.worldVehicles = [];

    // Spawn parked vehicles from PROPS
    for (const prop of PROPS) {
      if (prop.type === 'parked_car') {
        const rad = (prop.angle || 0) * (Math.PI / 180);
        const car = new Vehicle(this, prop.x, prop.y, prop.vehicleType, rad);
        this.worldVehicles.push(car);
      }
    }

    // 8. Player Setup (Spawn on Ocean Drive right in front of a red Cheetah supercar!)
    const spawnX = 6540;
    const spawnY = 1200;
    this.player = new Player(this, spawnX, spawnY);

    // 9. Pedestrian & Traffic Managers
    this.pedestrianManager = new PedestrianManager(this);
    this.trafficManager = new TrafficManager(this);

    // 10. Minimap & Fullscreen Map UI
    this.minimap = new Minimap(this);
    this.fullMap = new FullMap(this);

    // 11. Camera Setup
    this.cameras.main.setBounds(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player.container, true, CONFIG.CAMERA.LERP, CONFIG.CAMERA.LERP);
    this.cameras.main.setZoom(CONFIG.CAMERA.DEFAULT_ZOOM);

    // 12. Input Setup
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      shift: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      enterKey: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      fKey: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
      hornKey: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H)
    };

    // Event listener for vehicle entry/exit
    this.wasd.enterKey.on('down', () => this.toggleVehicle());
    this.wasd.fKey.on('down', () => this.toggleVehicle());

    const promptEl = document.getElementById('interaction-prompt');
    if (promptEl) {
      promptEl.style.cursor = 'pointer';
      promptEl.addEventListener('click', () => this.toggleVehicle());
    }

    // 13. UI Elements State
    this.currentDistrict = null;
    this.districtBannerTimer = 0;
    this.nearestVehicle = null;

    this.setupHUDInteractions();
    this.setupLightingOverlay();

    // Unlock audio on first user input
    this.input.on('pointerdown', () => this.soundSynth.unlockAudio());
    this.input.keyboard.on('keydown', () => this.soundSynth.unlockAudio());

    // Show initial district announcement
    this.checkDistrictChange(true);
  }

  setupBuildingsAndCollisions() {
    this.buildingsContainer = this.add.container(0, 0);
    this.buildingsContainer.setDepth(20);

    // Spatial hash grid: 500x500 cells for lightning fast collision checking
    this.spatialCellSize = 500;
    this.collisionGrid = new Map();

    const addObstacleToGrid = (obs) => {
      const minCellX = Math.floor(obs.x / this.spatialCellSize);
      const maxCellX = Math.floor((obs.x + obs.w) / this.spatialCellSize);
      const minCellY = Math.floor(obs.y / this.spatialCellSize);
      const maxCellY = Math.floor((obs.y + obs.h) / this.spatialCellSize);

      for (let cx = minCellX; cx <= maxCellX; cx++) {
        for (let cy = minCellY; cy <= maxCellY; cy++) {
          const key = `${cx},${cy}`;
          if (!this.collisionGrid.has(key)) {
            this.collisionGrid.set(key, []);
          }
          this.collisionGrid.get(key).push(obs);
        }
      }
    };

    // Add Buildings to Graphics & Collision Grid
    const bg = this.add.graphics();
    this.buildingsContainer.add(bg);

    for (const b of BUILDINGS) {
      // 1. Drop shadow (projected to south-east)
      bg.fillStyle(0x000000, 0.45);
      bg.fillRect(b.x + 12, b.y + 12, b.w, b.h);

      // 2. Building Body
      const bodyColor = Phaser.Display.Color.HexStringToColor(b.color).color;
      bg.fillStyle(bodyColor, 1.0);
      bg.fillRect(b.x, b.y, b.w, b.h);

      // 3. Facade Trim & Cornice
      bg.lineStyle(2, 0xffffff, 0.25);
      bg.strokeRect(b.x, b.y, b.w, b.h);

      // 4. Rooftop Details
      const roofColor = Phaser.Display.Color.HexStringToColor(b.roofColor).color;
      bg.fillStyle(roofColor, 1.0);
      bg.fillRect(b.x + 10, b.y + 10, b.w - 20, b.h - 20);

      // Rooftop HVAC units / skylights
      bg.fillStyle(0x334155, 0.9);
      bg.fillRect(b.x + 20, b.y + 20, 24, 18);
      bg.fillRect(b.x + b.w - 44, b.y + 20, 24, 18);

      // Rooftop Helipad for towers
      if (b.helipad && b.w >= 140 && b.h >= 140) {
        const hx = b.x + b.w / 2;
        const hy = b.y + b.h / 2;
        bg.fillStyle(0xef4444, 1.0);
        bg.fillCircle(hx, hy, 32);
        bg.lineStyle(4, 0xffffff, 1.0);
        bg.strokeCircle(hx, hy, 30);
        // Letter H
        bg.fillStyle(0xffffff, 1.0);
        bg.fillRect(hx - 14, hy - 14, 6, 28);
        bg.fillRect(hx + 8, hy - 14, 6, 28);
        bg.fillRect(hx - 14, hy - 3, 28, 6);
      }

      // Add to collision
      addObstacleToGrid({ x: b.x, y: b.y, w: b.w, h: b.h, type: 'building' });
    }

    // Add Ocean Water to Collision Grid (East Coast X >= 6950)
    addObstacleToGrid({ x: 6950, y: 0, w: 1100, h: CONFIG.WORLD_HEIGHT, type: 'water' });

    // Add Marina Basin & Lake to Collision
    for (const wb of WATER_BODIES) {
      if (wb.rect) {
        addObstacleToGrid({ x: wb.rect.x, y: wb.rect.y, w: wb.rect.w, h: wb.rect.h, type: 'water' });
      }
    }
  }

  setupProps() {
    this.propsGraphics = this.add.graphics();
    this.propsGraphics.setDepth(30);
    const pg = this.propsGraphics;

    for (const prop of PROPS) {
      if (prop.type === 'palm_tree' || prop.type === 'park_tree') {
        const isPalm = prop.type === 'palm_tree';
        // Shadow
        pg.fillStyle(0x000000, 0.3);
        pg.fillCircle(prop.x + 6, prop.y + 6, prop.radius * 0.8);

        // Trunk
        pg.fillStyle(0x5c4033, 1.0);
        pg.fillCircle(prop.x, prop.y, 6);

        // Leaves / Fronds
        pg.fillStyle(isPalm ? 0x05c77a : 0x2d6a4f, 0.95);
        if (isPalm) {
          // 8-direction palm fronds
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            const fx = prop.x + Math.cos(a) * prop.radius;
            const fy = prop.y + Math.sin(a) * prop.radius;
            pg.fillCircle(fx, fy, 8);
          }
          pg.fillCircle(prop.x, prop.y, 10);
        } else {
          // Lush rounded canopy
          pg.fillCircle(prop.x, prop.y, prop.radius);
          pg.fillStyle(0x40916c, 0.8);
          pg.fillCircle(prop.x - 5, prop.y - 5, prop.radius * 0.6);
        }
      } else if (prop.type === 'streetlight') {
        pg.fillStyle(0x94a3b8, 1.0);
        pg.fillCircle(prop.x, prop.y, 4);
        // Light glow
        pg.fillStyle(0xfff3b0, 0.15);
        pg.fillCircle(prop.x, prop.y, 35);
      } else if (prop.type === 'traffic_light') {
        pg.fillStyle(0x1e293b, 1.0);
        pg.fillRect(prop.x - 4, prop.y - 12, 8, 24);
        // Green light active
        pg.fillStyle(0x22c55e, 1.0);
        pg.fillCircle(prop.x, prop.y + 6, 3);
      } else if (prop.type === 'yacht') {
        // Luxury yacht moored at Sunset Marina
        pg.fillStyle(0x000000, 0.35);
        pg.fillRect(prop.x - prop.w / 2 + 4, prop.y - prop.h / 2 + 4, prop.w, prop.h);

        // Hull
        const yachtColor = Phaser.Display.Color.HexStringToColor(prop.color).color;
        pg.fillStyle(yachtColor, 1.0);
        pg.fillRoundedRect(prop.x - prop.w / 2, prop.y - prop.h / 2, prop.w, prop.h, 6);

        // Cabin / Deck
        pg.fillStyle(0xffffff, 0.9);
        pg.fillRoundedRect(prop.x - prop.w / 2 + 12, prop.y - prop.h / 2 + 3, prop.w - 24, prop.h - 6, 4);
        // Windshield
        pg.fillStyle(0x0284c7, 1.0);
        pg.fillRect(prop.x + prop.w / 2 - 20, prop.y - prop.h / 2 + 5, 4, prop.h - 10);
      } else if (prop.type === 'airliner') {
        // Parked passenger jet airliner at Airport
        const ax = prop.x;
        const ay = prop.y;
        // Jet fuselage
        pg.fillStyle(0x000000, 0.3);
        pg.fillRoundedRect(ax - 20 + 8, ay - 90 + 8, 40, 180, 14);

        pg.fillStyle(0xffffff, 1.0);
        pg.fillRoundedRect(ax - 20, ay - 90, 40, 180, 14);
        // Blue cheatline stripe
        pg.fillStyle(0x0077b6, 1.0);
        pg.fillRect(ax - 20, ay - 20, 40, 8);

        // Wings
        pg.fillStyle(0xe2e8f0, 1.0);
        pg.fillTriangle(ax - 15, ay - 20, ax - 110, ay + 30, ax - 15, ay + 30);
        pg.fillTriangle(ax + 15, ay - 20, ax + 110, ay + 30, ax + 15, ay + 30);

        // Tail fin
        pg.fillStyle(0x023e8a, 1.0);
        pg.fillTriangle(ax, ay + 60, ax - 35, ay + 90, ax + 35, ay + 90);
      } else if (prop.type === 'lifeguard_tower') {
        // 80s pastel wooden lifeguard tower on beach
        pg.fillStyle(0x000000, 0.3);
        pg.fillRect(prop.x - 14, prop.y - 14, 28, 28);
        pg.fillStyle(0xffe600, 1.0);
        pg.fillRect(prop.x - 12, prop.y - 12, 24, 24);
        pg.fillStyle(0xef4444, 1.0);
        pg.fillRect(prop.x - 8, prop.y - 8, 16, 16);
      } else if (prop.type === 'beach_umbrella') {
        const uColor = Phaser.Display.Color.HexStringToColor(prop.color).color;
        pg.fillStyle(0x000000, 0.25);
        pg.fillCircle(prop.x + 3, prop.y + 3, 14);
        pg.fillStyle(uColor, 1.0);
        pg.fillCircle(prop.x, prop.y, 14);
        pg.fillStyle(0xffffff, 1.0);
        pg.fillCircle(prop.x, prop.y, 4);
      }
    }
  }

  setupLightingOverlay() {
    this.lightingMode = 'sunset'; // Start in atmospheric 80s coastal sunset!
    this.lightingEl = document.getElementById('lighting-overlay');
    this.updateLightingVisuals();
  }

  updateLightingVisuals() {
    if (!this.lightingEl) return;
    if (this.lightingMode === 'sunset') {
      this.lightingEl.style.background = 'linear-gradient(180deg, rgba(255, 107, 53, 0.12), rgba(114, 9, 183, 0.09))';
    } else if (this.lightingMode === 'night') {
      this.lightingEl.style.background = 'rgba(11, 9, 43, 0.45)';
    } else {
      this.lightingEl.style.background = 'transparent';
    }
  }

  cycleLighting() {
    if (this.lightingMode === 'sunset') this.lightingMode = 'night';
    else if (this.lightingMode === 'night') this.lightingMode = 'day';
    else this.lightingMode = 'sunset';

    const btn = document.getElementById('tod-toggle-btn');
    if (btn) btn.innerText = `🌅 ${this.lightingMode.toUpperCase()}`;
    this.updateLightingVisuals();
  }

  setupHUDInteractions() {
    // Audio button
    const audioBtn = document.getElementById('audio-toggle-btn');
    audioBtn.addEventListener('click', () => {
      this.soundSynth.unlockAudio();
      const state = this.soundSynth.toggleAudio();
      audioBtn.innerText = state ? '🔊 SOUND: ON' : '🔈 SOUND: OFF';
    });

    // Time of day button
    const todBtn = document.getElementById('tod-toggle-btn');
    todBtn.addEventListener('click', () => {
      this.cycleLighting();
    });

    // Debug button
    const dbgBtn = document.getElementById('debug-toggle-btn');
    const dbgPanel = document.getElementById('debug-panel');
    dbgBtn.addEventListener('click', () => {
      const show = dbgPanel.style.display !== 'block';
      dbgPanel.style.display = show ? 'block' : 'none';
    });

    // Map button
    const mapBtn = document.getElementById('map-btn');
    mapBtn.addEventListener('click', () => {
      this.fullMap.toggle(!this.fullMap.isOpen);
    });
  }

  // Fast Continuous Collision Solver using Spatial Hash Grid
  resolveObstacleCollision(oldX, oldY, newX, newY, radius) {
    const minCellX = Math.floor((Math.min(oldX, newX) - radius) / this.spatialCellSize);
    const maxCellX = Math.floor((Math.max(oldX, newX) + radius) / this.spatialCellSize);
    const minCellY = Math.floor((Math.min(oldY, newY) - radius) / this.spatialCellSize);
    const maxCellY = Math.floor((Math.max(oldY, newY) + radius) / this.spatialCellSize);

    let resX = newX;
    let resY = newY;
    let collided = false;

    // Check world bounds first
    if (resX - radius < 30) { resX = 30 + radius; collided = true; }
    if (resX + radius > CONFIG.WORLD_WIDTH - 30) { resX = CONFIG.WORLD_WIDTH - 30 - radius; collided = true; }
    if (resY - radius < 30) { resY = 30 + radius; collided = true; }
    if (resY + radius > CONFIG.WORLD_HEIGHT - 30) { resY = CONFIG.WORLD_HEIGHT - 30 - radius; collided = true; }

    const checked = new Set();

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = `${cx},${cy}`;
        const obstacles = this.collisionGrid.get(key);
        if (!obstacles) continue;

        for (const obs of obstacles) {
          if (checked.has(obs)) continue;
          checked.add(obs);

          // Box collision against Circle (expanded by radius)
          const closestX = Phaser.Math.Clamp(resX, obs.x, obs.x + obs.w);
          const closestY = Phaser.Math.Clamp(resY, obs.y, obs.y + obs.h);

          const dx = resX - closestX;
          const dy = resY - closestY;
          const distSq = dx * dx + dy * dy;

          if (distSq < radius * radius) {
            collided = true;
            const dist = Math.sqrt(distSq);
            if (dist > 0.001) {
              const overlap = radius - dist;
              resX += (dx / dist) * overlap;
              resY += (dy / dist) * overlap;
            } else {
              // Center inside obstacle - push along axis with least penetration
              const leftDist = Math.abs(resX - obs.x);
              const rightDist = Math.abs(resX - (obs.x + obs.w));
              const topDist = Math.abs(resY - obs.y);
              const bottomDist = Math.abs(resY - (obs.y + obs.h));
              const minPen = Math.min(leftDist, rightDist, topDist, bottomDist);

              if (minPen === leftDist) resX = obs.x - radius;
              else if (minPen === rightDist) resX = obs.x + obs.w + radius;
              else if (minPen === topDist) resY = obs.y - radius;
              else resY = obs.y + obs.h + radius;
            }
          }
        }
      }
    }

    return { x: resX, y: resY, collided };
  }

  // Decal Skid Marks Renderer
  addSkidMark(x, y, angle, carWidth) {
    const smg = this.skidMarksGraphics;
    const hw = carWidth / 2 - 4;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    smg.fillStyle(0x111111, 0.25);
    // Left wheel skid
    const lx = x - cos * hw;
    const ly = y - sin * hw;
    smg.fillCircle(lx, ly, 3);

    // Right wheel skid
    const rx = x + cos * hw;
    const ry = y + sin * hw;
    smg.fillCircle(rx, ry, 3);
  }

  update(time, delta) {
    // 1. Update Chunk Renderer Viewport
    this.chunkRenderer.update(this.cameras.main);

    // 2. Update Player
    this.player.update(this.cursors, this.wasd, delta);

    // 3. Update World Vehicles
    for (const veh of this.worldVehicles) {
      veh.update(this.cursors, this.wasd, delta);
    }

    // 4. Update Pedestrian & Traffic Systems
    const activePlayerPos = { x: this.player.x, y: this.player.y };
    this.pedestrianManager.update(activePlayerPos, delta);
    this.trafficManager.update(activePlayerPos, delta);

    // 5. Vehicle Enter / Exit Interaction Logic
    this.handleVehicleInteractions();

    // 6. Horn Input
    if (Phaser.Input.Keyboard.JustDown(this.wasd.hornKey)) {
      this.soundSynth.playHorn();
      // Scare nearby pedestrians
      for (const ped of this.pedestrianManager.pedestrians) {
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, ped.x, ped.y) < 220) {
          ped.isPanicking = true;
          ped.panicTimer = 3.0;
        }
      }
    }

    // 7. Update Audio Engine
    const isDriving = this.player.isInVehicle && this.player.currentVehicle;
    const currentSpeed = isDriving ? this.player.currentVehicle.speed : 0;
    const maxSpeed = isDriving ? this.player.currentVehicle.type.maxSpeed : 1;
    this.soundSynth.updateEngine(currentSpeed, maxSpeed, isDriving);
    this.soundSynth.setDriftScreech(isDriving && this.player.currentVehicle.isDrifting);
    this.soundSynth.updateOceanAmbient(this.player.x);

    // 8. Camera Zoom Smoothing based on activity & speed
    let targetZoom = CONFIG.CAMERA.DEFAULT_ZOOM;
    if (isDriving) {
      const speedNorm = Math.abs(currentSpeed) / maxSpeed;
      targetZoom = speedNorm > 0.6 ? CONFIG.CAMERA.HIGH_SPEED_ZOOM : CONFIG.CAMERA.DRIVING_ZOOM;
    }
    this.cameras.main.zoom = Phaser.Math.Linear(this.cameras.main.zoom, targetZoom, 0.05);

    // 9. District Tracking & Announcement Banner
    this.checkDistrictChange(false);

    // 10. Update GTA Minimap
    this.minimap.update(this.player, this.worldVehicles, this.pedestrianManager.pedestrians);

    // 11. Update HUD Elements & Debug Stats
    this.updateHUD(delta);
  }

  toggleVehicle() {
    const vehicleHud = document.getElementById('vehicle-hud');
    const promptEl = document.getElementById('interaction-prompt');

    if (this.player.isInVehicle) {
      this.player.exitVehicle();
      this.soundSynth.playEnterCar();
      this.cameras.main.startFollow(this.player.container, true, CONFIG.CAMERA.LERP, CONFIG.CAMERA.LERP);
      if (vehicleHud) vehicleHud.style.display = 'none';
    } else if (this.nearestVehicle) {
      this.player.enterVehicle(this.nearestVehicle);
      this.soundSynth.playEnterCar();
      if (promptEl) promptEl.style.display = 'none';
      if (vehicleHud) vehicleHud.style.display = 'flex';
    }
  }

  handleVehicleInteractions() {
    const promptEl = document.getElementById('interaction-prompt');
    const promptAction = document.getElementById('prompt-action');
    const vehicleHud = document.getElementById('vehicle-hud');

    if (this.player.isInVehicle) {
      // Player is driving
      if (promptEl) promptEl.style.display = 'none';
      if (vehicleHud) vehicleHud.style.display = 'flex';

      const v = this.player.currentVehicle;
      const vehName = document.getElementById('vehicle-name');
      const spdEl = document.getElementById('speedometer');
      if (vehName) vehName.innerText = v.type.name.toUpperCase();
      if (spdEl) spdEl.innerText = Math.round(Math.abs(v.speed) * 0.22); // Convert to mph

      // Camera tracks vehicle
      this.cameras.main.startFollow(v.container, true, CONFIG.CAMERA.LERP, CONFIG.CAMERA.LERP);
    } else {
      // Player is on foot
      if (vehicleHud) vehicleHud.style.display = 'none';

      // Find nearest vehicle within 95px
      let closest = null;
      let minDist = 95;

      for (const v of this.worldVehicles) {
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, v.x, v.y);
        if (d < minDist) {
          minDist = d;
          closest = v;
        }
      }

      this.nearestVehicle = closest;

      if (closest && promptEl) {
        promptEl.style.display = 'block';
        if (promptAction) promptAction.innerText = `Enter ${closest.type.name}`;
      } else if (promptEl) {
        promptEl.style.display = 'none';
      }
    }
  }

  checkDistrictChange(force) {
    const district = getDistrictAt(this.player.x, this.player.y);

    if (force || !this.currentDistrict || this.currentDistrict.id !== district.id) {
      this.currentDistrict = district;

      // Show Banner
      const banner = document.getElementById('district-banner');
      const title = document.getElementById('district-title');
      const sub = document.getElementById('district-sub');

      title.innerText = district.name.toUpperCase();
      title.style.color = district.color;
      sub.innerText = district.subtitle.toUpperCase();

      banner.style.opacity = '1';

      if (this.districtBannerTimeout) clearTimeout(this.districtBannerTimeout);
      this.districtBannerTimeout = setTimeout(() => {
        banner.style.opacity = '0';
      }, 3500);
    }
  }

  updateHUD(delta) {
    const dbgFps = document.getElementById('dbg-fps');
    if (dbgFps && dbgFps.offsetParent !== null) {
      // Debug panel is visible
      dbgFps.innerText = Math.round(this.game.loop.actualFps);
      document.getElementById('dbg-entities').innerText =
        `${this.worldVehicles.length} cars, ${this.pedestrianManager.getActiveCount()} peds`;
      document.getElementById('dbg-pos').innerText = `${Math.round(this.player.x)}, ${Math.round(this.player.y)}`;
      document.getElementById('dbg-dist').innerText = this.currentDistrict ? this.currentDistrict.name : 'Unknown';
      document.getElementById('dbg-veh').innerText =
        this.player.isInVehicle && this.player.currentVehicle ? this.player.currentVehicle.type.name : 'On Foot';
      const spd = this.player.isInVehicle && this.player.currentVehicle ?
        Math.round(Math.abs(this.player.currentVehicle.speed) * 0.22) :
        Math.round(this.player.speed * 0.22);
      document.getElementById('dbg-spd').innerText = `${spd} mph`;
    }
  }
}
