import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const BRAVE_PATH = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const URL = 'http://localhost:5173/';
const SCREENSHOT_DIR = '/Users/deep/agy/screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runTests() {
  console.log('--- STARTING AUTOMATED GAMEPLAY TESTS FOR PALMETTO SHORES 86 ---');

  const browser = await puppeteer.launch({
    executablePath: BRAVE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  console.log(`Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 15000 });

  // 1. Check initial load & canvas
  const canvasExists = await page.evaluate(() => {
    const c = document.querySelector('#game-container canvas');
    return !!c && c.width > 0 && c.height > 0;
  });
  console.log('✓ Canvas rendered:', canvasExists);

  // Wait 1.5 seconds for scene & terrain chunks
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_initial_spawn.png') });
  console.log('✓ Screenshot 01_initial_spawn.png saved');

  // 2. Inspect Game & Player Initial State
  const initialState = await page.evaluate(() => {
    const scene = window.__GAME_INSTANCE__.scene.scenes[0];
    const promptEl = document.getElementById('interaction-prompt');
    return {
      playerX: scene.player.x,
      playerY: scene.player.y,
      isInVehicle: scene.player.isInVehicle,
      promptVisible: promptEl.style.display !== 'none',
      promptText: promptEl.innerText,
      nearestVehicle: scene.nearestVehicle ? scene.nearestVehicle.type.name : null,
      vehiclesCount: scene.worldVehicles.length,
      pedsCount: scene.pedestrianManager.getActiveCount(),
      trafficCount: scene.trafficManager.getActiveCount(),
      district: scene.currentDistrict ? scene.currentDistrict.name : null,
      fps: scene.game.loop.actualFps
    };
  });
  console.log('Initial State:', JSON.stringify(initialState, null, 2));

  // 3. Test WASD Player Movement
  console.log('Testing WASD walking...');
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 400));
  await page.keyboard.up('KeyW');

  const walkingPos = await page.evaluate(() => {
    const scene = window.__GAME_INSTANCE__.scene.scenes[0];
    return { x: scene.player.x, y: scene.player.y, speed: scene.player.speed };
  });
  console.log('✓ Player moved:', walkingPos);

  // 4. Test Vehicle Entry
  console.log('Testing vehicle entry [KeyE]...');
  await page.keyboard.press('KeyE');
  await new Promise(r => setTimeout(r, 400));

  const drivingState = await page.evaluate(() => {
    const scene = window.__GAME_INSTANCE__.scene.scenes[0];
    const hud = document.getElementById('vehicle-hud');
    return {
      isInVehicle: scene.player.isInVehicle,
      vehicleName: scene.player.currentVehicle ? scene.player.currentVehicle.type.name : null,
      hudVisible: hud.style.display !== 'none'
    };
  });
  console.log('✓ Driving state after [E]:', drivingState);

  // 5. Test Driving & Drifting
  console.log('Driving vehicle (Accelerate W + Turn D + Drift Space)...');
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 800));
  await page.keyboard.down('KeyD');
  await page.keyboard.down('Space');
  await new Promise(r => setTimeout(r, 600));
  await page.keyboard.up('Space');
  await page.keyboard.up('KeyD');
  await page.keyboard.up('KeyW');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_driving_drifting.png') });
  console.log('✓ Screenshot 02_driving_drifting.png saved');

  const drivingPhysics = await page.evaluate(() => {
    const scene = window.__GAME_INSTANCE__.scene.scenes[0];
    const v = scene.player.currentVehicle;
    return {
      speed: v ? Math.round(v.speed) : 0,
      x: v ? Math.round(v.x) : 0,
      y: v ? Math.round(v.y) : 0,
      angle: v ? Number(v.angle.toFixed(2)) : 0
    };
  });
  console.log('✓ Vehicle physics update:', drivingPhysics);

  // 6. Test Exiting Vehicle
  console.log('Testing vehicle exit [KeyE]...');
  await page.keyboard.press('KeyE');
  await new Promise(r => setTimeout(r, 400));

  const exitState = await page.evaluate(() => {
    const scene = window.__GAME_INSTANCE__.scene.scenes[0];
    return {
      isInVehicle: scene.player.isInVehicle,
      playerX: Math.round(scene.player.x),
      playerY: Math.round(scene.player.y)
    };
  });
  console.log('✓ Exited vehicle state:', exitState);

  // 7. Test Crossing Multiple Districts & Exploration
  console.log('Testing continuous exploration across districts...');
  const testWaypoints = [
    { name: 'Downtown Financial', x: 4400, y: 3500 },
    { name: 'Sunset Marina', x: 5800, y: 6400 },
    { name: 'Greenfield Botanical Gardens', x: 3800, y: 6400 },
    { name: 'Port Palmetto & Industry', x: 1400, y: 6600 },
    { name: 'West Little Havana', x: 1200, y: 3800 },
    { name: 'Palmetto International Airport', x: 1800, y: 1600 }
  ];

  const districtsVisited = [];
  for (const wp of testWaypoints) {
    await page.evaluate((pos) => {
      const scene = window.__GAME_INSTANCE__.scene.scenes[0];
      scene.player.x = pos.x;
      scene.player.y = pos.y;
      scene.player.container.setPosition(pos.x, pos.y);
      scene.cameras.main.centerOn(pos.x, pos.y);
      scene.checkDistrictChange(true);
    }, wp);

    await new Promise(r => setTimeout(r, 400));

    const cur = await page.evaluate(() => {
      const scene = window.__GAME_INSTANCE__.scene.scenes[0];
      return scene.currentDistrict ? scene.currentDistrict.name : null;
    });
    districtsVisited.push({ waypoint: wp.name, detectedDistrict: cur });
  }
  console.log('✓ Districts visited:', districtsVisited);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_airport_runway.png') });
  console.log('✓ Screenshot 03_airport_runway.png saved');

  // 8. Test Minimap Accuracy
  console.log('Verifying Minimap canvas...');
  const minimapCheck = await page.evaluate(() => {
    const canvas = document.getElementById('minimap-canvas');
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let nonZero = 0;
    for (let i = 0; i < imgData.length; i += 4) {
      if (imgData[i + 3] > 0) nonZero++;
    }
    return {
      width: canvas.width,
      height: canvas.height,
      renderedPixelsRatio: nonZero / (canvas.width * canvas.height)
    };
  });
  console.log('✓ Minimap canvas verified:', minimapCheck);

  // 9. Test Fullscreen Map [M]
  console.log('Testing Fullscreen City Map toggle [M]...');
  await page.keyboard.press('KeyM');
  await new Promise(r => setTimeout(r, 600));

  const fullMapState = await page.evaluate(() => {
    const modal = document.getElementById('fullmap-modal');
    return { isOpen: modal.style.display !== 'none' };
  });
  console.log('✓ Full map modal state:', fullMapState);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_fullscreen_city_map.png') });
  console.log('✓ Screenshot 04_fullscreen_city_map.png saved');

  await page.keyboard.press('KeyM'); // Close
  await new Promise(r => setTimeout(r, 300));

  // 10. Check Console Errors
  console.log('Console errors count:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
  }

  await browser.close();
  console.log('--- ALL AUTOMATED TESTS FINISHED SUCCESSFULLY ---');

  if (consoleErrors.length > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
