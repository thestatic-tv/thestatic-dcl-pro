/**
 * DEMO CONFIGURATION - DELETE THIS FILE WHEN USING YOUR OWN API KEY
 *
 * This file contains the demo API key for testing purposes.
 * Demo keys only work in preview mode (npm start) at coordinates 0,0.
 *
 * DEMO KEY LIMITATIONS:
 * - Only works in preview mode (npm start)
 * - Only works at coordinates 0,0
 * - Admin Panel changes do NOT persist to the database
 *
 * TO USE YOUR OWN KEY:
 * 1. Get a key at https://thestatic.tv/dashboard
 * 2. Delete this file (demo-config.ts)
 * 3. In index.ts, replace: apiKey: getDemoKey('dcls_YOUR_API_KEY_HERE')
 *    With:                  apiKey: 'dcls_YOUR_ACTUAL_KEY'
 */

// Base64 decoder (no external dependencies)
const decodeB64 = (s: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let r = ''
  for (let i = 0; i < s.length; i += 4) {
    const a = chars.indexOf(s[i]), b = chars.indexOf(s[i + 1])
    const c = chars.indexOf(s[i + 2]), d = chars.indexOf(s[i + 3])
    r += String.fromCharCode((a << 2) | (b >> 4))
    if (c !== -1) r += String.fromCharCode(((b & 15) << 4) | (c >> 2))
    if (d !== -1) r += String.fromCharCode(((c & 3) << 6) | d)
  }
  return r
}

// Demo key configuration (obfuscated) - PRO tier
const demoConfig = {
  id: 'pro-demo-key',
  data: 'EgoIFjAVRA5VG1MQQ10AUgodE10FGlVAQllQAAwZRlpST1QUQg=='
}

// Decode the demo key
const decodeDemoKey = (): string => {
  const decoded = decodeB64(demoConfig.data)
  let result = ''
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ demoConfig.id.charCodeAt(i % demoConfig.id.length))
  }
  return result
}

/**
 * Get API key - returns your key if provided, otherwise uses demo key.
 * Demo keys only work in preview mode at coordinates 0,0.
 *
 * @param userKey - Your API key (or placeholder like 'dcls_YOUR_API_KEY_HERE')
 * @returns The API key to use
 */
export const getDemoKey = (userKey: string): string => {
  // If user provided a real key, use it
  if (userKey && !userKey.includes('your_key') && !userKey.includes('YOUR_')) {
    return userKey
  }
  // Otherwise use demo key
  console.log('[TheStatic.tv] Using demo key - get your own at thestatic.tv/dashboard')
  console.log('[TheStatic.tv] Note: Admin Panel changes will NOT persist with demo key')
  return decodeDemoKey()
}
