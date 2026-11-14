const PREFIX = 'netrakshak.';

export function loadJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

export function saveJson(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (error) {
    // Quota or private browsing: the session still works, it just will not persist.
    return false;
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch (error) {
    /* ignore */
  }
}
