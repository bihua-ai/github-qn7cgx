// API configuration
export const API_BASE_URL = 'http://127.0.0.1:8000/';

// Matrix configuration
export const MATRIX_CONFIG = {
  homeserverUrl: 'https://messenger.b1.shuwantech.com',
  defaultUserId: '@admin:messenger.b1.shuwantech.com',
  defaultAccessToken: 'syt_YWRtaW4_auvQsmuwwWceIYoeqeOh_2w6nVP',
  defaultRoomId: '!demo-room:matrix.org'
};

// Helper function to build API URLs
export function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}