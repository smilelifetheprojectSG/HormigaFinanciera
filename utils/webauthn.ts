// Base64URL to ArrayBuffer
export function bufferDecode(value: string): Uint8Array {
  return Uint8Array.from(atob(value.replace(/_/g, '/').replace(/-/g, '+')), c => c.charCodeAt(0));
}

// ArrayBuffer to Base64URL
export function bufferEncode(value: ArrayBuffer): string {
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(value))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
