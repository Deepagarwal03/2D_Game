Build a playable 2D open-world browser game prototype.

The purpose of this project is to test how capable you are at
building a detailed open-world game, so prioritize WORLD QUALITY,
MAP DESIGN, AND PLAYABILITY over adding lots of game mechanics.

GAME CONCEPT

Create an original fictional 1980s-inspired coastal American city.
Do NOT copy GTA Vice City's copyrighted map, characters, logos,
music, textures, dialogue, or other assets.

The game should feel like a detailed 2D open-world crime-game city.

CORE REQUIREMENT

The player must be able to freely explore a large continuous city.

There should be NO missions, story, weapons, economy, inventory,
or progression system in this version.

The entire purpose of Version 1 is:

1. Explore the city.
2. Drive around.
3. Walk around.
4. Examine the world.
5. View the minimap.
6. Test how detailed and believable the simulated city feels.

TECHNOLOGY

- Browser playable.
- HTML5.
- JavaScript or TypeScript.
- Phaser preferred.
- No backend.
- Use procedural/generated assets where necessary.
- The project must run locally with a simple development command.

WORLD

Create a large continuous 2D top-down city.

The city should contain distinct neighborhoods:

- Downtown
- Residential neighborhood
- Industrial district
- Beach/coast
- Marina
- Commercial district
- Suburbs
- Airport
- Highway
- Parks
- Small side streets
- Alleys
- Parking lots

Do not make the city a collection of disconnected screens.

The player should be able to travel continuously between districts.

CITY DETAIL

Make the city feel intentionally designed rather than randomly
generated.

Include:

- Major roads
- Minor roads
- Intersections
- Traffic lanes
- Sidewalks
- Crosswalks
- Parking spaces
- Buildings
- Shops
- Houses
- Office buildings
- Warehouses
- Gas stations
- Restaurants
- Parks
- Trees
- Street lights
- Traffic lights
- Signs
- Fences
- Walls
- Water
- Bridges
- Docks
- Beach
- Alleys

Buildings should have different shapes and sizes.

Avoid obvious repeated patterns.

WORLD SCALE

Make the world large enough that exploring it takes several minutes.

Do not create a tiny demonstration map.

Implement a camera that follows the player smoothly.

PLAYER

Implement:

- WASD movement
- Sprint
- Collision
- Smooth acceleration/deceleration
- Directional character animation
- Camera following
- World boundaries

VEHICLES

Implement several fictional civilian vehicles.

The player should be able to:

- Approach a vehicle
- Enter it
- Drive it
- Exit it

Driving should include:

- Acceleration
- Braking
- Steering
- Friction
- Collision
- Different vehicle speeds

NPCs

Add civilian pedestrians.

They should:

- Spawn around the city
- Walk along sidewalks
- Avoid obvious obstacles
- Wander between points
- Have slightly different movement speeds

TRAFFIC

Add civilian traffic.

Vehicles should:

- Follow roads
- Stop at intersections where appropriate
- Avoid obvious collisions
- Spawn/despawn intelligently
- Drive around the city

MINIMAP

This is one of the MOST IMPORTANT features.

Create a proper GTA-style minimap.

The minimap must represent the actual game world.

Do NOT create a fake decorative minimap.

The minimap should be generated from the same world/map data used
by the actual game.

Display:

- Roads
- Water
- Buildings
- Major landmarks
- Player position
- Player direction
- Nearby vehicles
- NPCs if performance allows

The minimap should rotate or otherwise clearly indicate the
player's direction.

Add a larger map view that can be opened with a key.

The larger map must also represent the actual game world.

MAP QUALITY

Design the world so that the minimap itself is interesting and
recognizable.

Major districts should have recognizable layouts.

Road networks should form believable connections.

Avoid creating a random maze.

PERFORMANCE

Target approximately 60 FPS on a normal modern laptop.

Use:

- Spatial partitioning where appropriate
- Object pooling where appropriate
- Efficient collision detection
- Entity activation/deactivation based on distance
- Camera culling
- Efficient rendering

Do not spawn thousands of active entities unnecessarily.

UI

Display:

- Minimap
- Current district name
- FPS/debug information toggle
- Vehicle indicator
- Basic controls

Do not add unnecessary HUD elements.

VISUAL STYLE

Use a polished 2D top-down aesthetic inspired by late-1980s
neon coastal cities.

Use original visual assets.

The city should have strong visual variety.

Make roads, buildings, parks, beaches and water visually distinct.

Avoid looking like a generic programming demo.

IMPORTANT DEVELOPMENT RULE

Do not stop after creating a basic prototype.

After implementing the game:

1. Run it.
2. Play it.
3. Explore the entire map.
4. Check collisions.
5. Check vehicles.
6. Check NPCs.
7. Check traffic.
8. Check minimap accuracy.
9. Check transitions between districts.
10. Check performance.
11. Fix obvious problems.
12. Repeat testing until the core experience is stable.

ACCEPTANCE CRITERIA

The prototype is complete only when:

- The browser launches the game.
- The player can freely explore a large city.
- The player can walk through multiple districts.
- The player can enter and drive vehicles.
- Vehicles collide correctly.
- NPCs populate the world.
- Traffic moves around the city.
- The minimap accurately represents the actual world.
- The player location on the minimap is accurate.
- The larger map corresponds to the real game world.
- The city does not feel like a tiny test arena.
- The game maintains reasonable performance.

Before finishing, test the game yourself and fix any issues you
encounter.