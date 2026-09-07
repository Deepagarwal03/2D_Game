// Canonical World & Map Data for Palmetto Shores '86

export const DISTRICTS = [
  {
    id: 'downtown',
    name: 'Downtown Financial',
    subtitle: 'High-Rise Business & Neon District',
    bounds: { x1: 3600, y1: 2800, x2: 6000, y2: 5200 },
    color: '#ff2a85',
    ambientSound: 'city'
  },
  {
    id: 'ocean_strip',
    name: 'Ocean Strip & Beach',
    subtitle: 'Coastal Promenade & White Sands',
    bounds: { x1: 6000, y1: 400, x2: 8000, y2: 5600 },
    color: '#00f0ff',
    ambientSound: 'waves'
  },
  {
    id: 'sunset_marina',
    name: 'Sunset Marina',
    subtitle: 'Private Yacht Club & Boardwalk',
    bounds: { x1: 5200, y1: 5600, x2: 7800, y2: 7800 },
    color: '#3a86ff',
    ambientSound: 'waves'
  },
  {
    id: 'palm_heights',
    name: 'Palm Heights',
    subtitle: 'Luxury Mansions & Tennis Estates',
    bounds: { x1: 3800, y1: 400, x2: 6000, y2: 2800 },
    color: '#ffbe0b',
    ambientSound: 'suburbs'
  },
  {
    id: 'civic_center',
    name: 'Civic Commercial',
    subtitle: 'Art-Deco Shopping & Diners',
    bounds: { x1: 2000, y1: 2800, x2: 3600, y2: 5200 },
    color: '#fb5607',
    ambientSound: 'city'
  },
  {
    id: 'greenfield_park',
    name: 'Greenfield Botanical Gardens',
    subtitle: 'Public Parks & Lake Sanctuary',
    bounds: { x1: 2400, y1: 5200, x2: 5200, y2: 7800 },
    color: '#06d6a0',
    ambientSound: 'park'
  },
  {
    id: 'little_havana',
    name: 'West Little Havana',
    subtitle: 'Residential Quarters & Bodegas',
    bounds: { x1: 400, y1: 2800, x2: 2000, y2: 5200 },
    color: '#8338ec',
    ambientSound: 'suburbs'
  },
  {
    id: 'port_industrial',
    name: 'Port Palmetto & Industry',
    subtitle: 'Cargo Docks & Manufacturing',
    bounds: { x1: 400, y1: 5200, x2: 2400, y2: 7800 },
    color: '#6c757d',
    ambientSound: 'industrial'
  },
  {
    id: 'airport',
    name: 'Palmetto International Airport',
    subtitle: 'Terminal & Regional Runways',
    bounds: { x1: 400, y1: 400, x2: 3800, y2: 2800 },
    color: '#adb5bd',
    ambientSound: 'airport'
  }
];

// Helper to determine district by coordinates
export function getDistrictAt(x, y) {
  for (const d of DISTRICTS) {
    if (x >= d.bounds.x1 && x <= d.bounds.x2 && y >= d.bounds.y1 && y <= d.bounds.y2) {
      return d;
    }
  }
  return { id: 'outskirts', name: 'Palmetto Outskirts', subtitle: 'Metropolitan Area', color: '#ffb800' };
}

// Canonical Road Network
// Major avenues, coastal highway, side streets, alleys
export const ROADS = [
  // --- EAST-WEST HIGHWAY & ARTERIALS ---
  // North Expressway connecting Airport to Palm Heights
  { id: 'r_hwy_n', name: 'Northern Bypass Expressway', type: 'highway', x1: 400, y1: 1200, x2: 6000, y2: 1200, width: 80, lanes: 4 },
  // Central Avenue connecting Little Havana, Civic, Downtown to Ocean Strip
  { id: 'r_ave_c1', name: 'Palmetto Grand Boulevard', type: 'major', x1: 400, y1: 3000, x2: 6600, y2: 3000, width: 70, lanes: 4 },
  // South Central Avenue (Neon Boulevard)
  { id: 'r_ave_c2', name: 'Neon Boulevard', type: 'major', x1: 400, y1: 4200, x2: 6600, y2: 4200, width: 70, lanes: 4 },
  // Southern Industrial/Marina Expressway
  { id: 'r_hwy_s', name: 'Bay Shore Expressway', type: 'highway', x1: 400, y1: 5400, x2: 6800, y2: 5400, width: 75, lanes: 4 },
  // Marina South Road
  { id: 'r_marina_s', name: 'Sunset Pier Drive', type: 'minor', x1: 2400, y1: 6800, x2: 6600, y2: 6800, width: 50, lanes: 2 },
  // Airport North Service Road
  { id: 'r_air_s1', name: 'Airport Perimeter Road', type: 'minor', x1: 600, y1: 600, x2: 3600, y2: 600, width: 44, lanes: 2 },
  // Palm Heights Loop North
  { id: 'r_ph_n', name: 'Royal Palm Crescent', type: 'minor', x1: 3800, y1: 600, x2: 5800, y2: 600, width: 44, lanes: 2 },
  // Palm Heights Mid Street
  { id: 'r_ph_m', name: 'Hibiscus Way', type: 'minor', x1: 3800, y1: 1800, x2: 6000, y2: 1800, width: 48, lanes: 2 },
  // Industrial access road
  { id: 'r_ind_1', name: 'Port Access Way', type: 'minor', x1: 400, y1: 6400, x2: 2400, y2: 6400, width: 56, lanes: 2 },
  { id: 'r_ind_2', name: 'Container Terminal Road', type: 'minor', x1: 400, y1: 7400, x2: 2400, y2: 7400, width: 56, lanes: 2 },

  // --- NORTH-SOUTH ARTERIALS ---
  // Coastal Ocean Drive (Along Ocean Strip boardwalk)
  { id: 'r_ocean_dr', name: 'Ocean Drive Promenade', type: 'major', x1: 6600, y1: 400, x2: 6600, y2: 7000, width: 68, lanes: 4 },
  // Downtown East Boulevard
  { id: 'r_dt_e', name: 'Bayfront Avenue', type: 'major', x1: 5600, y1: 1200, x2: 5600, y2: 6800, width: 64, lanes: 4 },
  // Downtown Central / Financial Spine
  { id: 'r_dt_c', name: 'Vanderbilt Financial Way', type: 'major', x1: 4600, y1: 400, x2: 4600, y2: 5400, width: 68, lanes: 4 },
  // Park East Road
  { id: 'r_park_e', name: 'Botanical Drive', type: 'minor', x1: 4600, y1: 5400, x2: 4600, y2: 7600, width: 48, lanes: 2 },
  // Central Expressway (North-South Highway Corridor)
  { id: 'r_hwy_ns', name: 'Cross-City Interstate 86', type: 'highway', x1: 3400, y1: 400, x2: 3400, y2: 7600, width: 85, lanes: 4 },
  // Civic Center West Avenue
  { id: 'r_civ_w', name: 'Constitution Boulevard', type: 'major', x1: 2200, y1: 1200, x2: 2200, y2: 7600, width: 64, lanes: 4 },
  // West Residential / Little Havana Spine
  { id: 'r_lh_spine', name: 'Calle Sol', type: 'minor', x1: 1200, y1: 1200, x2: 1200, y2: 5400, width: 48, lanes: 2 },
  // Port Cargo Corridor
  { id: 'r_port_w', name: 'Dockside Expressway', type: 'minor', x1: 1200, y1: 5400, x2: 1200, y2: 7600, width: 56, lanes: 2 },

  // --- DOWNTOWN INNER GRID & ALLEYS ---
  { id: 'r_dt_grid1', name: 'Commerce Street', type: 'minor', x1: 3400, y1: 3600, x2: 5600, y2: 3600, width: 44, lanes: 2 },
  { id: 'r_dt_grid2', name: 'Metropolitan Plaza Way', type: 'minor', x1: 3400, y1: 4800, x2: 5600, y2: 4800, width: 44, lanes: 2 },
  { id: 'r_dt_grid3', name: 'Sterling Street', type: 'minor', x1: 4000, y1: 3000, x2: 4000, y2: 5400, width: 44, lanes: 2 },
  { id: 'r_dt_grid4', name: 'Lexington Avenue', type: 'minor', x1: 5100, y1: 3000, x2: 5100, y2: 5400, width: 44, lanes: 2 },
  // Downtown Alleys
  { id: 'r_alley_1', name: 'Sunset Alley', type: 'alley', x1: 3700, y1: 3300, x2: 4500, y2: 3300, width: 24, lanes: 1 },
  { id: 'r_alley_2', name: 'Neon Backstreet', type: 'alley', x1: 4700, y1: 3900, x2: 5500, y2: 3900, width: 24, lanes: 1 },
  { id: 'r_alley_3', name: 'Banker Alley', type: 'alley', x1: 4300, y1: 4500, x2: 4900, y2: 4500, width: 24, lanes: 1 },

  // --- RESIDENTIAL & SUBURBAN STREETS ---
  { id: 'r_lh_st1', name: 'Flamingo Street', type: 'minor', x1: 400, y1: 3600, x2: 2200, y2: 3600, width: 40, lanes: 2 },
  { id: 'r_lh_st2', name: 'Palma Court', type: 'minor', x1: 400, y1: 4800, x2: 2200, y2: 4800, width: 40, lanes: 2 },
  { id: 'r_lh_st3', name: 'Aztec Way', type: 'minor', x1: 1700, y1: 3000, x2: 1700, y2: 5400, width: 40, lanes: 2 },
  { id: 'r_ph_st1', name: 'Magnolia Terrace', type: 'minor', x1: 4800, y1: 600, x2: 4800, y2: 1800, width: 40, lanes: 2 },
  { id: 'r_ph_st2', name: 'Orchid Lane', type: 'minor', x1: 5400, y1: 600, x2: 5400, y2: 1800, width: 40, lanes: 2 },

  // --- AIRPORT TAXIWAYS & RUNWAY ROADS ---
  { id: 'r_air_runway1', name: 'Main Runway 09L/27R', type: 'runway', x1: 700, y1: 1600, x2: 3100, y2: 1600, width: 90, lanes: 2 },
  { id: 'r_air_runway2', name: 'Secondary Runway 09R/27L', type: 'runway', x1: 700, y1: 2200, x2: 2900, y2: 2200, width: 80, lanes: 2 },
  { id: 'r_air_taxi', name: 'Taxiway Alpha', type: 'taxiway', x1: 1900, y1: 1200, x2: 1900, y2: 2600, width: 60, lanes: 2 }
];

// Water Features
export const WATER_BODIES = [
  // Atlantic Ocean East Coast
  {
    id: 'ocean_main',
    type: 'ocean',
    name: 'Atlantic Coast Ocean',
    polygon: [
      { x: 6900, y: 0 },
      { x: 8000, y: 0 },
      { x: 8000, y: 8000 },
      { x: 6900, y: 8000 },
      { x: 6850, y: 5600 },
      { x: 6900, y: 4000 },
      { x: 6880, y: 2000 }
    ]
  },
  // Sunset Marina Basin
  {
    id: 'marina_basin',
    type: 'marina',
    name: 'Sunset Yacht Harbor',
    rect: { x: 5700, y: 6000, w: 1200, h: 900 }
  },
  // Greenfield Park Botanical Lake
  {
    id: 'park_lake',
    type: 'lake',
    name: 'Swan Lake Sanctuary',
    rect: { x: 3300, y: 5900, w: 850, h: 650 }
  }
];

// Beach Strip
export const BEACH_ZONE = {
  x1: 6620,
  y1: 0,
  x2: 6950,
  y2: 8000
};

// Boardwalk Promenade
export const BOARDWALK = {
  x1: 6560,
  y1: 400,
  x2: 6640,
  y2: 6000
};

// Marina Docks & Piers
export const MARINA_PIERS = [
  { id: 'pier_1', x: 5750, y: 6100, w: 550, h: 22 },
  { id: 'pier_2', x: 5750, y: 6300, w: 580, h: 22 },
  { id: 'pier_3', x: 5750, y: 6500, w: 560, h: 22 },
  { id: 'pier_4', x: 5750, y: 6700, w: 520, h: 22 },
  { id: 'pier_vert', x: 5740, y: 6050, w: 26, h: 720 }
];

// Generator for Canonical Buildings with Diverse Shapes & Rooftops
function generateBuildings() {
  const buildings = [];
  let bId = 1;

  // 1. DOWNTOWN FINANCIAL TOWERS (3600-5600, 3000-5200)
  const dtColors = [
    '#2b2d42', '#3a0ca3', '#4361ee', '#1e293b', '#0f172a',
    '#ff6ac1', '#00f0ff', '#334155', '#475569', '#1e1b4b'
  ];
  const dtBlocks = [
    // Block 1 (NW Downtown)
    { bx: 3650, by: 3100, bw: 300, bh: 220, type: 'tower', style: 'glass', name: 'Vice Corporate Tower', helipad: true },
    { bx: 3650, by: 3380, bw: 280, bh: 180, type: 'highrise', style: 'neon', name: 'Soliel Bank Plaza' },
    // Block 2 (N Central Downtown)
    { bx: 4100, by: 3080, bw: 420, bh: 200, type: 'complex', style: 'artdeco', name: 'Palmetto Trade Center' },
    { bx: 4100, by: 3340, bw: 400, bh: 220, type: 'tower', style: 'glass', name: 'Nexus Telecom Spire', helipad: true },
    // Block 3 (NE Downtown)
    { bx: 4700, by: 3100, bw: 340, bh: 240, type: 'tower', style: 'glass', name: 'Oceanic Insurance Tower' },
    { bx: 5120, by: 3100, bw: 420, bh: 220, type: 'highrise', style: 'modern', name: 'Grand Hyatt Bayview' },
    { bx: 4720, by: 3400, bw: 360, bh: 170, type: 'office', style: 'neon', name: 'Synthwave Media HQ' },
    { bx: 5140, by: 3380, bw: 400, bh: 190, type: 'hotel', style: 'artdeco', name: 'The Flamingo Luxury Hotel', pool: true },

    // Block 4 (Mid-West Downtown)
    { bx: 3650, by: 3700, bw: 290, bh: 220, type: 'highrise', style: 'modern', name: 'Centrum Tower' },
    { bx: 3650, by: 3980, bw: 290, bh: 180, type: 'office', style: 'glass', name: 'Sunbelt Securities' },
    // Block 5 (Central Financial Core & Fountain Plaza)
    { bx: 4100, by: 3700, bw: 380, bh: 240, type: 'skyscraper', style: 'glass', name: 'Palmetto One World Tower', helipad: true },
    { bx: 4100, by: 4000, bw: 380, bh: 170, type: 'plaza_bldg', style: 'marble', name: 'Municipal Financial Court' },
    // Block 6 (Mid-East Downtown)
    { bx: 4700, by: 3700, bw: 340, bh: 220, type: 'tower', style: 'glass', name: 'Gold Coast Trust' },
    { bx: 5120, by: 3700, bw: 420, bh: 220, type: 'highrise', style: 'artdeco', name: 'Sunset Miramar Suites' },
    { bx: 4720, by: 3980, bw: 360, bh: 190, type: 'office', style: 'neon', name: 'Vortex Capital' },
    { bx: 5140, by: 3980, bw: 400, bh: 190, type: 'department', style: 'modern', name: 'Saks 5th Bayview' },

    // Block 7 (SW Downtown)
    { bx: 3650, by: 4300, bw: 300, bh: 200, type: 'highrise', style: 'modern', name: 'Pacific Federal' },
    { bx: 3650, by: 4560, bw: 300, bh: 200, type: 'office', style: 'glass', name: 'Matrix Software Labs' },
    // Block 8 (S Central Downtown)
    { bx: 4100, by: 4300, bw: 420, bh: 210, type: 'highrise', style: 'glass', name: 'Bay Financial Center' },
    { bx: 4100, by: 4570, bw: 420, bh: 190, type: 'tower', style: 'neon', name: 'Cyberdyne Data Center' },
    // Block 9 (SE Downtown / Marina edge)
    { bx: 4700, by: 4300, bw: 350, bh: 200, type: 'hotel', style: 'artdeco', name: 'The Atlantis Casino & Hotel', pool: true },
    { bx: 5120, by: 4300, bw: 420, bh: 210, type: 'luxury_residence', style: 'modern', name: 'Mirage Luxury Condos' },
    { bx: 4720, by: 4560, bw: 350, bh: 200, type: 'highrise', style: 'glass', name: 'Starlight Tower' },
    { bx: 5140, by: 4560, bw: 400, bh: 200, type: 'convention', style: 'modern', name: 'Palmetto Convention Pavilion' },

    // Block 10 (South Downtown Boundary 4900-5300)
    { bx: 3650, by: 4900, bw: 300, bh: 220, type: 'office', style: 'brick', name: 'Old Customs House' },
    { bx: 4100, by: 4900, bw: 420, bh: 220, type: 'commercial', style: 'modern', name: 'Metro Center Plaza' },
    { bx: 4700, by: 4900, bw: 350, bh: 220, type: 'tower', style: 'glass', name: 'Bayside Tower' },
    { bx: 5120, by: 4900, bw: 420, bh: 220, type: 'hotel', style: 'artdeco', name: 'Ritz Palmetto', pool: true }
  ];

  dtBlocks.forEach(b => {
    buildings.push({
      id: `bld_${bId++}`,
      district: 'downtown',
      name: b.name,
      x: b.bx,
      y: b.by,
      w: b.bw,
      h: b.bh,
      color: dtColors[bId % dtColors.length],
      roofColor: '#1e2029',
      style: b.style,
      helipad: !!b.helipad,
      pool: !!b.pool,
      height: 120 + (bId % 8) * 25
    });
  });

  // 2. OCEAN STRIP RESORTS & ART-DECO HOTELS (6100-6550, 600-5400)
  const stripColors = ['#ff8fa3', '#ffc2d1', '#70d6ff', '#e0aaff', '#c77dff', '#ffb703', '#90e0ef'];
  for (let y = 600; y <= 5200; y += 380) {
    // Front Ocean row
    buildings.push({
      id: `bld_${bId++}`,
      district: 'ocean_strip',
      name: `Oceanview Resort #${Math.floor(y / 100)}`,
      x: 6150,
      y: y,
      w: 360,
      h: 260,
      color: stripColors[(bId) % stripColors.length],
      roofColor: '#f8edeb',
      style: 'artdeco_hotel',
      pool: true,
      height: 80 + (bId % 4) * 20
    });
  }

  // 3. SUNSET MARINA BUILDINGS (5300-5650, 5800-7200)
  buildings.push(
    { id: `bld_${bId++}`, district: 'sunset_marina', name: 'Sunset Yacht Club Clubhouse', x: 5350, y: 6050, w: 320, h: 220, color: '#f4a261', roofColor: '#e76f51', style: 'clubhouse', height: 40 },
    { id: `bld_${bId++}`, district: 'sunset_marina', name: 'Blue Pelican Seafood Grill', x: 5350, y: 6350, w: 300, h: 180, color: '#2a9d8f', roofColor: '#264653', style: 'restaurant', height: 35 },
    { id: `bld_${bId++}`, district: 'sunset_marina', name: 'Harbor Master Command Office', x: 5350, y: 6600, w: 260, h: 180, color: '#e9ecef', roofColor: '#495057', style: 'command', height: 50 },
    { id: `bld_${bId++}`, district: 'sunset_marina', name: 'Marina Dry Dock Storage', x: 5350, y: 6860, w: 340, h: 260, color: '#6c757d', roofColor: '#343a40', style: 'warehouse', height: 45 }
  );

  // 4. PALM HEIGHTS LUXURY VILLAS & ESTATES (3900-5800, 700-2600)
  const villaColors = ['#fde2e4', '#dfe7fd', '#cddafd', '#e2ece9', '#ffeedb', '#e8dff5'];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const vx = 3950 + c * 480;
      const vy = 750 + r * 460;
      if (vy > 1050 && vy < 1350) continue; // Skip expressway
      buildings.push({
        id: `bld_${bId++}`,
        district: 'palm_heights',
        name: `Heights Villa #${bId}`,
        x: vx,
        y: vy,
        w: 260,
        h: 220,
        color: villaColors[(r + c) % villaColors.length],
        roofColor: '#b08968',
        style: 'villa',
        pool: true,
        tennis: (r + c) % 3 === 0,
        height: 35
      });
    }
  }

  // 5. CIVIC COMMERCIAL & DINERS (2350-3300, 3100-5100)
  const commColors = ['#ff9e00', '#ff5400', '#9e0059', '#390099', '#058c42', '#0077b6'];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      const cx = 2360 + c * 340;
      const cy = 3150 + r * 500;
      if (cy > 4050 && cy < 4350) continue; // Skip main road
      const isGasStation = (r === 1 && c === 0);
      buildings.push({
        id: `bld_${bId++}`,
        district: 'civic_center',
        name: isGasStation ? 'Palmetto Sunoco Gas Station' : `Commercial Plaza #${bId}`,
        x: cx,
        y: cy,
        w: isGasStation ? 280 : 250,
        h: isGasStation ? 200 : 260,
        color: isGasStation ? '#e63946' : commColors[(r * 3 + c) % commColors.length],
        roofColor: isGasStation ? '#1d3557' : '#334155',
        style: isGasStation ? 'gas_station' : 'storefront',
        height: isGasStation ? 28 : 55
      });
    }
  }

  // 6. WEST LITTLE HAVANA RESIDENTIAL (550-1950, 3100-5100)
  const havanaColors = ['#e76f51', '#f4a261', '#e9c46a', '#2a9d8f', '#264653', '#d90429', '#ff758f'];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 4; c++) {
      const hx = 550 + c * 380;
      const hy = 3150 + r * 390;
      if (hy > 4050 && hy < 4350) continue; // Skip main road
      buildings.push({
        id: `bld_${bId++}`,
        district: 'little_havana',
        name: `Casa del Sol #${bId}`,
        x: hx,
        y: hy,
        w: 220,
        h: 180,
        color: havanaColors[(r * 4 + c) % havanaColors.length],
        roofColor: '#9c6644', // Terracotta tile roof
        style: 'residential_havana',
        height: 32
      });
    }
  }

  // 7. PORT PALMETTO INDUSTRIAL WAREHOUSES & OIL TANKS (550-2200, 5550-7600)
  const portColors = ['#495057', '#6c757d', '#343a40', '#adb5bd', '#5c677d'];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const px = 550 + c * 440;
      const py = 5600 + r * 480;
      const isTank = (r === 3 && c >= 2);
      buildings.push({
        id: `bld_${bId++}`,
        district: 'port_industrial',
        name: isTank ? `Petro Palmetto Tank #${bId}` : `Cargo Warehouse #${bId}`,
        x: px,
        y: py,
        w: isTank ? 180 : 320,
        h: isTank ? 180 : 260,
        color: isTank ? '#ced4da' : portColors[(r * 4 + c) % portColors.length],
        roofColor: isTank ? '#e9ecef' : '#212529',
        style: isTank ? 'oil_tank' : 'industrial_warehouse',
        height: isTank ? 40 : 45
      });
    }
  }

  // 8. PALMETTO AIRPORT HANGARS & PASSENGER TERMINAL (700-3300, 600-2600)
  // Main Passenger Terminal Concourse
  buildings.push({
    id: `bld_${bId++}`,
    district: 'airport',
    name: 'Palmetto International Terminal 1',
    x: 1000,
    y: 750,
    w: 850,
    h: 300,
    color: '#0077b6',
    roofColor: '#caf0f8',
    style: 'airport_terminal',
    height: 60
  });
  // Air Traffic Control Tower
  buildings.push({
    id: `bld_${bId++}`,
    district: 'airport',
    name: 'Air Traffic Control Tower',
    x: 2000,
    y: 800,
    w: 120,
    h: 120,
    color: '#f8f9fa',
    roofColor: '#212529',
    style: 'control_tower',
    height: 140
  });
  // Aircraft Maintenance Hangars
  buildings.push(
    { id: `bld_${bId++}`, district: 'airport', name: 'Pan-Am Hangar Alpha', x: 2300, y: 750, w: 420, h: 280, color: '#495057', roofColor: '#6c757d', style: 'hangar', height: 50 },
    { id: `bld_${bId++}`, district: 'airport', name: 'Eastern Airlines Hangar Beta', x: 2850, y: 750, w: 420, h: 280, color: '#495057', roofColor: '#6c757d', style: 'hangar', height: 50 }
  );

  return buildings;
}

export const BUILDINGS = generateBuildings();

// Detailed Props & Scenery
// Palm trees, streetlights, parked vehicles, yachts, airplanes, beach umbrellas
function generateProps() {
  const props = [];
  let pId = 1;

  // 1. PALM TREES along Ocean Strip
  for (let y = 450; y <= 5800; y += 120) {
    props.push({ id: `p_${pId++}`, type: 'palm_tree', x: 6580, y: y, radius: 24 });
    props.push({ id: `p_${pId++}`, type: 'palm_tree', x: 6640, y: y + 60, radius: 24 });
    // Streetlights along Ocean Drive
    props.push({ id: `p_${pId++}`, type: 'streetlight', x: 6565, y: y + 80 });
  }

  // 2. BEACH UMBRELLAS & LIFEGUARD TOWERS
  for (let y = 600; y <= 5400; y += 360) {
    props.push({ id: `p_${pId++}`, type: 'lifeguard_tower', x: 6850, y: y });
    props.push({ id: `p_${pId++}`, type: 'beach_umbrella', x: 6780, y: y - 80, color: '#ff2a85' });
    props.push({ id: `p_${pId++}`, type: 'beach_umbrella', x: 6800, y: y + 90, color: '#00f0ff' });
    props.push({ id: `p_${pId++}`, type: 'volleyball_net', x: 6730, y: y + 160 });
  }

  // 3. SUNSET MARINA YACHTS & MOTORBOATS
  const boatColors = ['#ffffff', '#00f0ff', '#ffbe0b', '#fb5607', '#ff006e', '#8338ec'];
  for (let pierIdx = 0; pierIdx < 4; pierIdx++) {
    const py = 6100 + pierIdx * 200;
    for (let bx = 5820; bx <= 6250; bx += 100) {
      props.push({
        id: `p_${pId++}`,
        type: 'yacht',
        x: bx,
        y: py - 35,
        w: 68,
        h: 24,
        angle: 0,
        color: boatColors[(bx + pierIdx) % boatColors.length]
      });
      props.push({
        id: `p_${pId++}`,
        type: 'yacht',
        x: bx,
        y: py + 35,
        w: 68,
        h: 24,
        angle: 0,
        color: boatColors[(bx * 3 + pierIdx) % boatColors.length]
      });
    }
  }

  // 4. GREENFIELD PARK TREES, BENCHES & FOUNTAIN
  for (let y = 5300; y <= 7500; y += 180) {
    for (let x = 2500; x <= 5100; x += 220) {
      // Avoid lake
      if (x > 3200 && x < 4250 && y > 5800 && y < 6700) continue;
      // Avoid roads
      if (Math.abs(x - 3400) < 60 || Math.abs(x - 4600) < 50 || Math.abs(y - 5400) < 60 || Math.abs(y - 6800) < 50) continue;
      props.push({ id: `p_${pId++}`, type: 'park_tree', x: x + (pId % 40) - 20, y: y + (pId % 30) - 15, radius: 30 });
    }
  }

  // 5. AIRPORT PARKED AIRLINERS
  const planeLocations = [
    { x: 1300, y: 1100, angle: 90 },
    { x: 1650, y: 1100, angle: 90 },
    { x: 2000, y: 1100, angle: 90 },
    { x: 2350, y: 1100, angle: 90 }
  ];
  planeLocations.forEach(loc => {
    props.push({ id: `p_${pId++}`, type: 'airliner', x: loc.x, y: loc.y, angle: loc.angle });
  });

  // 6. STREET LIGHTS & TRAFFIC LIGHTS at Intersections
  const intersections = [
    { x: 3400, y: 3000 }, { x: 4600, y: 3000 }, { x: 5600, y: 3000 }, { x: 6600, y: 3000 },
    { x: 3400, y: 4200 }, { x: 4600, y: 4200 }, { x: 5600, y: 4200 }, { x: 6600, y: 4200 },
    { x: 2200, y: 3000 }, { x: 2200, y: 4200 }, { x: 1200, y: 3000 }, { x: 1200, y: 4200 },
    { x: 3400, y: 5400 }, { x: 4600, y: 5400 }, { x: 5600, y: 5400 }, { x: 6600, y: 5400 }
  ];
  intersections.forEach(ix => {
    props.push({ id: `p_${pId++}`, type: 'traffic_light', x: ix.x - 30, y: ix.y - 30 });
    props.push({ id: `p_${pId++}`, type: 'traffic_light', x: ix.x + 30, y: ix.y + 30 });
  });

  // 7. PARKED CARS in Downtown, Ocean Strip & Suburbs
  const parkedLocations = [
    { x: 6580, y: 1200, type: 'sports', angle: 0 },
    { x: 6580, y: 1400, type: 'convertible', angle: 0 },
    { x: 6580, y: 1600, type: 'sedan', angle: 0 },
    { x: 6580, y: 1800, type: 'taxi', angle: 0 },
    { x: 6580, y: 2200, type: 'muscle', angle: 0 },
    { x: 6580, y: 2400, type: 'sports', angle: 0 },
    { x: 6580, y: 2800, type: 'convertible', angle: 0 },
    { x: 6580, y: 3200, type: 'muscle', angle: 0 },
    { x: 6580, y: 3600, type: 'sedan', angle: 0 },
    { x: 4520, y: 3200, type: 'sports', angle: 90 },
    { x: 4520, y: 3400, type: 'muscle', angle: 90 },
    { x: 4520, y: 3800, type: 'taxi', angle: 90 },
    { x: 4520, y: 4400, type: 'sedan', angle: 90 },
    { x: 5520, y: 3300, type: 'convertible', angle: 90 },
    { x: 5520, y: 3700, type: 'sports', angle: 90 },
    { x: 5520, y: 4100, type: 'muscle', angle: 90 },
    // Gas station cars
    { x: 2450, y: 3720, type: 'sedan', angle: 0 },
    { x: 2550, y: 3720, type: 'taxi', angle: 0 },
    // Industrial trucks
    { x: 700, y: 6500, type: 'truck', angle: 0 },
    { x: 900, y: 6500, type: 'truck', angle: 0 },
    { x: 1300, y: 6500, type: 'truck', angle: 90 }
  ];
  parkedLocations.forEach(loc => {
    props.push({
      id: `p_${pId++}`,
      type: 'parked_car',
      vehicleType: loc.type,
      x: loc.x,
      y: loc.y,
      angle: loc.angle
    });
  });

  return props;
}

export const PROPS = generateProps();
