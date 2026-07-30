import fallbackProductImage from '../assets/campus-market-fallback.jpg';
import { BACKEND_BASE_URL } from '../config/runtime';

export function resolveImageUrl(path) {
  if (!path) return fallbackProductImage;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  try {
    const backendUrl = new URL(`${BACKEND_BASE_URL}/`);
    if (path.startsWith('/')) {
      return `${backendUrl.origin}${path}`;
    }
    return new URL(path.replace(/^\/+/, ''), backendUrl).toString();
  } catch {
    return fallbackProductImage;
  }
}

export default resolveImageUrl;
