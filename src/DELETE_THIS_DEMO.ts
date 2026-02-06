/**
 * ===========================================================================
 *    DELETE THIS ENTIRE FILE WHEN BUILDING YOUR OWN SCENE
 * ===========================================================================
 *
 * PRO tier requires a purchased API key - no demo key available.
 * Get your key at: https://thestatic.tv
 *
 * Just delete this file and use your own API key in index.ts
 *
 * ===========================================================================
 */

/**
 * Get API key - PRO tier requires a purchased key.
 * Demo keys are only available for FREE and STANDARD tiers.
 */
export const getDemoKey = (userKey: string): string => {
  if (userKey && !userKey.includes('your_key') && !userKey.includes('YOUR_')) {
    return userKey
  }
  // PRO tier has no demo key - return placeholder (will fail auth)
  return 'dcls_YOUR_API_KEY_HERE'
}
