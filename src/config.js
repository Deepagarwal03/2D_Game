// Game Constants & Configuration for Palmetto Shores '86

export const CONFIG = {
  // World Dimensions
  WORLD_WIDTH: 8000,
  WORLD_HEIGHT: 8000,
  CHUNK_SIZE: 800, // 10x10 chunk grid
  CHUNKS_X: 10,
  CHUNKS_Y: 10,

  // Player Settings
  PLAYER: {
    WALK_SPEED: 140,
    SPRINT_SPEED: 250,
    ACCELERATION: 1200,
    DECELERATION: 1000,
    RADIUS: 16,
    COLOR_BODY: 0xff6ac1, // Neon Pink Blazer
    COLOR_SHIRT: 0x00f0ff, // Neon Cyan Shirt
    COLOR_HAIR: 0x221100,  // Dark Hair
    COLOR_SKIN: 0xffd1a4
  },

  // Camera Settings
  CAMERA: {
    DEFAULT_ZOOM: 1.1,
    DRIVING_ZOOM: 0.85,
    HIGH_SPEED_ZOOM: 0.72,
    LERP: 0.08
  },

  // Vehicle Types & Specs
  VEHICLE_TYPES: {
    SPORTS: {
      id: 'sports',
      name: "Cheetah '85",
      type: 'Supercar',
      width: 44,
      height: 92,
      maxSpeed: 580,
      acceleration: 480,
      braking: 600,
      reverseSpeed: 160,
      turnSpeed: 3.2,
      driftFriction: 0.94,
      mass: 1200,
      bodyColor: 0xee1133, // Ferrari / Vice Red
      roofColor: 0x111111,
      trimColor: 0xffffff,
      headlightColor: 0xfffae0,
      enginePitch: 1.3
    },
    MUSCLE: {
      id: 'muscle',
      name: "Thunderbolt 500",
      type: 'Muscle Car',
      width: 46,
      height: 96,
      maxSpeed: 520,
      acceleration: 440,
      braking: 520,
      reverseSpeed: 140,
      turnSpeed: 2.9,
      driftFriction: 0.91,
      mass: 1600,
      bodyColor: 0x1c3b8a, // Deep Blue with white stripes
      roofColor: 0x1c3b8a,
      trimColor: 0xffffff,
      headlightColor: 0xfff0aa,
      enginePitch: 0.95
    },
    TAXI: {
      id: 'taxi',
      name: "Metro Cab '84",
      type: 'Taxi Sedan',
      width: 46,
      height: 94,
      maxSpeed: 440,
      acceleration: 360,
      braking: 500,
      reverseSpeed: 130,
      turnSpeed: 2.7,
      driftFriction: 0.92,
      mass: 1500,
      bodyColor: 0xf5b700, // Yellow Cab
      roofColor: 0xf5b700,
      trimColor: 0x111111,
      headlightColor: 0xfff5cc,
      enginePitch: 1.05
    },
    SEDAN: {
      id: 'sedan',
      name: "Palmetto Cruiser",
      type: 'Executive Sedan',
      width: 46,
      height: 94,
      maxSpeed: 460,
      acceleration: 350,
      braking: 500,
      reverseSpeed: 130,
      turnSpeed: 2.7,
      driftFriction: 0.93,
      mass: 1550,
      bodyColor: 0x2ec4b6, // 80s Pastel Mint / Turquoise
      roofColor: 0x209489,
      trimColor: 0xffffff,
      headlightColor: 0xfffae0,
      enginePitch: 1.0
    },
    CONVERTIBLE: {
      id: 'convertible',
      name: "Breeze Spyder",
      type: 'Convertible',
      width: 44,
      height: 90,
      maxSpeed: 540,
      acceleration: 450,
      braking: 560,
      reverseSpeed: 150,
      turnSpeed: 3.1,
      driftFriction: 0.93,
      mass: 1250,
      bodyColor: 0xffffff, // Miami White
      roofColor: 0x992233, // Red Leather Interior
      trimColor: 0x222222,
      headlightColor: 0xfffae0,
      enginePitch: 1.2
    },
    TRUCK: {
      id: 'truck',
      name: "Harbor Hauler",
      type: 'Industrial Truck',
      width: 52,
      height: 114,
      maxSpeed: 340,
      acceleration: 220,
      braking: 420,
      reverseSpeed: 100,
      turnSpeed: 2.0,
      driftFriction: 0.96,
      mass: 3200,
      bodyColor: 0x4a5568, // Industrial Slate
      roofColor: 0x2d3748,
      trimColor: 0xe2e8f0,
      headlightColor: 0xffeebb,
      enginePitch: 0.75
    }
  },

  // Pedestrian & Traffic Pooling Limits
  LIMITS: {
    MAX_TRAFFIC: 28,
    MAX_PEDESTRIANS: 45,
    SPAWN_RADIUS: 1400,
    DESPAWN_RADIUS: 1800,
    MIN_SPAWN_RADIUS: 500
  },

  // Visual Colors for World Generation
  COLORS: {
    OCEAN: '#005f73',
    OCEAN_DEEP: '#0a3641',
    OCEAN_SHALLOW: '#0a9396',
    SHORE_FOAM: '#94d2bd',
    BEACH_SAND: '#e9d8a6',
    GRASS: '#386641',
    GRASS_PARK: '#2d6a4f',
    SIDEWALK: '#949594',
    ROAD_ASPHALT: '#2b2d42',
    ROAD_MARKING_YELLOW: '#ffb703',
    ROAD_MARKING_WHITE: '#edf2f4',
    HIGHWAY_ASPHALT: '#1e2029',
    RUNWAY_ASPHALT: '#1a1a24',
    DOCK_WOOD: '#7f5539'
  }
};
