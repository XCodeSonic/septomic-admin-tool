// Lightweight "quick unlock" using the platform's Face ID / Touch ID /
// fingerprint prompt via WebAuthn. This does NOT replace server login —
// it just gates access to the session token already stored from a normal
// password login, so re-opening the app doesn't require retyping.
const CRED_ID_KEY = 'biometricCredId'
const ENABLED_KEY = 'biometricEnabled'

function bufToBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}
function base64ToBuf(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer
}

export async function isBiometricSupported() {
  if (!window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

export function isBiometricEnabled() {
  return localStorage.getItem(ENABLED_KEY) === '1' && !!localStorage.getItem(CRED_ID_KEY)
}

export async function enableBiometric(username) {
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const userId = crypto.getRandomValues(new Uint8Array(16))

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'Septomic Admin', id: window.location.hostname },
      user: { id: userId, name: username, displayName: username },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
      timeout: 60000,
      attestation: 'none',
    },
  })

  localStorage.setItem(CRED_ID_KEY, bufToBase64(credential.rawId))
  localStorage.setItem(ENABLED_KEY, '1')
}

export async function unlockWithBiometric() {
  const credId = localStorage.getItem(CRED_ID_KEY)
  if (!credId) return false
  const challenge = crypto.getRandomValues(new Uint8Array(32))

  try {
    await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ id: base64ToBuf(credId), type: 'public-key' }],
        userVerification: 'required',
        timeout: 60000,
      },
    })
    return true
  } catch {
    return false // user cancelled, failed scan, etc.
  }
}

export function disableBiometric() {
  localStorage.removeItem(CRED_ID_KEY)
  localStorage.removeItem(ENABLED_KEY)
}