// Chunk-based Terrain & Road Generator for Palmetto Shores '86
import { CONFIG } from '../config.js';
import { ROADS, WATER_BODIES, BEACH_ZONE, MARINA_PIERS, BUILDINGS } from './mapData.js';

export class ChunkRenderer {
  constructor(scene) {
    this.scene = scene;
    this.chunkTextures = new Map(); // key: 'cx,cy' => textureKey
    this.chunkSprites = new Map();   // key: 'cx,cy' => Phaser.GameObjects.Image
    this.activeChunkCoords = new Set();
  }

  // Get chunk coordinate from world position
  getChunkCoord(worldPos) {
    return Math.floor(worldPos / CONFIG.CHUNK_SIZE);
  }

  // Update visible chunks around camera
  update(camera) {
    const minCx = Math.max(0, this.getChunkCoord(camera.worldView.left - 400));
    const maxCx = Math.min(CONFIG.CHUNKS_X - 1, this.getChunkCoord(camera.worldView.right + 400));
    const minCy = Math.max(0, this.getChunkCoord(camera.worldView.top - 400));
    const maxCy = Math.min(CONFIG.CHUNKS_Y - 1, this.getChunkCoord(camera.worldView.bottom + 400));

    const currentCoords = new Set();

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const key = `${cx},${cy}`;
        currentCoords.add(key);

        if (!this.chunkSprites.has(key)) {
          this.loadAndDisplayChunk(cx, cy, key);
        }
      }
    }

    // Hide/cull chunks that are far away
    for (const [key, sprite] of this.chunkSprites.entries()) {
      if (!currentCoords.has(key)) {
        sprite.setVisible(false);
      } else {
        sprite.setVisible(true);
      }
    }
  }

  loadAndDisplayChunk(cx, cy, key) {
    const textureKey = `chunk_${cx}_${cy}`;

    if (!this.scene.textures.exists(textureKey)) {
      this.generateChunkTexture(cx, cy, textureKey);
    }

    const worldX = cx * CONFIG.CHUNK_SIZE;
    const worldY = cy * CONFIG.CHUNK_SIZE;
    const sprite = this.scene.add.image(worldX, worldY, textureKey);
    sprite.setOrigin(0, 0);
    sprite.setDepth(-100); // Below all gameplay objects
    this.chunkSprites.set(key, sprite);
  }

  generateChunkTexture(cx, cy, textureKey) {
    const size = CONFIG.CHUNK_SIZE;
    const chunkWorldX = cx * size;
    const chunkWorldY = cy * size;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 1. BASE GROUND TERRAIN
    this.drawTerrain(ctx, chunkWorldX, chunkWorldY, size);

    // 2. PARKING LOTS & SIDEWALK PLAZAS
    this.drawPavements(ctx, chunkWorldX, chunkWorldY, size);

    // 3. ROADS & RUNWAYS
    this.drawRoads(ctx, chunkWorldX, chunkWorldY, size);

    // 4. WATER BODIES (Basin, Lake, Ocean)
    this.drawWater(ctx, chunkWorldX, chunkWorldY, size);

    // 5. MARINA PIERS & WOOD DOCKS
    this.drawMarinaPiers(ctx, chunkWorldX, chunkWorldY, size);

    // 6. SWIMMING POOLS & TENNIS COURTS
    this.drawYardsAndAmenities(ctx, chunkWorldX, chunkWorldY, size);

    this.scene.textures.addCanvas(textureKey, canvas);
  }

  drawTerrain(ctx, wx, wy, size) {
    // Determine primary district feel for base ground
    let baseColor = '#2b5229'; // Default lush subtropical grass

    if (wx >= 6600) {
      // Near beach
      baseColor = CONFIG.COLORS.BEACH_SAND;
    } else if (wx < 2400 && wy >= 5200) {
      // Industrial port tarmac/dirt
      baseColor = '#3f424e';
    } else if (wx < 3600 && wy < 2600) {
      // Airport field
      baseColor = '#354834';
    } else if (wx >= 3600 && wx < 6000 && wy >= 2800 && wy < 5200) {
      // Downtown city ground
      baseColor = '#474b5a';
    }

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    // Beach sand transition along east coast
    if (wx + size >= BEACH_ZONE.x1 && wx <= BEACH_ZONE.x2) {
      const sandStart = Math.max(0, BEACH_ZONE.x1 - wx);
      const sandWidth = Math.min(size, BEACH_ZONE.x2 - wx) - sandStart;
      ctx.fillStyle = CONFIG.COLORS.BEACH_SAND;
      ctx.fillRect(sandStart, 0, sandWidth, size);

      // Boardwalk along west of beach
      if (wx <= 6640 && wx + size >= 6560) {
        const bwX = Math.max(0, 6560 - wx);
        const bwW = Math.min(80, 6640 - wx - bwX);
        ctx.fillStyle = '#b08968'; // Wood boardwalk
        ctx.fillRect(bwX, 0, bwW, size);
        // Wood plank stripes
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 2;
        for (let y = 0; y < size; y += 16) {
          ctx.beginPath();
          ctx.moveTo(bwX, y);
          ctx.lineTo(bwX + bwW, y);
          ctx.stroke();
        }
      }
    }
  }

  drawPavements(ctx, wx, wy, size) {
    // Draw sidewalk concrete border for roads passing through chunk
    for (const road of ROADS) {
      const minRx = Math.min(road.x1, road.x2) - road.width / 2 - 20;
      const maxRx = Math.max(road.x1, road.x2) + road.width / 2 + 20;
      const minRy = Math.min(road.y1, road.y2) - road.width / 2 - 20;
      const maxRy = Math.max(road.y1, road.y2) + road.width / 2 + 20;

      // Check chunk intersection
      if (maxRx >= wx && minRx <= wx + size && maxRy >= wy && minRy <= wy + size) {
        const isHoriz = Math.abs(road.y1 - road.y2) < 10;
        ctx.fillStyle = CONFIG.COLORS.SIDEWALK;

        if (isHoriz) {
          const rx1 = Math.max(0, road.x1 - wx);
          const rx2 = Math.min(size, road.x2 - wx);
          const ry = road.y1 - wy;
          const totalW = road.width + 36; // road + sidewalks
          ctx.fillRect(rx1, ry - totalW / 2, rx2 - rx1, totalW);
        } else {
          const ry1 = Math.max(0, road.y1 - wy);
          const ry2 = Math.min(size, road.y2 - wy);
          const rx = road.x1 - wx;
          const totalW = road.width + 36;
          ctx.fillRect(rx - totalW / 2, ry1, totalW, ry2 - ry1);
        }
      }
    }
  }

  drawRoads(ctx, wx, wy, size) {
    for (const road of ROADS) {
      const minRx = Math.min(road.x1, road.x2) - road.width / 2;
      const maxRx = Math.max(road.x1, road.x2) + road.width / 2;
      const minRy = Math.min(road.y1, road.y2) - road.width / 2;
      const maxRy = Math.max(road.y1, road.y2) + road.width / 2;

      if (maxRx < wx || minRx > wx + size || maxRy < wy || minRy > wy + size) continue;

      const isHoriz = Math.abs(road.y1 - road.y2) < 10;

      // Asphalt color
      let asphaltColor = CONFIG.COLORS.ROAD_ASPHALT;
      if (road.type === 'highway') asphaltColor = CONFIG.COLORS.HIGHWAY_ASPHALT;
      if (road.type === 'runway') asphaltColor = CONFIG.COLORS.RUNWAY_ASPHALT;
      if (road.type === 'alley') asphaltColor = '#222329';

      ctx.fillStyle = asphaltColor;

      if (isHoriz) {
        const rx1 = Math.max(0, road.x1 - wx);
        const rx2 = Math.min(size, road.x2 - wx);
        const ry = road.y1 - wy;
        const rw = road.width;

        ctx.fillRect(rx1, ry - rw / 2, rx2 - rx1, rw);

        // Markings
        if (road.type === 'highway') {
          // Concrete median divider
          ctx.fillStyle = '#6c757d';
          ctx.fillRect(rx1, ry - 4, rx2 - rx1, 8);
          // Dashed white lines
          ctx.strokeStyle = CONFIG.COLORS.ROAD_MARKING_WHITE;
          ctx.lineWidth = 2;
          ctx.setLineDash([16, 16]);
          ctx.beginPath();
          ctx.moveTo(rx1, ry - rw / 4);
          ctx.lineTo(rx2, ry - rw / 4);
          ctx.moveTo(rx1, ry + rw / 4);
          ctx.lineTo(rx2, ry + rw / 4);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (road.type === 'major') {
          // Double yellow centerline
          ctx.strokeStyle = CONFIG.COLORS.ROAD_MARKING_YELLOW;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(rx1, ry - 3);
          ctx.lineTo(rx2, ry - 3);
          ctx.moveTo(rx1, ry + 3);
          ctx.lineTo(rx2, ry + 3);
          ctx.stroke();
          // Dashed white lane lines
          ctx.strokeStyle = CONFIG.COLORS.ROAD_MARKING_WHITE;
          ctx.setLineDash([12, 14]);
          ctx.beginPath();
          ctx.moveTo(rx1, ry - rw / 4);
          ctx.lineTo(rx2, ry - rw / 4);
          ctx.moveTo(rx1, ry + rw / 4);
          ctx.lineTo(rx2, ry + rw / 4);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (road.type === 'minor') {
          // Single dashed yellow centerline
          ctx.strokeStyle = CONFIG.COLORS.ROAD_MARKING_YELLOW;
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 12]);
          ctx.beginPath();
          ctx.moveTo(rx1, ry);
          ctx.lineTo(rx2, ry);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (road.type === 'runway') {
          // Airport Runway White Centerline & Threshold
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 6;
          ctx.setLineDash([30, 20]);
          ctx.beginPath();
          ctx.moveTo(rx1, ry);
          ctx.lineTo(rx2, ry);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else {
        // Vertical Road
        const ry1 = Math.max(0, road.y1 - wy);
        const ry2 = Math.min(size, road.y2 - wy);
        const rx = road.x1 - wx;
        const rw = road.width;

        ctx.fillRect(rx - rw / 2, ry1, rw, ry2 - ry1);

        // Markings
        if (road.type === 'highway') {
          ctx.fillStyle = '#6c757d';
          ctx.fillRect(rx - 4, ry1, 8, ry2 - ry1);
          ctx.strokeStyle = CONFIG.COLORS.ROAD_MARKING_WHITE;
          ctx.lineWidth = 2;
          ctx.setLineDash([16, 16]);
          ctx.beginPath();
          ctx.moveTo(rx - rw / 4, ry1);
          ctx.lineTo(rx - rw / 4, ry2);
          ctx.moveTo(rx + rw / 4, ry1);
          ctx.lineTo(rx + rw / 4, ry2);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (road.type === 'major') {
          ctx.strokeStyle = CONFIG.COLORS.ROAD_MARKING_YELLOW;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(rx - 3, ry1);
          ctx.lineTo(rx - 3, ry2);
          ctx.moveTo(rx + 3, ry1);
          ctx.lineTo(rx + 3, ry2);
          ctx.stroke();
          ctx.strokeStyle = CONFIG.COLORS.ROAD_MARKING_WHITE;
          ctx.setLineDash([12, 14]);
          ctx.beginPath();
          ctx.moveTo(rx - rw / 4, ry1);
          ctx.lineTo(rx - rw / 4, ry2);
          ctx.moveTo(rx + rw / 4, ry1);
          ctx.lineTo(rx + rw / 4, ry2);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (road.type === 'minor') {
          ctx.strokeStyle = CONFIG.COLORS.ROAD_MARKING_YELLOW;
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 12]);
          ctx.beginPath();
          ctx.moveTo(rx, ry1);
          ctx.lineTo(rx, ry2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    // DRAW ZEBRA CROSSWALKS AT INTERSECTIONS
    this.drawCrosswalks(ctx, wx, wy, size);
  }

  drawCrosswalks(ctx, wx, wy, size) {
    const intersections = [
      { x: 3400, y: 3000 }, { x: 4600, y: 3000 }, { x: 5600, y: 3000 }, { x: 6600, y: 3000 },
      { x: 3400, y: 4200 }, { x: 4600, y: 4200 }, { x: 5600, y: 4200 }, { x: 6600, y: 4200 },
      { x: 2200, y: 3000 }, { x: 2200, y: 4200 }, { x: 1200, y: 3000 }, { x: 1200, y: 4200 },
      { x: 3400, y: 5400 }, { x: 4600, y: 5400 }, { x: 5600, y: 5400 }, { x: 6600, y: 5400 }
    ];

    ctx.fillStyle = CONFIG.COLORS.ROAD_MARKING_WHITE;

    for (const ix of intersections) {
      if (ix.x >= wx - 80 && ix.x <= wx + size + 80 && ix.y >= wy - 80 && ix.y <= wy + size + 80) {
        const cx = ix.x - wx;
        const cy = ix.y - wy;

        // North crosswalk
        for (let i = -30; i <= 30; i += 8) {
          ctx.fillRect(cx + i, cy - 50, 4, 16);
        }
        // South crosswalk
        for (let i = -30; i <= 30; i += 8) {
          ctx.fillRect(cx + i, cy + 34, 4, 16);
        }
        // East crosswalk
        for (let i = -30; i <= 30; i += 8) {
          ctx.fillRect(cx + 34, cy + i, 16, 4);
        }
        // West crosswalk
        for (let i = -30; i <= 30; i += 8) {
          ctx.fillRect(cx - 50, cy + i, 16, 4);
        }
      }
    }
  }

  drawWater(ctx, wx, wy, size) {
    // 1. Ocean East Coast
    if (wx + size >= 6900) {
      const oceanStartX = Math.max(0, 6900 - wx);
      // Ocean deep blue
      const oceanGrad = ctx.createLinearGradient(oceanStartX, 0, size, 0);
      oceanGrad.addColorStop(0, CONFIG.COLORS.OCEAN_SHALLOW);
      oceanGrad.addColorStop(0.3, CONFIG.COLORS.OCEAN);
      oceanGrad.addColorStop(1, CONFIG.COLORS.OCEAN_DEEP);
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(oceanStartX, 0, size - oceanStartX, size);

      // Shoreline surf / foam wave
      ctx.strokeStyle = CONFIG.COLORS.SHORE_FOAM;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(oceanStartX, 0);
      for (let y = 0; y < size; y += 20) {
        const waveOffset = Math.sin((wy + y) * 0.05) * 6;
        ctx.lineTo(oceanStartX + waveOffset, y);
      }
      ctx.stroke();
    }

    // 2. Marina Basin & Park Lake
    for (const wb of WATER_BODIES) {
      if (wb.rect) {
        const rx = wb.rect.x - wx;
        const ry = wb.rect.y - wy;
        const rw = wb.rect.w;
        const rh = wb.rect.h;

        if (rx + rw >= 0 && rx <= size && ry + rh >= 0 && ry <= size) {
          const drawX = Math.max(0, rx);
          const drawY = Math.max(0, ry);
          const drawW = Math.min(size, rx + rw) - drawX;
          const drawH = Math.min(size, ry + rh) - drawY;

          ctx.fillStyle = wb.type === 'marina' ? '#006d77' : '#1d3557';
          ctx.fillRect(drawX, drawY, drawW, drawH);

          // Bank border
          ctx.strokeStyle = wb.type === 'marina' ? '#83c5be' : '#457b9d';
          ctx.lineWidth = 4;
          ctx.strokeRect(rx, ry, rw, rh);
        }
      }
    }
  }

  drawMarinaPiers(ctx, wx, wy, size) {
    for (const pier of MARINA_PIERS) {
      const px = pier.x - wx;
      const py = pier.y - wy;
      if (px + pier.w >= 0 && px <= size && py + pier.h >= 0 && py <= size) {
        ctx.fillStyle = CONFIG.COLORS.DOCK_WOOD;
        ctx.fillRect(px, py, pier.w, pier.h);

        ctx.strokeStyle = '#582f0e';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, pier.w, pier.h);
      }
    }
  }

  drawYardsAndAmenities(ctx, wx, wy, size) {
    // Draw swimming pools and tennis courts for buildings in chunk
    for (const b of BUILDINGS) {
      if (b.x + b.w >= wx && b.x <= wx + size && b.y + b.h >= wy && b.y <= wy + size) {
        // Swimming pool behind mansion / hotel
        if (b.pool) {
          const poolX = (b.x + b.w - 80) - wx;
          const poolY = (b.y + b.h + 10) - wy;
          if (poolX >= -100 && poolX <= size + 100 && poolY >= -100 && poolY <= size + 100) {
            // Pool coping
            ctx.fillStyle = '#edf2f4';
            ctx.fillRect(poolX - 4, poolY - 4, 68, 38);
            // Sparkling turquoise pool water
            ctx.fillStyle = '#00b4d8';
            ctx.fillRect(poolX, poolY, 60, 30);
          }
        }
        // Tennis court
        if (b.tennis) {
          const courtX = (b.x + b.w + 20) - wx;
          const courtY = b.y - wy;
          if (courtX >= -120 && courtX <= size + 120 && courtY >= -120 && courtY <= size + 120) {
            ctx.fillStyle = '#d90429'; // Red border
            ctx.fillRect(courtX - 4, courtY - 4, 98, 58);
            ctx.fillStyle = '#2b9348'; // Green court
            ctx.fillRect(courtX, courtY, 90, 50);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(courtX + 10, courtY + 5, 70, 40);
            ctx.beginPath();
            ctx.moveTo(courtX + 45, courtY + 5);
            ctx.lineTo(courtX + 45, courtY + 45);
            ctx.stroke();
          }
        }
      }
    }
  }
}
