/** API / Socket base URL — uses the page hostname so LAN access (e.g. 192.168.x.x:3000) works. */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:4000`;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
}

export function getSocketUrl(): string {
  return getApiBaseUrl();
}
