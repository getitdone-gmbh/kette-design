export function isMobileDevice(): boolean {
  // Check if window is available (client-side)
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if it's a touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Check viewport width
  const isSmallViewport = window.innerWidth < 768;

  // Check user agent
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isUserAgentMobile = mobileRegex.test(navigator.userAgent);

  return isTouchDevice || isSmallViewport || isUserAgentMobile;
}
