// Platform constants
export const PLATFORMS = {
  YOUTUBE: "youtube",
  AMAZON_PRIME: "amazonPrime",
  NETFLIX: "netflix",
};

const HOSTNAMES = {
  YOUTUBE: ["youtube.com", "youtu.be"],
  AMAZON: ["amazon.com", "amazon.co.jp", "amazon.co.uk", "amazon.de"],
  NETFLIX: ["netflix.com"],
};

const AMAZON_VIDEO_PATH = "/video";
const YOUTUBE_VIDEO_PATH = "/watch";

/**
 * Determine the platform based on the current URL and hostname.
 * @returns {string | null} - The detected platform or null if none matched.
 */
export function getPlatform(url?: string): string | null {
  if (!url) {
    return null;
  }

  const { hostname, pathname } = new URL(url);

  // Check for YouTube platform
  if (
    HOSTNAMES.YOUTUBE.some((domain) => hostname.includes(domain)) &&
    pathname.includes(YOUTUBE_VIDEO_PATH)
  ) {
    return PLATFORMS.YOUTUBE;
  }

  // Check for Amazon Prime Video platform
  if (
    HOSTNAMES.AMAZON.some((domain) => hostname.includes(domain)) &&
    pathname.includes(AMAZON_VIDEO_PATH)
  ) {
    return PLATFORMS.AMAZON_PRIME;
  }

  // Check for Netflix platform
  if (HOSTNAMES.NETFLIX.some((domain) => hostname.includes(domain))) {
    return PLATFORMS.NETFLIX;
  }

  // Platform not detected
  return null;
}
