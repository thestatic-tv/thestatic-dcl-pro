# thestatic-dcl-pro - AI Session Entry

## What this is

A **starter template** demonstrating the PRO tier of `@thestatic-tv/dcl-sdk`.
Users clone this to get a Decentraland scene with all SDK features including the in-scene Admin Panel.

**This is not a production scene.** It's a reference implementation / clone-me template.
The equivalent deployed production scene is `thestatic-hq`.

## What PRO tier provides

- Everything in Standard (video screen, Guide UI, Chat UI, heartbeat, analytics)
- **Admin Panel** - in-scene video and moderation controls (Pro-exclusive; needs a `dcls_*` key whose tier is Pro)

## Quick commands

```bash
npm install
npm start              # Local preview
npm run deploy         # Deploy to mainnet (after updating scene.json)
npm run deploy:test    # Test world
```

## Key file

`src/index.ts` - Must use a **Pro tier key** (`dcls_*` prefix, tier set to Pro on the key):

```typescript
staticTV = new StaticTVClient({
  apiKey: 'dcls_YOUR_API_KEY_HERE',  // Pro: the tier comes from the key, not the prefix
  guideUI: { onVideoSelect: handleVideoSelect },
  chatUI: { position: 'right' }
})
```

Get a Pro key at [thestatic.tv/dashboard](https://thestatic.tv/dashboard).

> **Every tier uses `dcls_*`;** the tier is set on the key at thestatic.tv/dashboard and returned at session start. `dclk_*` is a legacy channel key: it gets the tier it paid for (free when unpaid), never Pro, and counts no watch time or likes - use a `dcls_*` scene key.

## SDK tiers (for context)

| Tier | Key prefix | Features |
|------|-----------|---------|
| Free | `dcls_*` | Visitor tracking only |
| Standard | `dcls_*` | + Video + Guide + Chat |
| **Pro** | `dcls_*` | + Admin Panel - **this template** |

See `thestatic-dcl-free` and `thestatic-dcl-standard` for the other tiers.

## Cross-repo dependencies

- `thestatic-dcl-sdk` - publishes `@thestatic-tv/dcl-sdk` to npm
- `thestatic-tv` - backend API this scene talks to; Pro features gated server-side by the key's tier
