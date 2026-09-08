// Central place for anything touching the stored session, so every
// caller clears + flags things the same way.
export function clearSessionExpired() {
  localStorage.clear()
  // logoutReason survives because we set it AFTER clear() — Login.jsx
  // reads and removes it on mount.
  localStorage.setItem('logoutReason', 'expired')
}

export function clearSessionManual() {
  localStorage.clear()
}