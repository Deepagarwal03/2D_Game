// Player Controller & Character System for Palmetto Shores '86
import { CONFIG } from '../config.js';

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0; // In radians
    this.speed = 0;
    this.radius = CONFIG.PLAYER.RADIUS;

    this.isSprinting = false;
    this.isInVehicle = false;
    this.currentVehicle = null;

    // Walk animation step accumulator
    this.walkCycle = 0;
    this.isMoving = false;

    // Create container and graphics for procedural top-down character
    this.container = scene.add.container(x, y);
    this.container.setDepth(50);

    // Dynamic procedural graphics for body, legs, arms, head
    this.graphics = scene.add.graphics();
    this.container.add(this.graphics);

    // Player collision bounds
    this.bounds = {
      minX: 40,
      maxX: CONFIG.WORLD_WIDTH - 40,
      minY: 40,
      maxY: CONFIG.WORLD_HEIGHT - 40
    };

    // Draw initial idle pose
    this.renderCharacter(0);
  }

  // Procedural 1980s Top-Down Protagonist (Pastel Blazer, Aviators, Animated Limbs)
  renderCharacter(walkPhase) {
    const g = this.graphics;
    g.clear();

    const armSwing = Math.sin(walkPhase) * 6;
    const legSwing = Math.sin(walkPhase) * 8;

    // 1. Drop shadow
    g.fillStyle(0x000000, 0.35);
    g.fillCircle(2, 4, 16);

    // 2. Legs / White Loafers
    g.fillStyle(0xffffff, 1.0); // 80s White slip-on loafers
    // Left leg
    g.fillRect(-11, 4 + legSwing, 6, 12);
    // Right leg
    g.fillRect(5, 4 - legSwing, 6, 12);

    // White slacks / pants
    g.fillStyle(0xf0f0f5, 1.0);
    g.fillRect(-12, 0 + legSwing * 0.5, 8, 8);
    g.fillRect(4, 0 - legSwing * 0.5, 8, 8);

    // 3. Torso / Miami Pastel Pink Blazer
    g.fillStyle(CONFIG.PLAYER.COLOR_BODY, 1.0);
    g.fillRoundedRect(-14, -10, 28, 18, 5);

    // 4. Inner Neon Cyan V-Neck Shirt
    g.fillStyle(CONFIG.PLAYER.COLOR_SHIRT, 1.0);
    g.fillTriangle(-5, -10, 5, -10, 0, -2);

    // 5. Arms & Hands swinging with walk cycle
    g.fillStyle(CONFIG.PLAYER.COLOR_BODY, 1.0);
    // Left shoulder / arm
    g.fillCircle(-14, -4 + armSwing, 4.5);
    // Right shoulder / arm
    g.fillCircle(14, -4 - armSwing, 4.5);

    // Tanned hands
    g.fillStyle(CONFIG.PLAYER.COLOR_SKIN, 1.0);
    g.fillCircle(-14, -9 + armSwing, 3.5);
    g.fillCircle(14, -9 - armSwing, 3.5);

    // 6. Head & 80s Hairstyle
    g.fillStyle(CONFIG.PLAYER.COLOR_SKIN, 1.0);
    g.fillCircle(0, -5, 7.5);

    // Dark swept-back hair
    g.fillStyle(CONFIG.PLAYER.COLOR_HAIR, 1.0);
    g.fillCircle(0, -7, 7);

    // Gold aviator sunglasses
    g.fillStyle(0xffbe0b, 1.0);
    g.fillRect(-5, -10, 4, 2);
    g.fillRect(1, -10, 4, 2);
    g.fillRect(-1, -9, 2, 1);
  }

  update(cursors, wasd, delta) {
    if (this.isInVehicle) {
      // Player is inside vehicle - position tracks vehicle
      if (this.currentVehicle) {
        this.x = this.currentVehicle.x;
        this.y = this.currentVehicle.y;
        this.container.setPosition(this.x, this.y);
      }
      return;
    }

    const dt = delta / 1000;

    // Movement input
    let moveX = 0;
    let moveY = 0;

    if (wasd.left.isDown || cursors.left.isDown) moveX -= 1;
    if (wasd.right.isDown || cursors.right.isDown) moveX += 1;
    if (wasd.up.isDown || cursors.up.isDown) moveY -= 1;
    if (wasd.down.isDown || cursors.down.isDown) moveY += 1;

    // Normalize diagonal movement
    const len = Math.hypot(moveX, moveY);
    if (len > 0) {
      moveX /= len;
      moveY /= len;
      this.isMoving = true;
    } else {
      this.isMoving = false;
    }

    // Sprint check
    this.isSprinting = wasd.shift.isDown && this.isMoving;
    const targetMaxSpeed = this.isSprinting ? CONFIG.PLAYER.SPRINT_SPEED : CONFIG.PLAYER.WALK_SPEED;

    // Acceleration & Deceleration
    if (this.isMoving) {
      const accel = CONFIG.PLAYER.ACCELERATION * dt;
      this.vx = Phaser.Math.Linear(this.vx, moveX * targetMaxSpeed, Math.min(1, accel / targetMaxSpeed));
      this.vy = Phaser.Math.Linear(this.vy, moveY * targetMaxSpeed, Math.min(1, accel / targetMaxSpeed));

      // Update facing angle smoothly towards movement direction
      const targetAngle = Math.atan2(moveY, moveX) + Math.PI / 2;
      this.angle = Phaser.Math.Angle.RotateTo(this.angle, targetAngle, 12 * dt);

      // Advance walk cycle
      this.walkCycle += (this.isSprinting ? 18 : 10) * dt;
    } else {
      const decel = Math.min(1, (CONFIG.PLAYER.DECELERATION * dt) / (Math.hypot(this.vx, this.vy) || 1));
      this.vx = Phaser.Math.Linear(this.vx, 0, decel);
      this.vy = Phaser.Math.Linear(this.vy, 0, decel);
      if (Math.hypot(this.vx, this.vy) < 5) {
        this.vx = 0;
        this.vy = 0;
        this.walkCycle = 0;
      }
    }

    this.speed = Math.hypot(this.vx, this.vy);

    // Apply intended movement with collision resolution
    const nextX = this.x + this.vx * dt;
    const nextY = this.y + this.vy * dt;

    const resolved = this.scene.resolveObstacleCollision(this.x, this.y, nextX, nextY, this.radius);
    this.x = resolved.x;
    this.y = resolved.y;

    // Enforce world boundaries
    this.x = Phaser.Math.Clamp(this.x, this.bounds.minX, this.bounds.maxX);
    this.y = Phaser.Math.Clamp(this.y, this.bounds.minY, this.bounds.maxY);

    // Update container transform
    this.container.setPosition(this.x, this.y);
    this.container.setRotation(this.angle);

    // Render character animation
    this.renderCharacter(this.walkCycle);
  }

  enterVehicle(vehicle) {
    this.isInVehicle = true;
    this.currentVehicle = vehicle;
    this.container.setVisible(false);
    vehicle.driver = this;
  }

  exitVehicle() {
    if (!this.isInVehicle || !this.currentVehicle) return;

    const v = this.currentVehicle;
    // Exit to the left/driver side of the vehicle
    const exitAngle = v.angle - Math.PI / 2;
    const exitDistance = v.width / 2 + 25;
    const exitX = v.x + Math.cos(exitAngle) * exitDistance;
    const exitY = v.y + Math.sin(exitAngle) * exitDistance;

    // Ensure exit point is valid and within bounds
    const safePos = this.scene.resolveObstacleCollision(v.x, v.y, exitX, exitY, this.radius);
    this.x = safePos.x;
    this.y = safePos.y;
    this.vx = 0;
    this.vy = 0;

    v.driver = null;
    this.currentVehicle = null;
    this.isInVehicle = false;

    this.container.setPosition(this.x, this.y);
    this.container.setVisible(true);
  }
}
