const BROWSER_PATTERNS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\//, "Opera"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
  [/Safari\//, "Safari"]
];

const OS_PATTERNS: [RegExp, string][] = [
  [/Windows/, "Windows"],
  [/iPhone|iPad|iPod/, "iOS"],
  [/Mac OS X/, "macOS"],
  [/Android/, "Android"],
  [/Linux/, "Linux"]
];

function match(patterns: [RegExp, string][], ua: string): string | null {
  for (const [pattern, label] of patterns) {
    if (pattern.test(ua)) return label;
  }
  return null;
}

/**
 * Describes a device/browser from its raw user-agent string, e.g.
 * "Chrome on macOS". Falls back gracefully rather than ever showing
 * the raw string — the UI shouldn't need to know what a user-agent
 * header looks like.
 */
export function describeUserAgent(ua: string | null | undefined): string {
  if (!ua) return "Unknown device";

  const browser = match(BROWSER_PATTERNS, ua);
  const os = match(OS_PATTERNS, ua);

  if (browser && os) return `${browser} on ${os}`;
  if (browser) return browser;
  if (os) return `Device on ${os}`;
  return "Unknown device";
}
