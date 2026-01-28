# TheStatic.tv Popup Showcase

An immersive popup scene showcasing the full capabilities of [@thestatic-tv/dcl-sdk](https://www.npmjs.com/package/@thestatic-tv/dcl-sdk) - streaming video, channel guide, and real-time chat in Decentraland.

## Overview

This is a production-ready popup scene designed to demonstrate TheStatic.tv platform at events, conferences, and high-traffic Decentraland locations. Unlike the starter example, this scene is fully styled and optimized for visitor engagement.

## Features

- **Large Format Video Screen** - 16:9 widescreen display
- **Channel Guide UI** - Browse live and scheduled content
- **Real-Time Chat** - Chat with other visitors watching the same content
- **Immersive Environment** - Custom lighting, materials, and atmosphere
- **Visitor Analytics** - Track engagement through your dashboard

## Quick Start

```bash
npm install
npm start
```

The scene works immediately for testing - no setup required!

## Configuration (Optional)

To use your own key:

1. Get a key at [thestatic.tv/dashboard](https://thestatic.tv/dashboard)
2. Open `src/index.ts`
3. Replace the API key in the configuration section

## Scene Layout

```
┌─────────────────────────────────────────┐
│                                         │
│         ┌─────────────────┐             │
│         │                 │             │
│         │   VIDEO SCREEN  │             │
│         │                 │             │
│         └─────────────────┘             │
│                                         │
│    [GUIDE]                    [CHAT]    │
│                                         │
│              SPAWN POINT                │
│                                         │
└─────────────────────────────────────────┘
```

## SDK Integration

This scene demonstrates the complete SDK integration:

### Initialization
```typescript
let staticTV: StaticTVClient

export function main() {
  staticTV = new StaticTVClient({
    apiKey: API_KEY,
    debug: false,
    guideUI: {
      onVideoSelect: handleVideoSelect,
      fontScale: 1.0
    },
    chatUI: {
      fontScale: 1.0
    }
  })
}
```

### Video Handling
```typescript
function handleVideoSelect(video: GuideVideo) {
  VideoPlayer.createOrReplace(videoScreen, {
    src: video.src,
    playing: true,
    loop: true,
    volume: 0.8
  })

  // Track what users are watching
  if (staticTV.heartbeat && video.channelId) {
    staticTV.heartbeat.startWatching(video.channelId)
  }
}
```

### UI Rendering
```typescript
// Outside main() - DCL requirement
ReactEcsRenderer.setUiRenderer(() => {
  if (!staticTV) return null
  return ReactEcs.createElement(UiEntity, {
    uiTransform: { width: '100%', height: '100%', positionType: 'absolute' },
    children: [
      staticTV.guideUI?.getComponent(),
      staticTV.chatUI?.getComponent()
    ].filter(Boolean)
  })
})
```

## Deployment

### Test World (Preview)
```bash
npm run deploy:test
```

### Production (Decentraland)
```bash
npm run deploy
```

## Scene Metadata

Edit `scene.json` to customize:
- Scene title and description
- Thumbnail image
- Spawn point location
- Parcel coordinates

## Project Structure

```
thestatic-dcl-popup/
├── src/
│   └── index.ts        # Main scene with full SDK integration
├── images/
│   └── scene-thumbnail.png
├── scene.json          # Scene metadata
└── package.json        # Dependencies
```

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Run locally in preview mode |
| `npm run build` | Build for production |
| `npm run deploy` | Deploy to Decentraland mainnet |
| `npm run deploy:test` | Deploy to test world server |

## Differences from Starter Example

| Feature | Starter Example | Popup Showcase |
|---------|-----------------|----------------|
| Purpose | Learning/Integration | Production/Events |
| Visual Style | Basic demo | Polished showcase |
| Code Comments | Extensive | Minimal |
| Demo Elements | Many (for teaching) | Production-ready |
| Default Key | Lite mode demo | Full mode |

## Resources

- [Basic Example](https://github.com/thestatic-tv/thestatic-dcl-basic) - Minimal metrics-only example
- [Starter Template](https://github.com/thestatic-tv/thestatic-dcl-starter) - For new projects
- [SDK Documentation](https://github.com/thestatic-tv/dcl-sdk)
- [Get API Key](https://thestatic.tv/dashboard)
- [TheStatic.tv](https://thestatic.tv)

## Support

Questions? Visit [thestatic.tv](https://thestatic.tv) or open an issue on GitHub.
