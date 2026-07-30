const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const locationOrigin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
const locationHostname = typeof window === 'undefined' ? 'localhost' : window.location.hostname;
const locationProtocol = typeof window === 'undefined' ? 'http:' : window.location.protocol;
const isLocalHost = ['localhost', '127.0.0.1'].includes(locationHostname);

const defaultApiUrl = isLocalHost
  ? `${locationProtocol}//${locationHostname}/Market_Place/backend/api`
  : `${locationOrigin}/Market_Place/backend/api`;

export const API_BASE_URL = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || defaultApiUrl);

export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

const socketProtocol = locationProtocol === 'https:' ? 'wss:' : 'ws:';
const defaultSocketUrl = isLocalHost
  ? `${socketProtocol}//${locationHostname}:8081`
  : `${socketProtocol}//${locationHostname}/ws`;
export const WS_URL = trimTrailingSlash(
  import.meta.env.VITE_WS_URL || defaultSocketUrl
);
