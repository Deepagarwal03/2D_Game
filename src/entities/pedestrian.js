// Pedestrian Simulation & Pedestrian Manager for Palmetto Shores '86
import { CONFIG } from '../config.js';
import { ROADS, getDistrictAt } from '../world/mapData.js';

export class PedestrianManager {
  constructor(scene) {
    this.scene = scene;
    this.pedestrians = [];
    this.spawnTimer = 0;

    // Sidewalk navigation waypoints extracted from roads
    this.waypoints = this.generateSidewalkWaypoints();
  }

  generateSidewalkWaypoints() {
    const points = [];
    // Generate waypoints along sidewalks on both sides of roads
    for (const r of ROADS) {
      if (r.type === 'runway' || r.type === 'taxiway') continue;

      const isHoriz = Math.abs(r.y1 - r.y2) < 10;
      const offset = r.width / 2 + 14;

      if (isHoriz) {
        const step = 200;
        const xMin = Math.min(r.x1, r.x2);
        const xMax = Math.max(r.x1, r.x2);
        for (let x = xMin; x <= xMax; x += step) {
          points.push({ x, y: r.y1 - offset, district: getDistrictAt(x, r.y1).id });
          points.push({ x, y: r.y1 + offset, district: getDistrictAt(x, r.y1).id });
        }
      } else {
        const step = 200;
        const yMin = Math.min(r.y1, r.y2);
        const yMax = Math.max(r.y1, r.y2);
        for (let y = yMin; y <= yMax; y += step) {
          points.push({ x: r.x1 - offset, y, district: getDistrictAt(r.x1, y).id });
          points.push({ x: r.x1 + offset, y, district: getDistrictAt(r.x1, y).id });
        }
      }
    }
    return points;
  }

  update(playerPos, delta) {
    const dt = delta / 1000;

    // 1. Update existing pedestrians
    for (let i = this.pedestrians.length - 1; i >= 0; i--) {
      const ped = this.pedestrians[i];
      const distToPlayer = Phaser.Math.Distance.Between(ped.x, ped.y, playerPos.x, playerPos.y);

      // Despawn if too far
      if (distToPlayer > CONFIG.LIMITS.DESPAWN_RADIUS) {
        ped.destroy();
        this.pedestrians.splice(i, 1);
        continue;
      }

      ped.update(dt, playerPos);
    }

    // 2. Spawn new pedestrians if below capacity
    this.spawnTimer += dt;
    if (this.spawnTimer > 0.4 && this.pedestrians.length < CONFIG.LIMITS.MAX_PEDESTRIANS) {
      this.spawnTimer = 0;
      this.spawnPedestrianNear(playerPos);
    }
  }

  spawnPedestrianNear(playerPos) {
    // Pick a candidate waypoint within spawn bubble
    const candidates = this.waypoints.filter(wp => {
      const d = Phaser.Math.Distance.Between(wp.x, wp.y, playerPos.x, playerPos.y);
      return d >= CONFIG.LIMITS.MIN_SPAWN_RADIUS && d <= CONFIG.LIMITS.SPAWN_RADIUS;
    });

    if (candidates.length === 0) return;

    const wp = Phaser.Utils.Array.GetRandom(candidates);
    const ped = new Pedestrian(this.scene, wp.x, wp.y, wp.district, this.waypoints);
    this.pedestrians.push(ped);
  }

  getActiveCount() {
    return this.pedestrians.length;
  }
}

export class Pedestrian {
  constructor(scene, x, y, districtId, waypoints) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.districtId = districtId;
    this.waypoints = waypoints;

    this.speed = 40 + Math.random() * 35; // 40-75 px/s
    this.angle = Math.random() * Math.PI * 2;
    this.target = null;
    this.radius = 12;

    this.walkCycle = Math.random() * 10;
    this.isPanicking = false;
    this.panicTimer = 0;

    // Determine 80s outfit style based on district
    this.outfit = this.selectOutfit(districtId);

    // Phaser Container and Graphics
    this.container = scene.add.container(x, y);
    this.container.setDepth(35);

    this.graphics = scene.add.graphics();
    this.container.add(this.graphics);

    this.chooseNextTarget();
    this.renderPedestrian();
  }

  selectOutfit(districtId) {
    if (districtId === 'ocean_strip') {
      // Beachgoers, swimsuits, neon rollerbladers
      return {
        torso: Phaser.Utils.Array.GetRandom([0xff007f, 0x00f0ff, 0xffe600, 0x39ff14]),
        pants: Phaser.Utils.Array.GetRandom([0xffffff, 0xff0055, 0x00d2ff]),
        hair: Phaser.Utils.Array.GetRandom([0xf6d55c, 0x6f4e37, 0x111111])
      };
    } else if (districtId === 'downtown') {
      // Wall Street suits, sharp blazers
      return {
        torso: Phaser.Utils.Array.GetRandom([0x1e293b, 0x334155, 0x0f172a, 0x475569]),
        pants: Phaser.Utils.Array.GetRandom([0x1e293b, 0x0f172a, 0x334155]),
        hair: Phaser.Utils.Array.GetRandom([0x221100, 0x111111, 0x776655])
      };
    } else {
      // Colorful casual 80s streetwear
      return {
        torso: Phaser.Utils.Array.GetRandom([0xf72585, 0x7209b7, 0x3a0ca3, 0x4361ee, 0x4cc9f0, 0xfb5607]),
        pants: Phaser.Utils.Array.GetRandom([0x264653, 0xe9c46a, 0xf4a261, 0xe76f51, 0xffffff]),
        hair: Phaser.Utils.Array.GetRandom([0x2b1d0c, 0xd4a373, 0x111111])
      };
    }
  }

  chooseNextTarget() {
    // Find nearby waypoint to wander towards
    const nearby = this.waypoints.filter(wp => {
      const d = Phaser.Math.Distance.Between(wp.x, wp.y, this.x, this.y);
      return d > 80 && d < 600;
    });

    if (nearby.length > 0) {
      this.target = Phaser.Utils.Array.GetRandom(nearby);
    } else {
      this.target = {
        x: this.x + (Math.random() - 0.5) * 400,
        y: this.y + (Math.random() - 0.5) * 400
      };
    }
  }

  update(dt, playerPos) {
    // 1. Check if vehicle or sprinting player is speeding nearby
    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, playerPos.x, playerPos.y);
    if (distToPlayer < 90) {
      // Jump aside / panic
      this.isPanicking = true;
      this.panicTimer = 2.0;
    }

    if (this.isPanicking) {
      this.panicTimer -= dt;
      if (this.panicTimer <= 0) this.isPanicking = false;
      // Flee away from player
      const fleeAngle = Math.atan2(this.y - playerPos.y, this.x - playerPos.x);
      this.angle = fleeAngle + Math.PI / 2;
      const fleeSpeed = this.speed * 2.2;
      this.x += Math.cos(fleeAngle) * fleeSpeed * dt;
      this.y += Math.sin(fleeAngle) * fleeSpeed * dt;
    } else {
      // Normal sidewalk wander
      if (!this.target || Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 25) {
        this.chooseNextTarget();
      }

      if (this.target) {
        const targetAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        this.angle = Phaser.Math.Angle.RotateTo(this.angle, targetAngle + Math.PI / 2, 4 * dt);
        this.x += Math.cos(targetAngle) * this.speed * dt;
        this.y += Math.sin(targetAngle) * this.speed * dt;
      }
    }

    this.walkCycle += (this.isPanicking ? 20 : 9) * dt;

    // Update visuals
    this.container.setPosition(this.x, this.y);
    this.container.setRotation(this.angle);
    this.renderPedestrian();
  }

  renderPedestrian() {
    const g = this.graphics;
    g.clear();

    const legSwing = Math.sin(this.walkCycle) * 6;

    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(1, 3, 12);

    // Feet / Shoes
    g.fillStyle(this.outfit.pants, 1.0);
    g.fillRect(-8, 2 + legSwing, 5, 8);
    g.fillRect(3, 2 - legSwing, 5, 8);

    // Torso / Shirt
    g.fillStyle(this.outfit.torso, 1.0);
    g.fillRoundedRect(-10, -8, 20, 14, 4);

    // Arms
    g.fillCircle(-10, -3 + legSwing * 0.5, 3.5);
    g.fillCircle(10, -3 - legSwing * 0.5, 3.5);

    // Head
    g.fillStyle(0xffd1a4, 1.0);
    g.fillCircle(0, -4, 6);

    // Hair
    g.fillStyle(this.outfit.hair, 1.0);
    g.fillCircle(0, -6, 5.5);
  }

  destroy() {
    this.container.destroy();
  }
}
