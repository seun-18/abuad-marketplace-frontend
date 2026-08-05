/**
 * Normalize API / network errors into a short user-facing message.
 */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  if (typeof error === 'string') return error;

  const status = error.response?.status;
  const data = error.response?.data;

  if (data) {
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }
    if (data.data && typeof data.data === 'object') {
      const parts = Object.values(data.data)
        .flat()
        .filter((v) => typeof v === 'string' && v.trim());
      if (parts.length) return parts.join(' ');
    }
    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }
  }

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Check your connection and try again.';
  }

  if (!error.response) {
    return 'Could not reach the server. Check your internet connection.';
  }

  if (status === 401) return 'Please sign in to continue.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'The requested resource was not found.';
  if (status === 422) return 'Please check the form and try again.';
  if (status === 429) return 'Too many requests. Please wait a moment.';
  if (status >= 500) return 'Server error. Please try again shortly.';

  if (typeof error.message === 'string' && error.message && !error.message.startsWith('Request failed')) {
    return error.message;
  }

  return fallback;
}

export default getErrorMessage;
