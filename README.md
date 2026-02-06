# TheStatic.tv DCL SDK - PRO Tier Template

PRO tier template with ALL SDK features: video screen, Guide UI, Chat, and **Admin Panel** for your Decentraland scene.

## What This Example Shows

- **Video Screen** - Stream video with automatic fallback
- **Guide UI** - Browse channels and select videos
- **Chat UI** - Real-time messaging with other viewers
- **Admin Panel** - Video/mod controls (PRO EXCLUSIVE)
- **Visitor Tracking** - Session analytics included

## SDK Tiers

| Tier | Price | Features |
|------|-------|----------|
| **FREE** | $0 | Session tracking only |
| **STANDARD** | $10/mo | Video + Guide + Chat |
| **PRO** | $15/mo | + Admin Panel - THIS TEMPLATE |

## Quick Start

```bash
npm install
npm start
```

PRO tier requires a purchased API key. Get yours at [thestatic.tv](https://thestatic.tv)

## Add Your Key

Open `src/index.ts` and replace the placeholder:

```typescript
staticTV = new StaticTVClient({
  apiKey: 'dcls_YOUR_API_KEY_HERE',  // Get from thestatic.tv
  onVideoPlay: (url) => playVideoOnScreen(url),
  onVideoStop: () => stopVideoOnScreen(),
  guideUI: { onVideoSelect: handleVideoSelect },
  chatUI: { position: 'right' }
})
```

## Admin Panel (PRO Feature)

The Admin Panel gives you in-scene controls:
- Change video source live
- Moderate chat
- View real-time viewer stats
- Control playback

To render the Admin Panel, include it in your UI renderer:

```typescript
ReactEcsRenderer.setUiRenderer(() => {
  if (!staticTV) return null
  return ReactEcs.createElement(UiEntity, {
    uiTransform: { width: '100%', height: '100%', positionType: 'absolute' },
    children: [
      staticTV.guideUI?.getComponent(),
      staticTV.chatUI?.getComponent(),
      staticTV.adminPanel?.getComponent()  // PRO tier only
    ].filter(Boolean)
  })
})
```

## Project Structure

```
thestatic-dcl-pro/
├── src/
│   ├── index.ts              # Your scene entry point
│   └── DELETE_THIS_DEMO.ts   # Helper file - DELETE when using your own key
├── images/
│   └── scene-thumbnail.png
├── scene.json         # Scene metadata
└── package.json       # Dependencies
```

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Run locally in preview mode |
| `npm run build` | Build for production |
| `npm run deploy` | Deploy to Decentraland |
| `npm run deploy:test` | Deploy to test world server |

## Tier Comparison

| Feature | Free | Standard | Pro (This) |
|---------|------|----------|------------|
| Session Tracking | Yes | Yes | Yes |
| Video Screen | No | Yes | Yes |
| Guide UI | No | Yes | Yes |
| Chat UI | No | Yes | Yes |
| Admin Panel | No | No | Yes |

## Other Templates

| Template | Tier | Features |
|----------|------|----------|
| **[Free](https://github.com/thestatic-tv/thestatic-dcl-free)** | FREE | Session tracking only |
| **[Standard](https://github.com/thestatic-tv/thestatic-dcl-standard)** | STANDARD | Video + Guide + Chat |

## Resources

- [Get API Key](https://thestatic.tv/admin/login)
- [SDK on npm](https://www.npmjs.com/package/@thestatic-tv/dcl-sdk)
- [thestatic.tv](https://thestatic.tv)
