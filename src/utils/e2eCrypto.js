/**
 * End-to-end chat crypto (Web Crypto API)
 * - Long-term ECDH P-256 identity keypair per user (private key stays in localStorage)
 * - Per-conversation AES-256-GCM key, wrapped to each participant via ECDH
 * - Message format: e2e:v1:<base64(iv[12] + ciphertext_with_tag)>
 */

const STORAGE_PRIV = (userId) => `e2e_priv_jwk_${userId}`;
const STORAGE_PUB = (userId) => `e2e_pub_jwk_${userId}`;
const MSG_PREFIX = 'e2e:v1:';

function bufToB64Std(buf) {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  let s = '';
  bytes.forEach((b) => {
    s += String.fromCharCode(b);
  });
  return btoa(s);
}

function concatBuf(a, b) {
  const A = new Uint8Array(a);
  const B = new Uint8Array(b);
  const out = new Uint8Array(A.length + B.length);
  out.set(A, 0);
  out.set(B, A.length);
  return out.buffer;
}

export function isE2ECiphertext(text) {
  return typeof text === 'string' && text.startsWith(MSG_PREFIX);
}

export async function ensureIdentityKeys(userId) {
  if (!userId) throw new Error('userId required for E2E keys');
  const privRaw = localStorage.getItem(STORAGE_PRIV(userId));
  const pubRaw = localStorage.getItem(STORAGE_PUB(userId));
  if (privRaw && pubRaw) {
    return {
      publicJwk: JSON.parse(pubRaw),
      privateJwk: JSON.parse(privRaw),
    };
  }

  const pair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
    'deriveKey',
    'deriveBits',
  ]);
  const publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
  const privateJwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
  // Strip private material from public export
  const pubOnly = {
    kty: publicJwk.kty,
    crv: publicJwk.crv,
    x: publicJwk.x,
    y: publicJwk.y,
    ext: true,
    key_ops: ['deriveKey', 'deriveBits'],
  };
  localStorage.setItem(STORAGE_PUB(userId), JSON.stringify(pubOnly));
  localStorage.setItem(STORAGE_PRIV(userId), JSON.stringify(privateJwk));
  return { publicJwk: pubOnly, privateJwk };
}

async function importPrivateKey(jwk) {
  return crypto.subtle.importKey('jwk', jwk, { name: 'ECDH', namedCurve: 'P-256' }, false, [
    'deriveKey',
    'deriveBits',
  ]);
}

async function importPublicKey(jwk) {
  return crypto.subtle.importKey(
    'jwk',
    {
      kty: jwk.kty,
      crv: jwk.crv || 'P-256',
      x: jwk.x,
      y: jwk.y,
    },
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    []
  );
}

async function deriveWrapKey(privateJwk, theirPublicJwk) {
  const priv = await importPrivateKey(privateJwk);
  const pub = await importPublicKey(theirPublicJwk);
  return crypto.subtle.deriveKey(
    { name: 'ECDH', public: pub },
    priv,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function createConversationKey() {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
  const raw = await crypto.subtle.exportKey('raw', key);
  return { key, raw };
}

export async function importConversationKeyRaw(rawBuf) {
  return crypto.subtle.importKey('raw', rawBuf, { name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);
}

/**
 * Wrap conversation key for a peer using ECDH(myPriv, theirPub).
 */
export async function wrapConversationKey(
  conversationKeyRaw,
  myPrivateJwk,
  theirPublicJwk,
  fromUserId
) {
  const wrapKey = await deriveWrapKey(myPrivateJwk, theirPublicJwk);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, wrapKey, conversationKeyRaw);
  return JSON.stringify({
    v: 1,
    alg: 'ECDH-ES+A256GCM',
    from_user_id: fromUserId,
    iv: bufToB64Std(iv),
    ct: bufToB64Std(ct),
  });
}

export async function unwrapConversationKey(wrappedJson, myPrivateJwk, fromPublicJwk) {
  const blob = typeof wrappedJson === 'string' ? JSON.parse(wrappedJson) : wrappedJson;
  const wrapKey = await deriveWrapKey(myPrivateJwk, fromPublicJwk);
  const ivBuf = Uint8Array.from(atob(blob.iv), (c) => c.charCodeAt(0));
  const ctBuf = Uint8Array.from(atob(blob.ct), (c) => c.charCodeAt(0));
  const raw = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBuf }, wrapKey, ctBuf);
  return importConversationKeyRaw(raw);
}

export async function encryptMessage(plaintext, conversationKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    conversationKey,
    new TextEncoder().encode(plaintext)
  );
  const packed = concatBuf(iv.buffer, ct);
  return MSG_PREFIX + bufToB64Std(packed);
}

export async function decryptMessage(stored, conversationKey) {
  if (!stored) return '';
  if (!isE2ECiphertext(stored)) {
    // Server-side enc:v1: or legacy plaintext — show as-is (caller may handle server crypto)
    if (String(stored).startsWith('enc:v1:')) {
      return '[Server-encrypted message]';
    }
    return stored;
  }
  try {
    const bin = Uint8Array.from(atob(stored.slice(MSG_PREFIX.length)), (c) => c.charCodeAt(0));
    const iv = bin.slice(0, 12);
    const data = bin.slice(12);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, conversationKey, data);
    return new TextDecoder().decode(plain);
  } catch {
    return '[Unable to decrypt — key missing]';
  }
}

export async function decryptMessages(rows, conversationKey) {
  if (!conversationKey) return rows;
  const out = [];
  for (const row of rows) {
    out.push({
      ...row,
      message: await decryptMessage(row.message, conversationKey),
    });
  }
  return out;
}
