// GTA-Style Minimap Radar for Palmetto Shores '86
// Renders directly from canonical world geometry (ROADS, WATER_BODIES, BUILDINGS)
import { CONFIG } from '../config.js';
import { ROADS, WATER_BODIES, BUILDINGS } from '../world/mapData.js';

export class Minimap {
  constructor(scene) {
    this.scene = scene;
    this.canvas = document.getElementById('minimap-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.compassEl = document.getElementById('minimap-compass');

    this.radarRadius = 105; // 210 / 2
    this.radarZoom = 0.11;  // World units to radar pixels ratio
    this.rotateWithPlayer = true;
  }

  update(player, vehicles, pedestrians) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    const px = player.x;
    const py = player.y;
    // Target heading angle
    const heading = player.isInVehicle && player.currentVehicle ? player.currentVehicle.angle : player.angle;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Save context for circular clipping
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, this.radarRadius, 0, Math.PI * 2);
    ctx.clip();

    // Fill background with dark ocean/land base
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Coordinate transform centered on player
    ctx.save();
    ctx.translate(cx, cy);

    if (this.rotateWithPlayer) {
      // Rotate radar world so player always points UP (GTA style!)
      ctx.rotate(-heading);
      // Update compass N indicator position/rotation
      if (this.compassEl) {
        const compassAngle = -heading;
        const compX = Math.sin(compassAngle) * 88;
        const compY = -Math.cos(compassAngle) * 88;
        this.compassEl.style.transform = `translate(-50%, -50%) translate(${compX}px, ${compY}px)`;
      }
    }

    const scale = this.radarZoom;

    // 1. RENDER WATER BODIES
    ctx.fillStyle = '#0284c7';
    // Ocean east coast
    const oceanX = (6900 - px) * scale;
    if (oceanX < 250) {
      ctx.fillRect(Math.max(-250, oceanX), -250, 500, 500);
    }
    // Marina Basin & Lake
    for (const wb of WATER_BODIES) {
      if (wb.rect) {
        const wx = (wb.rect.x - px) * scale;
        const wy = (wb.rect.y - py) * scale;
        const ww = wb.rect.w * scale;
        const wh = wb.rect.h * scale;
        ctx.fillRect(wx, wy, ww, wh);
      }
    }

    // 2. RENDER ROADS
    for (const r of ROADS) {
      const x1 = (r.x1 - px) * scale;
      const y1 = (r.y1 - py) * scale;
      const x2 = (r.x2 - px) * scale;
      const y2 = (r.y2 - py) * scale;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      if (r.type === 'highway') {
        ctx.strokeStyle = '#f59e0b'; // Gold highway
        ctx.lineWidth = Math.max(3.5, r.width * scale * 0.9);
      } else if (r.type === 'major') {
        ctx.strokeStyle = '#e2e8f0'; // Bright avenue
        ctx.lineWidth = Math.max(2.5, r.width * scale * 0.85);
      } else {
        ctx.strokeStyle = '#94a3b8'; // Minor street
        ctx.lineWidth = Math.max(1.8, r.width * scale * 0.8);
      }
      ctx.stroke();
    }

    // 3. RENDER BUILDINGS
    for (const b of BUILDINGS) {
      const bx = (b.x - px) * scale;
      const by = (b.y - py) * scale;
      const bw = b.w * scale;
      const bh = b.h * scale;

      // Skip buildings outside radar range
      if (Math.hypot(bx, by) > this.radarRadius + 50) continue;

      ctx.fillStyle = b.district === 'downtown' ? '#6366f1' : '#475569';
      ctx.fillRect(bx, by, bw, bh);
    }

    // 4. RENDER DYNAMIC BLIPS: VEHICLES
    for (const v of vehicles) {
      if (v.driver === player) continue;
      const vx = (v.x - px) * scale;
      const vy = (v.y - py) * scale;

      if (Math.hypot(vx, vy) < this.radarRadius - 4) {
        ctx.fillStyle = v.isAI ? '#38bdf8' : '#eab308'; // AI cars blue, parked cars yellow
        ctx.fillRect(vx - 2.5, vy - 2.5, 5, 5);
      }
    }

    // 5. RENDER DYNAMIC BLIPS: PEDESTRIANS
    if (pedestrians) {
      ctx.fillStyle = '#f472b6';
      for (const ped of pedestrians) {
        const pdx = (ped.x - px) * scale;
        const pdy = (ped.y - py) * scale;
        if (Math.hypot(pdx, pdy) < this.radarRadius - 4) {
          ctx.fillRect(pdx - 1, pdy - 1, 2, 2);
        }
      }
    }

    ctx.restore(); // Restore transform centered on player

    // 6. RENDER PLAYER BLIP AT CENTER
    // If radar rotates with player, player always points straight UP
    ctx.save();
    ctx.translate(cx, cy);
    if (!this.rotateWithPlayer) {
      ctx.rotate(heading);
    }

    // Player Direction Cone & Triangle
    ctx.fillStyle = '#ff2a85';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 7);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
    ctx.restore(); // Restore circular clipping
  }
}
