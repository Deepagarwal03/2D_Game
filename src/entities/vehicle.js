// Vehicle Dynamics, Physics, and Procedural Top-Down Models for Palmetto Shores '86
import { CONFIG } from '../config.js';

export class Vehicle {
  constructor(scene, x, y, typeId = 'sports', angle = 0) {
    this.scene = scene;
    this.type = CONFIG.VEHICLE_TYPES[typeId.toUpperCase()] || CONFIG.VEHICLE_TYPES.SPORTS;

    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = angle; // Radians
    this.steerAngle = 0; // Current front wheel angle
    this.angularVelocity = 0;
    this.speed = 0; // Forward speed

    this.width = this.type.width;
    this.height = this.type.height;
    this.isBraking = false;
    this.isHandbraking = false;
    this.isDrifting = false;

    this.driver = null; // null or Player or AI
    this.isAI = false;

    // Create container for vehicle visual elements
    this.container = scene.add.container(x, y);
    this.container.setDepth(40);

    // Graphics for wheels, chassis, windows, lights
    this.graphics = scene.add.graphics();
    this.container.add(this.graphics);

    // Headlight glow cones
    this.lightGraphics = scene.add.graphics();
    this.container.add(this.lightGraphics);

    this.renderVehicle();
  }

  renderVehicle() {
    const g = this.graphics;
    const lg = this.lightGraphics;
    g.clear();
    lg.clear();

    const w = this.width;
    const h = this.height;
    const hw = w / 2;
    const hh = h / 2;

    // 1. Drop shadow
    g.fillStyle(0x000000, 0.4);
    g.fillRoundedRect(-hw + 3, -hh + 4, w, h, 6);

    // 2. Wheels (with steering angle on front wheels)
    const wheelW = 6;
    const wheelH = 14;
    g.fillStyle(0x1a1a1a, 1.0);

    // Rear Left & Right Wheels
    g.fillRect(-hw - 2, hh - 22, wheelW, wheelH);
    g.fillRect(hw - 4, hh - 22, wheelW, wheelH);

    // Front Wheels (tilted by steerAngle)
    const renderWheel = (fx, fy, angleOffset) => {
      g.save();
      // Simplified top-down wheel rendering
      g.fillRect(fx, fy, wheelW, wheelH);
      g.restore();
    };
    renderWheel(-hw - 2, -hh + 10, this.steerAngle);
    renderWheel(hw - 4, -hh + 10, this.steerAngle);

    // 3. Main Car Body Chassis
    g.fillStyle(this.type.bodyColor, 1.0);
    g.fillRoundedRect(-hw, -hh, w, h, 8);

    // Body contour trim
    g.lineStyle(1.5, this.type.trimColor, 0.7);
    g.strokeRoundedRect(-hw + 1, -hh + 1, w - 2, h - 2, 7);

    // 4. Windshield, Roof & Windows
    // Hood line
    g.lineStyle(1, 0x000000, 0.4);
    g.strokeLineShape(new Phaser.Geom.Line(-hw + 4, -hh + 24, hw - 4, -hh + 24));

    if (this.type.id === 'convertible') {
      // Open convertible cockpit with leather seats
      g.fillStyle(this.type.roofColor, 1.0); // Seat leather
      g.fillRoundedRect(-hw + 5, -hh + 26, w - 10, 32, 4);
      // Headrests
      g.fillStyle(0x330000, 1.0);
      g.fillCircle(-8, -hh + 34, 5);
      g.fillCircle(8, -hh + 34, 5);
      // Front windshield glass
      g.fillStyle(0x90e0ef, 0.85);
      g.fillRect(-hw + 4, -hh + 20, w - 8, 6);
    } else {
      // Front Windshield
      g.fillStyle(0x38bdf8, 0.85);
      g.fillRect(-hw + 5, -hh + 24, w - 10, 12);

      // Roof
      g.fillStyle(this.type.roofColor, 1.0);
      g.fillRoundedRect(-hw + 5, -hh + 36, w - 10, h - 62, 4);

      // Rear Windshield
      g.fillStyle(0x38bdf8, 0.85);
      g.fillRect(-hw + 5, hh - 26, w - 10, 10);

      // Side windows
      g.fillStyle(0x0284c7, 0.85);
      g.fillRect(-hw + 2, -hh + 30, 3, h - 54);
      g.fillRect(hw - 5, -hh + 30, 3, h - 54);

      // Special roof props: Taxi checkered sign or Muscle racing stripe
      if (this.type.id === 'taxi') {
        g.fillStyle(0xffffff, 1.0);
        g.fillRoundedRect(-12, -hh + 42, 24, 8, 2);
        g.lineStyle(1, 0x000000, 1.0);
        g.strokeRoundedRect(-12, -hh + 42, 24, 8, 2);
        // TAXI black text block
        g.fillStyle(0x000000, 1.0);
        g.fillRect(-8, -hh + 44, 16, 4);
      } else if (this.type.id === 'muscle') {
        // Dual white racing stripes down the length of the muscle car
        g.fillStyle(0xffffff, 0.9);
        g.fillRect(-7, -hh, 4, h);
        g.fillRect(3, -hh, 4, h);
      } else if (this.type.id === 'sports') {
        // Rear spoiler wing
        g.fillStyle(0x111111, 1.0);
        g.fillRect(-hw + 2, hh - 8, w - 4, 6);
      }
    }

    // 5. Headlights
    g.fillStyle(this.type.headlightColor, 1.0);
    g.fillRect(-hw + 3, -hh, 8, 3);
    g.fillRect(hw - 11, -hh, 8, 3);

    // 6. Tail Lights (Brighten when braking)
    const tailColor = (this.isBraking || this.isHandbraking) ? 0xff0044 : 0x990022;
    g.fillStyle(tailColor, 1.0);
    g.fillRect(-hw + 3, hh - 3, 9, 3);
    g.fillRect(hw - 12, hh - 3, 9, 3);

    // 7. Headlight Cones (subtle forward illumination)
    lg.fillStyle(0xfffae0, 0.15);
    lg.fillTriangle(-hw + 7, -hh, -hw - 40, -hh - 140, hw + 40, -hh - 140);
  }

  update(cursors, wasd, delta) {
    const dt = delta / 1000;

    if (this.driver && !this.isAI) {
      // Player Driving Controls
      this.handlePlayerInput(cursors, wasd, dt);
    }

    // Vehicle Top-Down Physics Simulation
    this.updatePhysics(dt);

    // Obstacle Collision Check & Resolution
    this.handleWorldCollisions();

    // Visual transform update
    this.container.setPosition(this.x, this.y);
    this.container.setRotation(this.angle);

    // Update dynamic lights / visuals if braking changed
    this.renderVehicle();
  }

  handlePlayerInput(cursors, wasd, dt) {
    const isUp = wasd.up.isDown || cursors.up.isDown;
    const isDown = wasd.down.isDown || cursors.down.isDown;
    const isLeft = wasd.left.isDown || cursors.left.isDown;
    const isRight = wasd.right.isDown || cursors.right.isDown;
    const isHandbrake = wasd.space.isDown;

    this.isBraking = false;
    this.isHandbraking = isHandbrake;

    // Acceleration & Braking
    if (isUp) {
      if (this.speed < -10) {
        // Braking while in reverse
        this.speed += this.type.braking * dt * 1.5;
        this.isBraking = true;
      } else {
        // Accelerate forward
        const boost = wasd.shift.isDown ? 1.2 : 1.0;
        this.speed += this.type.acceleration * boost * dt;
        if (this.speed > this.type.maxSpeed * boost) {
          this.speed = this.type.maxSpeed * boost;
        }
      }
    } else if (isDown) {
      if (this.speed > 10) {
        // Braking while moving forward
        this.speed -= this.type.braking * dt * 1.5;
        this.isBraking = true;
      } else {
        // Reverse
        this.speed -= this.type.acceleration * 0.6 * dt;
        if (this.speed < -this.type.reverseSpeed) {
          this.speed = -this.type.reverseSpeed;
        }
      }
    } else {
      // Natural rolling resistance / friction
      this.speed = Phaser.Math.Linear(this.speed, 0, Math.min(1, 1.8 * dt));
    }

    // Steering (handling scales with vehicle speed)
    let steerDir = 0;
    if (isLeft) steerDir -= 1;
    if (isRight) steerDir += 1;

    // Speed ratio determines turning sensitivity
    const speedRatio = Math.min(1, Math.abs(this.speed) / 180);
    const reverseMultiplier = this.speed < 0 ? -1 : 1;

    if (steerDir !== 0 && Math.abs(this.speed) > 10) {
      const turnAmount = steerDir * this.type.turnSpeed * speedRatio * reverseMultiplier * dt;
      this.angle += turnAmount;
      this.steerAngle = Phaser.Math.Linear(this.steerAngle, steerDir * 0.4, 10 * dt);
    } else {
      this.steerAngle = Phaser.Math.Linear(this.steerAngle, 0, 10 * dt);
    }

    // Handbrake Drifting & Tire Skid Marks
    if (isHandbrake) {
      this.isDrifting = Math.abs(this.speed) > 100;
      this.speed *= (1 - 1.2 * dt); // rapid deceleration
      if (steerDir !== 0) {
        this.angle += steerDir * 4.5 * dt * reverseMultiplier;
      }
    } else {
      this.isDrifting = false;
    }

    // Spawn tire skid marks when drifting or hard braking
    if ((this.isDrifting || (this.isBraking && Math.abs(this.speed) > 200)) && this.scene.addSkidMark) {
      this.scene.addSkidMark(this.x, this.y, this.angle, this.width);
    }
  }

  updatePhysics(dt) {
    // Forward unit vector based on vehicle rotation
    // Angle 0 faces straight up (North)
    const forwardX = Math.sin(this.angle);
    const forwardY = -Math.cos(this.angle);

    // Calculate lateral slip / drift
    const driftFactor = this.isHandbraking ? this.type.driftFriction : 0.98;
    this.vx = forwardX * this.speed;
    this.vy = forwardY * this.speed;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Enforce world boundaries
    const margin = 50;
    if (this.x < margin) { this.x = margin; this.speed = -this.speed * 0.3; }
    if (this.x > CONFIG.WORLD_WIDTH - margin) { this.x = CONFIG.WORLD_WIDTH - margin; this.speed = -this.speed * 0.3; }
    if (this.y < margin) { this.y = margin; this.speed = -this.speed * 0.3; }
    if (this.y > CONFIG.WORLD_HEIGHT - margin) { this.y = CONFIG.WORLD_HEIGHT - margin; this.speed = -this.speed * 0.3; }
  }

  handleWorldCollisions() {
    const colRadius = Math.max(this.width, this.height) / 2;
    const resolved = this.scene.resolveObstacleCollision(this.x, this.y, this.x, this.y, colRadius);

    if (resolved.collided) {
      this.x = resolved.x;
      this.y = resolved.y;
      // Bounce and kill forward speed on impact
      this.speed = -this.speed * 0.35;
      if (this.scene.soundSynth) {
        this.scene.soundSynth.playCrash();
      }
    }
  }

  destroy() {
    this.container.destroy();
  }
}
