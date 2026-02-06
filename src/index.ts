/**
 * ============================================================================
 * thestatic.tv DCL SDK - PRO Tier Template
 * ============================================================================
 *
 * This is the PRO tier template with ALL SDK features:
 * - Video screen with automatic fallback video
 * - Guide UI for browsing channels
 * - Chat UI for real-time messaging
 * - Admin Panel for video/mod controls (PRO EXCLUSIVE)
 * - Visitor tracking and analytics
 *
 * SDK TIERS:
 * - FREE ($0):      Session tracking only
 * - STANDARD ($10): Video + Guide + Chat
 * - PRO ($15):      + Admin Panel - THIS TEMPLATE
 *
 * QUICK START:
 * 1. Get your PRO API key at https://thestatic.tv
 * 2. Replace 'dcls_YOUR_API_KEY_HERE' below with your key
 * 3. npm install
 * 4. npm start
 *
 * NOTE: PRO tier requires a purchased API key to use SDK features.
 * Demo keys are only available for FREE and STANDARD tiers.
 *
 * VIDEO SCREEN SETUP (IMPORTANT):
 * The SDK manages VideoPlayer, but YOU must set up the video texture material.
 * See the main() function for how this works - material MUST be applied
 * AFTER SDK initialization, not at module level.
 *
 * ============================================================================
 */
import {
  engine,
  Transform,
  MeshRenderer,
  MeshCollider,
  Material,
  TextShape,
  Entity,
  pointerEventsSystem,
  InputAction,
  VideoPlayer,
  Billboard,
  BillboardMode
} from '@dcl/sdk/ecs'
import { Color4, Vector3, Quaternion } from '@dcl/sdk/math'
import ReactEcs, { ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { openExternalUrl } from '~system/RestrictedActions'
import { StaticTVClient, GuideVideo } from '@thestatic-tv/dcl-sdk'

// Key helper - DELETE DELETE_THIS_DEMO.ts when using your own key
import { getDemoKey } from './DELETE_THIS_DEMO'

// ============================================
// LINKS
// ============================================
const LINKS = {
  site: 'https://thestatic.tv',
  getKey: 'https://thestatic.tv/admin/login',
  github: 'https://github.com/thestatic-tv/thestatic-dcl-pro'
}

// ============================================
// CONFIGURATION - PRO KEY REQUIRED
// ============================================
// Get your PRO key at: https://thestatic.tv
// Replace the placeholder below with your actual key
const API_KEY = getDemoKey('dcls_YOUR_API_KEY_HERE')

// ============================================================================
// VIDEO SCREEN SETUP
// ============================================================================
//
// HOW VIDEO SCREENS WORK WITH THE SDK:
//
// 1. YOU create the screen entity (position, scale, mesh - your choice!)
// 2. YOU pass it to SDK via: videoScreen: yourEntity
// 3. SDK creates VideoPlayer and handles: fallback video, stream verification,
//    CONNECTING/OFFLINE states, and video switching from Guide
// 4. YOU apply the video texture material in main() AFTER SDK init
//
// WHY? The SDK only manages VideoPlayer. You control the material appearance
// (emissive glow, roughness, etc). This lets you customize how your screen looks.
//
// ============================================================================

// Create video screen entity (positioned later in scene setup section below)
const videoScreen = engine.addEntity()
const videoScreenFrame = engine.addEntity()
const videoScreenLabel = engine.addEntity()

/**
 * Handle video selection from Guide UI
 *
 * IMPORTANT: The SDK handles video playback automatically!
 * This callback is ONLY for your custom scene logic like:
 * - Updating labels/text
 * - Starting heartbeat tracking
 * - Any other scene-specific behavior
 *
 * DO NOT call VideoPlayer.createOrReplace here - SDK does that for you.
 */
function handleVideoSelect(video: GuideVideo) {
  // Update the label to show current video name
  TextShape.getMutable(videoScreenLabel).text = video.name

  // Tell the guide which video is playing (shows "PLAYING" indicator)
  if (staticTV.guideUI) {
    staticTV.guideUI.currentVideoId = video.id
  }

  // Start heartbeat tracking if available (tracks watch time)
  if (staticTV.heartbeat && video.channelId) {
    staticTV.heartbeat.startWatching(video.channelId)
  }
}

// SDK client - initialized in main()
let staticTV: StaticTVClient

// =============================================================================
// VIDEO PLAYBACK - You control the VideoPlayer
// =============================================================================
function playVideoOnScreen(url: string) {
  VideoPlayer.createOrReplace(videoScreen, {
    src: url,
    playing: true,
    loop: false,
    volume: 0.8
  })
  Material.setPbrMaterial(videoScreen, {
    texture: Material.Texture.Video({ videoPlayerEntity: videoScreen }),
    roughness: 1.0,
    metallic: 0,
    emissiveColor: Color4.White(),
    emissiveIntensity: 0.5,
    emissiveTexture: Material.Texture.Video({ videoPlayerEntity: videoScreen })
  })
}

function stopVideoOnScreen() {
  VideoPlayer.createOrReplace(videoScreen, {
    src: 'https://media.thestatic.tv/fallback-loop.mp4',
    playing: true,
    loop: true,
    volume: 0.5
  })
  Material.setPbrMaterial(videoScreen, {
    texture: Material.Texture.Video({ videoPlayerEntity: videoScreen }),
    roughness: 1.0,
    metallic: 0,
    emissiveColor: Color4.White(),
    emissiveIntensity: 0.5,
    emissiveTexture: Material.Texture.Video({ videoPlayerEntity: videoScreen })
  })
}

// Initialize UI modules when available (Standard/Pro tiers)
// Polls for features since they're enabled async after session starts
async function initializeUI() {
  // Wait up to 10 seconds for features to be enabled
  // isFree returns true until server confirms tier
  let attempts = 0
  while (staticTV.isFree && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 500))
    attempts++
  }

  if (staticTV.guideUI) await staticTV.guideUI.init()
  if (staticTV.chatUI) await staticTV.chatUI.init()

  // Update UI elements now that we know the actual SDK tier
  if (!staticTV.isFree) {
    updateUIForPaidMode()
  }
}

// Update UI elements to reflect Standard/Pro mode
function updateUIForPaidMode() {
  // Update subtitle text
  const mutableSubtitle = TextShape.getMutable(subtitleText)
  mutableSubtitle.text = 'STANDARD - Guide & Chat Available'

  // Update info panel
  const mutableInfoTitle = TextShape.getMutable(infoTitle)
  mutableInfoTitle.text = 'STANDARD FEATURES'

  const mutableInfoContent = TextShape.getMutable(infoContent)
  mutableInfoContent.text = 'Channel Guide UI - Browse streams\nReal-time Chat - Talk to viewers\nWatch Metrics - Track engagement\nClick GUIDE or CHAT to try!'
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================
export function main() {
  // Start with fallback video
  stopVideoOnScreen()

  // Initialize SDK - callbacks give YOU control of video playback
  staticTV = new StaticTVClient({
    apiKey: API_KEY,
    onVideoPlay: (url) => playVideoOnScreen(url),
    onVideoStop: () => stopVideoOnScreen(),
    guideUI: { onVideoSelect: handleVideoSelect },
    chatUI: { position: 'right' }
  })

  // Initialize UI modules (Guide, Chat, Admin Panel)
  initializeUI()
}

// ============================================================================
// UI RENDERING (Required for Guide/Chat/Admin panels to appear!)
// ============================================================================
//
// This MUST be outside main() - it's a DCL requirement.
// The SDK provides UI components, but you must render them.
//
// Guide UI: Channel browser - click videos to play on your screen
// Chat UI: Real-time chat with other viewers
// Admin Panel: (PRO TIER) Video/mod controls - included in this template
//
// ============================================================================
ReactEcsRenderer.setUiRenderer(() => {
  if (!staticTV) return null
  return ReactEcs.createElement(UiEntity, {
    uiTransform: { width: '100%', height: '100%', positionType: 'absolute' },
    children: [
      staticTV.guideUI?.getComponent(),    // Channel browser panel
      staticTV.chatUI?.getComponent(),     // Chat panel
      staticTV.adminPanel?.getComponent()  // Admin Panel (PRO tier)
    ].filter(Boolean)
  })
})

// ============================================
// COLORS - thestatic.tv brand palette
// ============================================
const COLORS = {
  cyan: Color4.create(0, 0.9, 0.9, 1),
  cyanGlow: Color4.create(0, 0.4, 0.4, 1),
  darkPanel: Color4.create(0.08, 0.08, 0.1, 1),
  floor: Color4.create(0.05, 0.05, 0.08, 1),
  green: Color4.create(0, 1, 0.5, 1),
  greenGlow: Color4.create(0, 0.5, 0.25, 1),
  red: Color4.create(1, 0.2, 0.2, 1),
  redGlow: Color4.create(0.5, 0.1, 0.1, 1),
  yellow: Color4.create(1, 0.85, 0, 1),
  yellowGlow: Color4.create(0.5, 0.42, 0, 1),
  magenta: Color4.create(1, 0, 0.8, 1),
  magentaGlow: Color4.create(0.5, 0, 0.4, 1),
  white: Color4.create(1, 1, 1, 1)
}

// ============================================
// SCENE SETUP
// ============================================

// Main floor collider (invisible, for walking)
const floorCollider = engine.addEntity()
Transform.create(floorCollider, {
  position: Vector3.create(8, -0.1, 8),
  scale: Vector3.create(16, 0.2, 16)
})
MeshCollider.setBox(floorCollider)

// Visible floor (with collider)
const floor = engine.addEntity()
Transform.create(floor, {
  position: Vector3.create(8, 0, 8),
  scale: Vector3.create(16, 0.1, 16)
})
MeshRenderer.setBox(floor)
MeshCollider.setBox(floor)
Material.setPbrMaterial(floor, { albedoColor: COLORS.floor })

// Grid of dark tiles
const TILE_SIZE = 1.9
const GAP = 0.1
const GRID_START = 1
const GRID_COUNT = 7

for (let row = 0; row < GRID_COUNT; row++) {
  for (let col = 0; col < GRID_COUNT; col++) {
    const tile = engine.addEntity()
    const x = GRID_START + col * (TILE_SIZE + GAP) + TILE_SIZE / 2
    const z = GRID_START + row * (TILE_SIZE + GAP) + TILE_SIZE / 2

    Transform.create(tile, {
      position: Vector3.create(x, 0.05, z),
      scale: Vector3.create(TILE_SIZE, 0.1, TILE_SIZE)
    })
    MeshRenderer.setBox(tile)
    Material.setPbrMaterial(tile, {
      albedoColor: COLORS.darkPanel,
      metallic: 0.8,
      roughness: 0.2
    })
  }
}

// Glowing grid lines (horizontal)
const LINE_HEIGHT = 0.08
for (let i = 0; i <= GRID_COUNT; i++) {
  const lineZ = GRID_START + i * (TILE_SIZE + GAP) - GAP / 2
  const hLine = engine.addEntity()
  Transform.create(hLine, {
    position: Vector3.create(8, LINE_HEIGHT / 2, lineZ),
    scale: Vector3.create(14, LINE_HEIGHT, GAP)
  })
  MeshRenderer.setBox(hLine)
  Material.setPbrMaterial(hLine, {
    albedoColor: COLORS.cyan,
    emissiveColor: COLORS.cyan,
    emissiveIntensity: 3
  })
}

// Glowing grid lines (vertical)
for (let i = 0; i <= GRID_COUNT; i++) {
  const lineX = GRID_START + i * (TILE_SIZE + GAP) - GAP / 2
  const vLine = engine.addEntity()
  Transform.create(vLine, {
    position: Vector3.create(lineX, LINE_HEIGHT / 2, 8),
    scale: Vector3.create(GAP, LINE_HEIGHT, 14)
  })
  MeshRenderer.setBox(vLine)
  Material.setPbrMaterial(vLine, {
    albedoColor: COLORS.cyan,
    emissiveColor: COLORS.cyan,
    emissiveIntensity: 3
  })
}

// Outer edge borders
const EDGE_WIDTH = 0.15
const EDGE_LENGTH = 15

// North edge
const edgeN = engine.addEntity()
Transform.create(edgeN, {
  position: Vector3.create(8, 0.06, 15),
  scale: Vector3.create(EDGE_LENGTH, 0.12, EDGE_WIDTH)
})
MeshRenderer.setBox(edgeN)
Material.setPbrMaterial(edgeN, {
  albedoColor: COLORS.cyan,
  emissiveColor: COLORS.cyan,
  emissiveIntensity: 4
})

// South edge
const edgeS = engine.addEntity()
Transform.create(edgeS, {
  position: Vector3.create(8, 0.06, 1),
  scale: Vector3.create(EDGE_LENGTH, 0.12, EDGE_WIDTH)
})
MeshRenderer.setBox(edgeS)
Material.setPbrMaterial(edgeS, {
  albedoColor: COLORS.cyan,
  emissiveColor: COLORS.cyan,
  emissiveIntensity: 4
})

// East edge
const edgeE = engine.addEntity()
Transform.create(edgeE, {
  position: Vector3.create(15, 0.06, 8),
  scale: Vector3.create(EDGE_WIDTH, 0.12, EDGE_LENGTH)
})
MeshRenderer.setBox(edgeE)
Material.setPbrMaterial(edgeE, {
  albedoColor: COLORS.cyan,
  emissiveColor: COLORS.cyan,
  emissiveIntensity: 4
})

// West edge
const edgeW = engine.addEntity()
Transform.create(edgeW, {
  position: Vector3.create(1, 0.06, 8),
  scale: Vector3.create(EDGE_WIDTH, 0.12, EDGE_LENGTH)
})
MeshRenderer.setBox(edgeW)
Material.setPbrMaterial(edgeW, {
  albedoColor: COLORS.cyan,
  emissiveColor: COLORS.cyan,
  emissiveIntensity: 4
})

// ============================================
// WELCOME SIGN
// ============================================

// Sign backdrop
const signBack = engine.addEntity()
Transform.create(signBack, {
  position: Vector3.create(8, 3.5, 1),
  scale: Vector3.create(8, 3, 0.15)
})
MeshRenderer.setBox(signBack)
MeshCollider.setBox(signBack)
Material.setPbrMaterial(signBack, {
  albedoColor: COLORS.darkPanel,
  metallic: 0.9,
  roughness: 0.1
})

// Sign border
const signFrame = engine.addEntity()
Transform.create(signFrame, {
  position: Vector3.create(8, 3.5, 0.9),
  scale: Vector3.create(8.2, 3.2, 0.05)
})
MeshRenderer.setBox(signFrame)
Material.setPbrMaterial(signFrame, {
  albedoColor: COLORS.cyan,
  emissiveColor: COLORS.cyanGlow,
  emissiveIntensity: 2
})

// Main title
const titleText = engine.addEntity()
Transform.create(titleText, {
  position: Vector3.create(8, 4.2, 1.2),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0)
})
TextShape.create(titleText, {
  text: 'thestatic.tv',
  fontSize: 5,
  textColor: COLORS.cyan,
  width: 10
})

// Subtitle
const subtitleText = engine.addEntity()
Transform.create(subtitleText, {
  position: Vector3.create(8, 3.2, 1.2),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0)
})
TextShape.create(subtitleText, {
  text: 'Visitor Tracking Active',
  fontSize: 2,
  textColor: COLORS.white,
  width: 10
})

// ============================================
// STATUS PANEL
// ============================================

// Status panel backdrop
const statusPanel = engine.addEntity()
Transform.create(statusPanel, {
  position: Vector3.create(8, 1.8, 1.5),
  scale: Vector3.create(4, 1.2, 0.1)
})
MeshRenderer.setBox(statusPanel)
MeshCollider.setBox(statusPanel)
Material.setPbrMaterial(statusPanel, {
  albedoColor: COLORS.darkPanel,
  metallic: 0.8,
  roughness: 0.2
})

// Status indicator orb
const statusOrb = engine.addEntity()
Transform.create(statusOrb, {
  position: Vector3.create(9.5, 2, 1.6),
  scale: Vector3.create(0.25, 0.25, 0.25)
})
MeshRenderer.setSphere(statusOrb)

// Status text
const statusText = engine.addEntity()
Transform.create(statusText, {
  position: Vector3.create(8.2, 2, 1.6),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0)
})
TextShape.create(statusText, {
  text: 'SESSION: CONNECTING...',
  fontSize: 1.5,
  textColor: COLORS.yellow,
  width: 6
})

// Session timer text
const timerText = engine.addEntity()
Transform.create(timerText, {
  position: Vector3.create(8.2, 1.5, 1.6),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0)
})
TextShape.create(timerText, {
  text: 'TIME: 00:00',
  fontSize: 1.2,
  textColor: COLORS.white,
  width: 6
})

// ============================================
// FLOATING CUBES - Animated decoration
// ============================================

interface FloatingCube {
  entity: Entity
  baseY: number
  offset: number
  speed: number
  rotSpeed: number
}

const floatingCubes: FloatingCube[] = []

const cubePositions = [
  { x: 3, z: 3 },
  { x: 13, z: 3 },
  { x: 3, z: 13 },
  { x: 13, z: 13 }
]

cubePositions.forEach((pos) => {
  const cube = engine.addEntity()
  const baseY = 2 + Math.random() * 2

  Transform.create(cube, {
    position: Vector3.create(pos.x, baseY, pos.z),
    scale: Vector3.create(0.4, 0.4, 0.4),
    rotation: Quaternion.fromEulerDegrees(45, 45, 0)
  })
  MeshRenderer.setBox(cube)
  Material.setPbrMaterial(cube, {
    albedoColor: COLORS.cyan,
    emissiveColor: COLORS.cyanGlow,
    emissiveIntensity: 1.5,
    metallic: 1,
    roughness: 0
  })

  floatingCubes.push({
    entity: cube,
    baseY,
    offset: Math.random() * Math.PI * 2,
    speed: 0.5 + Math.random() * 0.5,
    rotSpeed: 20 + Math.random() * 40
  })
})

// ============================================
// CORNER PILLARS
// ============================================

const pillarPositions = [
  { x: 1.5, z: 1.5 },
  { x: 14.5, z: 1.5 },
  { x: 1.5, z: 14.5 },
  { x: 14.5, z: 14.5 }
]

pillarPositions.forEach(pos => {
  const pillar = engine.addEntity()
  Transform.create(pillar, {
    position: Vector3.create(pos.x, 1.5, pos.z),
    scale: Vector3.create(0.3, 3, 0.3)
  })
  MeshRenderer.setBox(pillar)
  MeshCollider.setBox(pillar)
  Material.setPbrMaterial(pillar, {
    albedoColor: COLORS.darkPanel,
    metallic: 0.9,
    roughness: 0.1
  })

  const pillarLight = engine.addEntity()
  Transform.create(pillarLight, {
    position: Vector3.create(pos.x, 3.1, pos.z),
    scale: Vector3.create(0.35, 0.1, 0.35)
  })
  MeshRenderer.setBox(pillarLight)
  Material.setPbrMaterial(pillarLight, {
    albedoColor: COLORS.cyan,
    emissiveColor: COLORS.cyanGlow,
    emissiveIntensity: 4
  })
})

// ============================================
// FLOATING HOLOGRAM - Center piece
// ============================================

// Hologram text - billboards to always face player
const hologramText = engine.addEntity()
const hologramBaseY = 1.8
Transform.create(hologramText, {
  position: Vector3.create(8, hologramBaseY, 8)
})
TextShape.create(hologramText, {
  text: 'thestatic.tv',
  fontSize: 5,
  textColor: COLORS.cyan,
  width: 12
})
Billboard.create(hologramText, { billboardMode: BillboardMode.BM_Y })

// Glowing halo behind text
const textGlow = engine.addEntity()
Transform.create(textGlow, {
  position: Vector3.create(8, hologramBaseY, 8),
  scale: Vector3.create(3, 0.8, 0.05)
})
MeshRenderer.setBox(textGlow)
Material.setPbrMaterial(textGlow, {
  albedoColor: COLORS.cyanGlow,
  emissiveColor: COLORS.cyan,
  emissiveIntensity: 2,
  transparencyMode: 2
})
Billboard.create(textGlow, { billboardMode: BillboardMode.BM_Y })

// Sparkle particles orbiting text
interface Sparkle {
  entity: Entity
  angle: number
  radius: number
  speed: number
  yOffset: number
}

const sparkles: Sparkle[] = []
for (let i = 0; i < 6; i++) {
  const sparkle = engine.addEntity()
  const angle = (i / 6) * Math.PI * 2
  const radius = 1.2 + Math.random() * 0.3

  Transform.create(sparkle, {
    position: Vector3.create(8, hologramBaseY, 8),
    scale: Vector3.create(0.08, 0.08, 0.08)
  })
  MeshRenderer.setSphere(sparkle)
  Material.setPbrMaterial(sparkle, {
    albedoColor: i % 2 === 0 ? COLORS.cyan : COLORS.magenta,
    emissiveColor: i % 2 === 0 ? COLORS.cyan : COLORS.magenta,
    emissiveIntensity: 8
  })

  sparkles.push({
    entity: sparkle,
    angle,
    radius,
    speed: 0.8 + Math.random() * 0.4,
    yOffset: (Math.random() - 0.5) * 0.4
  })
}

// Invisible clickable area for entire hologram
const hologramClickArea = engine.addEntity()
Transform.create(hologramClickArea, {
  position: Vector3.create(8, 1.2, 8),
  scale: Vector3.create(2, 2, 2)
})
MeshCollider.setBox(hologramClickArea)
pointerEventsSystem.onPointerDown(
  { entity: hologramClickArea, opts: { button: InputAction.IA_POINTER, hoverText: 'Visit thestatic.tv' } },
  () => { openExternalUrl({ url: LINKS.site }) }
)

// Stack of animated discs - anti-gravity tail effect
interface HoloDisc {
  entity: Entity
  baseY: number
  index: number
}

const holoDiscs: HoloDisc[] = []
const discCount = 5
const discStartY = 1.3
const discSpacing = 0.25

for (let i = 0; i < discCount; i++) {
  const disc = engine.addEntity()
  const scale = 1.5 - (i * 0.25) // Gets smaller going down
  const y = discStartY - (i * discSpacing)
  const color = i % 2 === 0 ? COLORS.cyan : COLORS.magenta

  Transform.create(disc, {
    position: Vector3.create(8, y, 8),
    scale: Vector3.create(scale, 0.02, scale)
  })
  MeshRenderer.setCylinder(disc)
  Material.setPbrMaterial(disc, {
    albedoColor: color,
    emissiveColor: color,
    emissiveIntensity: 3
  })

  holoDiscs.push({ entity: disc, baseY: y, index: i })
}

// ============================================
// AMBIENT GLOW ORBS - Floating atmosphere
// ============================================

interface GlowOrb {
  entity: Entity
  baseY: number
  offset: number
  pulseSpeed: number
}

const glowOrbs: GlowOrb[] = []

// Different colors for variety
const orbConfigs = [
  { x: 5, y: 4, z: 5, color: COLORS.magenta, glow: COLORS.magentaGlow },
  { x: 11, y: 3.5, z: 11, color: COLORS.yellow, glow: COLORS.yellowGlow },
  { x: 4, y: 5, z: 12, color: COLORS.green, glow: COLORS.greenGlow }
]

orbConfigs.forEach((cfg, i) => {
  const orb = engine.addEntity()
  Transform.create(orb, {
    position: Vector3.create(cfg.x, cfg.y, cfg.z),
    scale: Vector3.create(0.15, 0.15, 0.15)
  })
  MeshRenderer.setSphere(orb)
  Material.setPbrMaterial(orb, {
    albedoColor: cfg.color,
    emissiveColor: cfg.color,
    emissiveIntensity: 5
  })

  glowOrbs.push({
    entity: orb,
    baseY: cfg.y,
    offset: i * 2,
    pulseSpeed: 1.5 + Math.random() * 0.5
  })
})

// ============================================
// INFO DISPLAY
// ============================================

// Info panel background
const infoPanelBack = engine.addEntity()
Transform.create(infoPanelBack, {
  position: Vector3.create(8, 2.5, 15),
  scale: Vector3.create(6, 4, 0.1)
})
MeshRenderer.setBox(infoPanelBack)
MeshCollider.setBox(infoPanelBack)
Material.setPbrMaterial(infoPanelBack, {
  albedoColor: COLORS.darkPanel,
  metallic: 0.8,
  roughness: 0.2
})

// Info panel frame
const infoPanelFrame = engine.addEntity()
Transform.create(infoPanelFrame, {
  position: Vector3.create(8, 2.5, 15.1),
  scale: Vector3.create(6.2, 4.2, 0.05)
})
MeshRenderer.setBox(infoPanelFrame)
Material.setPbrMaterial(infoPanelFrame, {
  albedoColor: COLORS.cyan,
  emissiveColor: COLORS.cyanGlow,
  emissiveIntensity: 2
})

// Info title
const infoTitle = engine.addEntity()
Transform.create(infoTitle, {
  position: Vector3.create(8, 4, 14.8),
  rotation: Quaternion.fromEulerDegrees(0, 0, 0)
})
TextShape.create(infoTitle, {
  text: 'KNOW YOUR AUDIENCE',
  fontSize: 2.5,
  textColor: COLORS.cyan,
  width: 20,
  height: 2
})

// Info content
const infoContent = engine.addEntity()
Transform.create(infoContent, {
  position: Vector3.create(8, 2.5, 14.8),
  rotation: Quaternion.fromEulerDegrees(0, 0, 0)
})
TextShape.create(infoContent, {
  text: 'See who visits your scene LIVE\nTrack new vs returning visitors\nMeasure engagement & dwell time\nAll data in your dashboard',
  fontSize: 1.6,
  textColor: COLORS.white,
  width: 20,
  height: 4
})

// Info footer
const infoFooter = engine.addEntity()
Transform.create(infoFooter, {
  position: Vector3.create(8, 1.2, 14.8),
  rotation: Quaternion.fromEulerDegrees(0, 0, 0)
})
TextShape.create(infoFooter, {
  text: 'Click buttons below to get started!',
  fontSize: 1.4,
  textColor: COLORS.white,
  width: 20,
  height: 2
})

// ============================================
// CLICKABLE LINK BUTTONS
// ============================================

// Dashboard button
const dashboardButton = engine.addEntity()
Transform.create(dashboardButton, {
  position: Vector3.create(6.5, 0.6, 14.85),
  scale: Vector3.create(2.5, 0.6, 0.1)
})
MeshRenderer.setBox(dashboardButton)
MeshCollider.setBox(dashboardButton)
Material.setPbrMaterial(dashboardButton, {
  albedoColor: COLORS.green,
  emissiveColor: COLORS.greenGlow,
  emissiveIntensity: 2
})

const dashboardButtonText = engine.addEntity()
Transform.create(dashboardButtonText, {
  position: Vector3.create(6.5, 0.6, 14.7),
  rotation: Quaternion.fromEulerDegrees(0, 0, 0)
})
TextShape.create(dashboardButtonText, {
  text: 'GET API KEY',
  fontSize: 1.5,
  textColor: COLORS.darkPanel,
  width: 10,
  height: 2
})

pointerEventsSystem.onPointerDown(
  { entity: dashboardButton, opts: { button: InputAction.IA_POINTER, hoverText: 'Get your API key' } },
  () => {
    openExternalUrl({ url: LINKS.getKey })
  }
)

// GitHub button
const githubButton = engine.addEntity()
Transform.create(githubButton, {
  position: Vector3.create(9.5, 0.6, 14.85),
  scale: Vector3.create(2.5, 0.6, 0.1)
})
MeshRenderer.setBox(githubButton)
MeshCollider.setBox(githubButton)
Material.setPbrMaterial(githubButton, {
  albedoColor: COLORS.cyan,
  emissiveColor: COLORS.cyanGlow,
  emissiveIntensity: 2
})

const githubButtonText = engine.addEntity()
Transform.create(githubButtonText, {
  position: Vector3.create(9.5, 0.6, 14.7),
  rotation: Quaternion.fromEulerDegrees(0, 0, 0)
})
TextShape.create(githubButtonText, {
  text: 'GET CODE',
  fontSize: 1.5,
  textColor: COLORS.darkPanel,
  width: 10,
  height: 2
})

pointerEventsSystem.onPointerDown(
  { entity: githubButton, opts: { button: InputAction.IA_POINTER, hoverText: 'View on GitHub' } },
  () => {
    openExternalUrl({ url: LINKS.github })
  }
)

// ============================================================================
// VIDEO SCREEN (Right side)
// ============================================================================
//
// YOUR VIDEO SCREEN SETUP - Customize position, size, and orientation!
//
// IMPORTANT: Notice we only set up Transform, MeshRenderer, and MeshCollider here.
// The Material with video texture is applied in main() AFTER SDK init.
// This is required because VideoPlayer must exist before we can reference it.
//
// TO USE YOUR OWN SCREEN:
// 1. Create entity: const myScreen = engine.addEntity()
// 2. Add Transform (position, scale, rotation - your choice)
// 3. Add MeshRenderer.setPlane() or MeshRenderer.setBox()
// 4. Pass to SDK: videoScreen: myScreen
// 5. Apply Material in main() after SDK init (see main() function above)
//
// ============================================================================

// Screen backdrop/frame (decorative, not required)
Transform.create(videoScreenFrame, {
  position: Vector3.create(14.95, 3, 8),
  scale: Vector3.create(0.15, 4.2, 7.5),
  rotation: Quaternion.fromEulerDegrees(0, 0, 0)
})
MeshRenderer.setBox(videoScreenFrame)
Material.setPbrMaterial(videoScreenFrame, {
  albedoColor: COLORS.cyan,
  emissiveColor: COLORS.cyanGlow,
  emissiveIntensity: 2
})

// *** THE VIDEO SCREEN ENTITY ***
// East wall facing west - same scale pattern as STANDARD, rotated 90 degrees
Transform.create(videoScreen, {
  position: Vector3.create(14.85, 3, 8),
  scale: Vector3.create(7.2, 4.05, 0.01),  // width, height, depth (same as STANDARD)
  rotation: Quaternion.fromEulerDegrees(0, 90, 0)  // rotate to face west
})
MeshRenderer.setBox(videoScreen)
MeshCollider.setBox(videoScreen)

// Video label background
const videoScreenLabelBg = engine.addEntity()
Transform.create(videoScreenLabelBg, {
  position: Vector3.create(14.85, 0.7, 8),
  scale: Vector3.create(0.1, 0.6, 4),
  rotation: Quaternion.fromEulerDegrees(0, 0, 0)
})
MeshRenderer.setBox(videoScreenLabelBg)
Material.setPbrMaterial(videoScreenLabelBg, {
  albedoColor: COLORS.darkPanel,
  metallic: 0.8,
  roughness: 0.2
})

// Video label
Transform.create(videoScreenLabel, {
  position: Vector3.create(14.75, 0.7, 8),
  rotation: Quaternion.fromEulerDegrees(0, 90, 0)
})
TextShape.create(videoScreenLabel, {
  text: 'Click GUIDE to browse channels',
  fontSize: 1.5,
  textColor: COLORS.cyan,
  width: 10,
  height: 2
})

// ============================================
// STATS PANEL (Left side)
// ============================================

// Stats panel background
const statsPanelBack = engine.addEntity()
Transform.create(statsPanelBack, {
  position: Vector3.create(1.1, 2.5, 8),
  scale: Vector3.create(0.1, 3, 4),
  rotation: Quaternion.fromEulerDegrees(0, 0, 0)
})
MeshRenderer.setBox(statsPanelBack)
MeshCollider.setBox(statsPanelBack)
Material.setPbrMaterial(statsPanelBack, {
  albedoColor: COLORS.darkPanel,
  metallic: 0.8,
  roughness: 0.2
})

// Stats panel frame
const statsPanelFrame = engine.addEntity()
Transform.create(statsPanelFrame, {
  position: Vector3.create(1.0, 2.5, 8),
  scale: Vector3.create(0.05, 3.2, 4.2),
  rotation: Quaternion.fromEulerDegrees(0, 0, 0)
})
MeshRenderer.setBox(statsPanelFrame)
Material.setPbrMaterial(statsPanelFrame, {
  albedoColor: COLORS.cyan,
  emissiveColor: COLORS.cyanGlow,
  emissiveIntensity: 2
})

// Stats title
const statsTitle = engine.addEntity()
Transform.create(statsTitle, {
  position: Vector3.create(1.3, 3.5, 8),
  rotation: Quaternion.fromEulerDegrees(0, 270, 0)
})
TextShape.create(statsTitle, {
  text: 'TODAY\'S STATS',
  fontSize: 2,
  textColor: COLORS.cyan,
  width: 20,
  height: 2
})

// Visitors count text
const visitorsText = engine.addEntity()
Transform.create(visitorsText, {
  position: Vector3.create(1.3, 2.8, 8),
  rotation: Quaternion.fromEulerDegrees(0, 270, 0)
})
TextShape.create(visitorsText, {
  text: 'Visitors: --',
  fontSize: 1.8,
  textColor: COLORS.white,
  width: 20,
  height: 2
})

// Sessions count text
const sessionsText = engine.addEntity()
Transform.create(sessionsText, {
  position: Vector3.create(1.3, 2.2, 8),
  rotation: Quaternion.fromEulerDegrees(0, 270, 0)
})
TextShape.create(sessionsText, {
  text: 'Sessions: --',
  fontSize: 1.8,
  textColor: COLORS.white,
  width: 20,
  height: 2
})

// Your visitor number text
const visitorNumText = engine.addEntity()
Transform.create(visitorNumText, {
  position: Vector3.create(1.3, 1.5, 8),
  rotation: Quaternion.fromEulerDegrees(0, 270, 0)
})
TextShape.create(visitorNumText, {
  text: 'You are visitor #--',
  fontSize: 1.5,
  textColor: COLORS.green,
  width: 20,
  height: 2
})

// ============================================
// ANIMATION SYSTEM
// ============================================

let time = 0
let sessionTime = 0
let lastTimerUpdate = 0
let lastStatsFetch = 0
let statsFetched = false

engine.addSystem((dt: number) => {
  time += dt

  // Track session time when active
  if (staticTV.session?.isSessionActive()) {
    sessionTime += dt
  }

  // Animate floating cubes
  floatingCubes.forEach(cube => {
    const transform = Transform.getMutable(cube.entity)

    // Float up and down
    transform.position.y = cube.baseY + Math.sin(time * cube.speed + cube.offset) * 0.5

    // Rotate
    const currentRot = Quaternion.toEulerAngles(transform.rotation)
    transform.rotation = Quaternion.fromEulerDegrees(
      currentRot.x,
      currentRot.y + dt * cube.rotSpeed,
      currentRot.z
    )
  })

  // Animate hologram - text follows disc motion but billboards
  const rotationSpeed = 20 // degrees per second
  const baseRotation = time * rotationSpeed

  // Text bobs with the top disc but billboards to face player
  const textWave = Math.sin(time * 2) * 0.15
  const holoTextTransform = Transform.getMutable(hologramText)
  holoTextTransform.position.y = hologramBaseY + textWave

  // Animate disc stack - wave/anti-gravity tail effect
  holoDiscs.forEach(disc => {
    const transform = Transform.getMutable(disc.entity)
    // Wave cascades down through discs
    const waveOffset = disc.index * 0.4
    const wave = Math.sin(time * 2 - waveOffset) * 0.15
    transform.position.y = disc.baseY + wave

    // All discs rotate together
    transform.rotation = Quaternion.fromEulerDegrees(0, baseRotation, 0)
  })

  // Animate sparkles - orbit around text
  sparkles.forEach(sparkle => {
    const transform = Transform.getMutable(sparkle.entity)
    sparkle.angle += dt * sparkle.speed
    transform.position.x = 8 + Math.cos(sparkle.angle) * sparkle.radius
    transform.position.z = 8 + Math.sin(sparkle.angle) * sparkle.radius
    transform.position.y = hologramBaseY + sparkle.yOffset + textWave
  })

  // Animate text glow - pulse intensity
  const glowTransform = Transform.getMutable(textGlow)
  glowTransform.position.y = hologramBaseY + textWave
  const glowPulse = 1 + Math.sin(time * 3) * 0.1
  glowTransform.scale.x = 3 * glowPulse
  glowTransform.scale.y = 0.8 * glowPulse

  // Animate glow orbs - gentle float and pulse
  glowOrbs.forEach(orb => {
    const transform = Transform.getMutable(orb.entity)
    transform.position.y = orb.baseY + Math.sin(time * orb.pulseSpeed + orb.offset) * 0.3

    // Pulse size
    const pulse = 0.12 + Math.sin(time * orb.pulseSpeed * 2 + orb.offset) * 0.05
    transform.scale = Vector3.create(pulse, pulse, pulse)
  })

  // Update status and timer (throttle to every 0.5 seconds)
  if (time - lastTimerUpdate > 0.5) {
    lastTimerUpdate = time
    updateStatus()
    updateTimer()
  }

  // Fetch stats once session is active, then every 30 seconds
  if (staticTV.session?.isSessionActive() && (time - lastStatsFetch > 30 || !statsFetched)) {
    lastStatsFetch = time
    statsFetched = true
    fetchAndDisplayStats()
  }
})

// ============================================
// STATUS UPDATE
// ============================================

function updateStatus() {
  const isActive = staticTV.session?.isSessionActive() ?? false

  // Update orb color
  Material.setPbrMaterial(statusOrb, {
    albedoColor: isActive ? COLORS.green : COLORS.red,
    emissiveColor: isActive ? COLORS.greenGlow : COLORS.redGlow,
    emissiveIntensity: 3
  })

  // Update status text
  const mutableText = TextShape.getMutable(statusText)
  mutableText.text = isActive ? 'SESSION: ACTIVE' : 'SESSION: INACTIVE'
  mutableText.textColor = isActive ? COLORS.green : COLORS.red
}

function updateTimer() {
  const minutes = Math.floor(sessionTime / 60)
  const seconds = Math.floor(sessionTime % 60)
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  const mutableTimer = TextShape.getMutable(timerText)
  mutableTimer.text = `TIME: ${timeStr}`
}

async function fetchAndDisplayStats() {
  if (!staticTV.session) return
  try {
    const stats = await staticTV.session.getStats()
    if (stats) {
      // Update visitors text
      const mutableVisitors = TextShape.getMutable(visitorsText)
      mutableVisitors.text = `Visitors: ${stats.uniqueVisitors}`

      // Update sessions text
      const mutableSessions = TextShape.getMutable(sessionsText)
      mutableSessions.text = `Sessions: ${stats.totalSessions}`

      // Update visitor number
      const mutableVisitorNum = TextShape.getMutable(visitorNumText)
      if (stats.visitorNumber) {
        mutableVisitorNum.text = `You are visitor #${stats.visitorNumber}`
        mutableVisitorNum.textColor = COLORS.green
      } else if (stats.isFirstVisitor) {
        mutableVisitorNum.text = 'You are the first visitor!'
        mutableVisitorNum.textColor = COLORS.cyan
      } else {
        mutableVisitorNum.text = 'Welcome!'
        mutableVisitorNum.textColor = COLORS.white
      }
    }
  } catch (error) {
    // Stats fetch failed silently
  }
}
