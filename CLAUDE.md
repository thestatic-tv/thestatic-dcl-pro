# thestatic-dcl-pro - AI Session Entry

## What this is

A **starter template** demonstrating the PRO tier of `@thestatic-tv/dcl-sdk`.
Users clone this to get a Decentraland scene with all SDK features including the in-scene Admin Panel.

**This is not a production scene.** It's a reference implementation / clone-me template.
The equivalent deployed production scene is `thestatic-hq`.

## What PRO tier provides

- Everything in Standard (video screen, Guide UI, Chat UI, heartbeat, analytics)
- **Admin Panel** - in-scene video and moderation controls (Pro-exclusive, `dclk_*` key required)

## Quick commands

```bash
npm install
npm start              # Local preview
npm run deploy         # Deploy to mainnet (after updating scene.json)
npm run deploy:test    # Test world
```

## Key file

`src/index.ts` - Must use a **Pro tier channel key** (`dclk_*` prefix):

```typescript
staticTV = new StaticTVClient({
  apiKey: 'dclk_YOUR_CHANNEL_KEY_HERE',  // Pro: channel key, not scene key
  guideUI: { onVideoSelect: handleVideoSelect },
  chatUI: { position: 'right' }
})
```

Get a Pro key at [thestatic.tv/dashboard](https://thestatic.tv/dashboard).

> **Key prefix matters:** `dcls_*` = scene key (Standard/Free); `dclk_*` = channel key (Pro). Admin Panel only activates with a channel key.

## SDK tiers (for context)

| Tier | Key prefix | Features |
|------|-----------|---------|
| Free | `dcls_*` | Visitor tracking only |
| Standard | `dcls_*` | + Video + Guide + Chat |
| **Pro** | `dclk_*` | + Admin Panel - **this template** |

See `thestatic-dcl-free` and `thestatic-dcl-standard` for the other tiers.

## Cross-repo dependencies

- `thestatic-dcl-sdk` - publishes `@thestatic-tv/dcl-sdk` to npm
- `thestatic-tv` - backend API this scene talks to; Pro features gated by channel key type
