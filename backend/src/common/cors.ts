/** Allow localhost and LAN IPs (any host on port 3000) when CORS_ALLOW_LAN is enabled. */
export function isAllowedCorsOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  const allowed = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.includes(origin)) return true;
  if (process.env.CORS_ALLOW_LAN === 'true') {
    return /^https?:\/\/[\d.a-z-]+:3000$/i.test(origin);
  }
  return false;
}
