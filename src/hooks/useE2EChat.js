import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import {
  ensureIdentityKeys,
  createConversationKey,
  wrapConversationKey,
  unwrapConversationKey,
  encryptMessage,
  decryptMessage,
  decryptMessages,
  isE2ECiphertext,
} from '../utils/e2eCrypto';

/**
 * Manages E2E identity + per-conversation keys for the logged-in user.
 */
export function useE2EChat(user) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const identityRef = useRef(null);
  const convKeysRef = useRef(new Map()); // conversationId -> CryptoKey

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) {
        setReady(false);
        identityRef.current = null;
        convKeysRef.current.clear();
        return;
      }
      try {
        const identity = await ensureIdentityKeys(user.id);
        if (cancelled) return;
        identityRef.current = identity;
        // Publish public key so peers can wrap conversation keys for us
        await api.post('/chat/keys.php', { public_jwk: identity.publicJwk });
        if (!cancelled) {
          setReady(true);
          setError('');
        }
      } catch (e) {
        console.error('E2E identity setup failed', e);
        if (!cancelled) {
          setError(e.message || 'End-to-end encryption setup failed.');
          setReady(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const getConversationKey = useCallback(
    async (conversationId) => {
      const id = Number(conversationId);
      if (convKeysRef.current.has(id)) {
        return convKeysRef.current.get(id);
      }

      const identity = identityRef.current;
      if (!identity || !user?.id) return null;

      // 1) Try load my wrapped key from server
      const status = await api.get(`/chat/conversation_keys.php?conversation_id=${id}`);
      const data = status.data?.data;
      if (data?.wrapped_key) {
        try {
          const wrapped = JSON.parse(data.wrapped_key);
          const fromId = wrapped.from_user_id;
          // Need sender's public key to ECDH
          const pubRes = await api.get(`/chat/keys.php?user_id=${fromId}`);
          const fromPub = pubRes.data?.data?.public_jwk;
          if (!fromPub) throw new Error('Peer public key missing');
          const key = await unwrapConversationKey(data.wrapped_key, identity.privateJwk, fromPub);
          convKeysRef.current.set(id, key);
          return key;
        } catch (e) {
          console.warn('Failed to unwrap conversation key', e);
        }
      }

      // 2) No key yet — create and distribute to all participants
      const participantIds = data?.participant_user_ids || [];
      if (!participantIds.length) return null;

      // Fetch all public keys
      const idsParam = participantIds.join(',');
      const pubsRes = await api.get(`/chat/keys.php?user_ids=${idsParam}`);
      const pubMap = pubsRes.data?.data || {};

      // Everyone including self needs a key published
      const missing = participantIds.filter((uid) => !pubMap[String(uid)] && uid !== user.id);
      // Self always has local public key
      pubMap[String(user.id)] = identity.publicJwk;

      if (missing.length) {
        // Peers have not registered keys yet — cannot establish E2E
        setError('Waiting for the other participant to open this chat so keys can be exchanged.');
        return null;
      }

      const { key, raw } = await createConversationKey();
      const keysPayload = [];
      for (const uid of participantIds) {
        const theirPub = pubMap[String(uid)];
        if (!theirPub) continue;
        const wrapped = await wrapConversationKey(raw, identity.privateJwk, theirPub, user.id);
        keysPayload.push({ user_id: uid, wrapped_key: wrapped });
      }

      await api.post('/chat/conversation_keys.php', {
        conversation_id: id,
        keys: keysPayload,
      });

      convKeysRef.current.set(id, key);
      setError('');
      return key;
    },
    [user?.id]
  );

  const encryptOutgoing = useCallback(
    async (conversationId, plaintext) => {
      const key = await getConversationKey(conversationId);
      if (!key) {
        // Fallback: send plaintext (server may still apply at-rest encryption)
        return plaintext;
      }
      return encryptMessage(plaintext, key);
    },
    [getConversationKey]
  );

  const decryptIncoming = useCallback(
    async (conversationId, stored) => {
      if (!isE2ECiphertext(stored)) return stored;
      const key = await getConversationKey(conversationId);
      if (!key) return '[Encrypted message — both users must open this chat to exchange keys]';
      return decryptMessage(stored, key);
    },
    [getConversationKey]
  );

  const decryptHistory = useCallback(
    async (conversationId, rows) => {
      const key = await getConversationKey(conversationId);
      if (!key) {
        return (rows || []).map((r) =>
          isE2ECiphertext(r.message) ? { ...r, message: '[Encrypted — establishing keys…]' } : r
        );
      }
      return decryptMessages(rows || [], key);
    },
    [getConversationKey]
  );

  return {
    e2eReady: ready,
    e2eError: error,
    getConversationKey,
    encryptOutgoing,
    decryptIncoming,
    decryptHistory,
  };
}

export default useE2EChat;
