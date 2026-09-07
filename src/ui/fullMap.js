// Full City Map Directory Overlay for Palmetto Shores '86
// Renders the entire 8000x8000 metropolitan world with districts and landmarks
import { CONFIG } from '../config.js';
import { DISTRICTS, ROADS, WATER_BODIES, BUILDINGS } from '../world/mapData.js';

export class FullMap {
  constructor(scene) {
    this.scene = scene;
    this.modal = document.getElementById('fullmap-modal');
    this.canvas = document.getElementById('fullmap-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.closeBtn = document.getElementById('close-map-btn');

    this.isOpen = false;
    this.zoom = 0.085; // Initial zoom
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    this.initEvents();
  }

  initEvents() {
    this.closeBtn.addEventListener('click', () => this.toggle(false));

    window.addEventListener('keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') {
        this.toggle(!this.isOpen);
      } else if (e.key === 'Escape' && this.isOpen) {
        this.toggle(false);
      }
    });

    // Drag to pan
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX - this.panX;
      this.dragStartY = e.clientY - this.panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.isOpen) return;
      this.panX = e.clientX - this.dragStartX;
      this.panY = e.clientY - this.dragStartY;
      this.render();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Wheel to zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      this.zoom = Phaser.Math.Clamp(this.zoom * zoomFactor, 0.04, 0.25);
      this.render();
    });
  }

  toggle(show) {
    this.isOpen = show;
    this.modal.style.display = show ? 'flex' : 'none';

    if (show) {
      this.resizeCanvas();
      // Fit full 8000x8000 city onto directory canvas
      this.zoom = Math.min(this.canvas.width / CONFIG.WORLD_WIDTH, this.canvas.height / CONFIG.WORLD_HEIGHT) * 0.94;
      this.panX = (this.canvas.width - CONFIG.WORLD_WIDTH * this.zoom) / 2;
      this.panY = (this.canvas.height - CONFIG.WORLD_HEIGHT * this.zoom) / 2;
      this.render();
    }
  }

  resizeCanvas() {
    const container = document.getElementById('fullmap-canvas-container');
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
  }

  render() {
    if (!this.isOpen) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#0b0c1b';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.zoom, this.zoom);

    // 1. World Boundary Outline & Base Land
    ctx.fillStyle = '#152238';
    ctx.fillRect(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 16;
    ctx.strokeRect(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);

    // 2. Water Bodies (Ocean East Coast, Marina Basin, Park Lake)
    ctx.fillStyle = '#0077b6';
    ctx.fillRect(6900, 0, 1100, CONFIG.WORLD_HEIGHT); // Atlantic Ocean

    for (const wb of WATER_BODIES) {
      if (wb.rect) {
        ctx.fillStyle = '#023e8a';
        ctx.fillRect(wb.rect.x, wb.rect.y, wb.rect.w, wb.rect.h);
      }
    }

    // 3. Roads Network
    for (const r of ROADS) {
      ctx.beginPath();
      ctx.moveTo(r.x1, r.y1);
      ctx.lineTo(r.x2, r.y2);

      if (r.type === 'highway') {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = r.width;
      } else if (r.type === 'major') {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = r.width * 0.9;
      } else {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = r.width * 0.8;
      }
      ctx.stroke();
    }

    // 4. Buildings
    for (const b of BUILDINGS) {
      ctx.fillStyle = b.district === 'downtown' ? '#ff2a85' : '#334155';
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }

    // 5. District Boundaries & Distinctive Badges
    for (const d of DISTRICTS) {
      const bw = d.bounds.x2 - d.bounds.x1;
      const bh = d.bounds.y2 - d.bounds.y1;

      // Transparent district zone tint
      ctx.fillStyle = d.color + '15';
      ctx.fillRect(d.bounds.x1, d.bounds.y1, bw, bh);

      // Dashed boundary box
      ctx.strokeStyle = d.color;
      ctx.lineWidth = 5;
      ctx.setLineDash([24, 20]);
      ctx.strokeRect(d.bounds.x1, d.bounds.y1, bw, bh);
      ctx.setLineDash([]);

      // District Name Badge Card
      const badgeW = Math.min(bw - 40, 1400);
      const badgeH = 150;
      const badgeX = d.bounds.x1 + (bw - badgeW) / 2;
      const badgeY = d.bounds.y1 + 40;

      ctx.fillStyle = 'rgba(13, 12, 29, 0.88)';
      ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
      ctx.strokeStyle = d.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

      ctx.fillStyle = d.color;
      ctx.font = 'bold 80px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.name.toUpperCase(), badgeX + badgeW / 2, badgeY + 75);

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText(d.subtitle.toUpperCase(), badgeX + badgeW / 2, badgeY + 125);
    }

    // 6. Player Blip with Pulsing Radar Beacon
    const p = this.scene.player;
    if (p) {
      // Outer neon cyan beacon
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 75, 0, Math.PI * 2);
      ctx.stroke();

      // Middle ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 45, 0, Math.PI * 2);
      ctx.stroke();

      // Solid player dot
      ctx.fillStyle = '#ff2a85';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 30, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
