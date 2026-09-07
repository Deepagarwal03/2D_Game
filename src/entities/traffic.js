// Civilian Traffic Simulation System for Palmetto Shores '86
import { CONFIG } from '../config.js';
import { ROADS } from '../world/mapData.js';
import { Vehicle } from './vehicle.js';

export class TrafficManager {
  constructor(scene) {
    this.scene = scene;
    this.trafficCars = [];
    this.spawnTimer = 0;

    // Build directional lane segments for AI vehicles to follow
    this.laneSegments = this.buildLaneSegments();
  }

  buildLaneSegments() {
    const lanes = [];

    for (const r of ROADS) {
      if (r.type === 'alley' || r.type === 'runway' || r.type === 'taxiway') continue;

      const isHoriz = Math.abs(r.y1 - r.y2) < 10;
      const laneOffset = r.width * 0.25;

      if (isHoriz) {
        const xMin = Math.min(r.x1, r.x2);
        const xMax = Math.max(r.x1, r.x2);
        // Eastbound lane (traveling left to right on bottom lane)
        lanes.push({
          dir: 'E',
          x1: xMin, y1: r.y1 + laneOffset,
          x2: xMax, y2: r.y1 + laneOffset,
          angle: Math.PI / 2, // 90 deg
          road: r
        });
        // Westbound lane (traveling right to left on top lane)
        lanes.push({
          dir: 'W',
          x1: xMax, y1: r.y1 - laneOffset,
          x2: xMin, y2: r.y1 - laneOffset,
          angle: -Math.PI / 2, // 270 deg
          road: r
        });
      } else {
        const yMin = Math.min(r.y1, r.y2);
        const yMax = Math.max(r.y1, r.y2);
        // Southbound lane (traveling top to bottom on right lane)
        lanes.push({
          dir: 'S',
          x1: r.x1 + laneOffset, y1: yMin,
          x2: r.x1 + laneOffset, y2: yMax,
          angle: Math.PI, // 180 deg (South)
          road: r
        });
        // Northbound lane (traveling bottom to top on left lane)
        lanes.push({
          dir: 'N',
          x1: r.x1 - laneOffset, y1: yMax,
          x2: r.x1 - laneOffset, y2: yMin,
          angle: 0, // 0 deg (North)
          road: r
        });
      }
    }

    return lanes;
  }

  update(playerPos, delta) {
    const dt = delta / 1000;

    // 1. Update active traffic cars
    for (let i = this.trafficCars.length - 1; i >= 0; i--) {
      const car = this.trafficCars[i];

      // If player hijacked or entered this car, remove from AI traffic control
      if (car.driver && !car.isAI) {
        this.trafficCars.splice(i, 1);
        continue;
      }

      const distToPlayer = Phaser.Math.Distance.Between(car.x, car.y, playerPos.x, playerPos.y);

      // Despawn if far from player
      if (distToPlayer > CONFIG.LIMITS.DESPAWN_RADIUS) {
        car.destroy();
        this.trafficCars.splice(i, 1);
        continue;
      }

      this.updateAICar(car, dt, playerPos);
    }

    // 2. Spawn new traffic cars if below quota
    this.spawnTimer += dt;
    if (this.spawnTimer > 0.6 && this.trafficCars.length < CONFIG.LIMITS.MAX_TRAFFIC) {
      this.spawnTimer = 0;
      this.spawnTrafficCarNear(playerPos);
    }
  }

  spawnTrafficCarNear(playerPos) {
    // Pick lane segments that are within spawn ring
    const viableLanes = this.laneSegments.filter(lane => {
      const midX = (lane.x1 + lane.x2) / 2;
      const midY = (lane.y1 + lane.y2) / 2;
      const d = Phaser.Math.Distance.Between(midX, midY, playerPos.x, playerPos.y);
      return d >= CONFIG.LIMITS.MIN_SPAWN_RADIUS && d <= CONFIG.LIMITS.SPAWN_RADIUS;
    });

    if (viableLanes.length === 0) return;

    const lane = Phaser.Utils.Array.GetRandom(viableLanes);

    // Pick random position along lane
    const t = 0.1 + Math.random() * 0.8;
    const spawnX = lane.x1 + (lane.x2 - lane.x1) * t;
    const spawnY = lane.y1 + (lane.y2 - lane.y1) * t;

    // Ensure no other car is too close to spawn point
    const tooClose = this.trafficCars.some(c => Phaser.Math.Distance.Between(c.x, c.y, spawnX, spawnY) < 140);
    if (tooClose) return;

    // Pick random civilian vehicle model
    const vehicleTypes = ['sports', 'muscle', 'taxi', 'sedan', 'convertible'];
    const typeId = Phaser.Utils.Array.GetRandom(vehicleTypes);

    const car = new Vehicle(this.scene, spawnX, spawnY, typeId, lane.angle);
    car.isAI = true;
    car.currentLane = lane;
    car.targetSpeed = 180 + Math.random() * 80;
    car.speed = car.targetSpeed * 0.7;

    this.trafficCars.push(car);
    this.scene.worldVehicles.push(car);
  }

  updateAICar(car, dt, playerPos) {
    const lane = car.currentLane;
    if (!lane) return;

    // Look ahead to detect obstacles, stopped cars, or player
    let shouldStop = false;
    const lookAheadDist = 140;

    // 1. Check distance to player
    const distToPlayer = Phaser.Math.Distance.Between(car.x, car.y, playerPos.x, playerPos.y);
    if (distToPlayer < 90) {
      // Check if player is directly ahead
      const angleToPlayer = Math.atan2(playerPos.y - car.y, playerPos.x - car.x);
      const diff = Math.abs(Phaser.Math.Angle.Normalize(angleToPlayer - (car.angle - Math.PI / 2)));
      if (diff < 0.8) {
        shouldStop = true;
      }
    }

    // 2. Check distance to other cars ahead in same lane
    for (const other of this.scene.worldVehicles) {
      if (other === car) continue;
      const d = Phaser.Math.Distance.Between(car.x, car.y, other.x, other.y);
      if (d < lookAheadDist) {
        const angleToOther = Math.atan2(other.y - car.y, other.x - car.x);
        const diff = Math.abs(Phaser.Math.Angle.Normalize(angleToOther - (car.angle - Math.PI / 2)));
        if (diff < 0.6) {
          shouldStop = true;
          break;
        }
      }
    }

    // Acceleration & Braking for AI
    if (shouldStop) {
      car.speed = Phaser.Math.Linear(car.speed, 0, Math.min(1, 4.0 * dt));
      car.isBraking = true;
    } else {
      car.speed = Phaser.Math.Linear(car.speed, car.targetSpeed, Math.min(1, 1.5 * dt));
      car.isBraking = false;
    }

    // Move along lane
    const forwardX = Math.sin(car.angle);
    const forwardY = -Math.cos(car.angle);
    car.x += forwardX * car.speed * dt;
    car.y += forwardY * car.speed * dt;

    // Check if reached end of lane
    const distToEnd = Phaser.Math.Distance.Between(car.x, car.y, lane.x2, lane.y2);
    if (distToEnd < 60) {
      // Pick connecting lane or reverse direction
      this.transitionToNextLane(car);
    }

    // Update visuals
    car.container.setPosition(car.x, car.y);
    car.container.setRotation(car.angle);
    car.renderVehicle();
  }

  transitionToNextLane(car) {
    // Find connecting lanes near lane endpoint
    const endX = car.currentLane.x2;
    const endY = car.currentLane.y2;

    const connecting = this.laneSegments.filter(other => {
      if (other === car.currentLane) return false;
      const d = Phaser.Math.Distance.Between(endX, endY, other.x1, other.y1);
      return d < 120;
    });

    if (connecting.length > 0) {
      const nextLane = Phaser.Utils.Array.GetRandom(connecting);
      car.currentLane = nextLane;
      car.x = nextLane.x1;
      car.y = nextLane.y1;
      car.angle = nextLane.angle;
    } else {
      // Loop back to start of lane
      car.x = car.currentLane.x1;
      car.y = car.currentLane.y1;
    }
  }

  getActiveCount() {
    return this.trafficCars.length;
  }
}
