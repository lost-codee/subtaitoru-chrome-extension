// Platform constants
const PLATFORMS = {
  YOUTUBE: "youtube",
  AMAZON_PRIME: "amazonPrime",
  NETFLIX: "netflix",
};

const HOSTNAMES = {
  YOUTUBE: ["youtube.com", "youtu.be"],
  AMAZON: ["amazon.com", "amazon.co.jp", "amazon.co.uk", "amazon.de"],
  NETFLIX: ["netflix.com"],
};

// Amazon video path constant
const AMAZON_VIDEO_PATH = "/video";

/**
 * Determine the platform based on the current URL and hostname.
 * @returns {string | null} - The detected platform or null if none matched.
 */
export function getPlatform(): string | null {
  const { hostname, pathname } = new URL(window.location.href);

  // Check for YouTube platform
  if (HOSTNAMES.YOUTUBE.some((domain) => hostname.includes(domain))) {
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
