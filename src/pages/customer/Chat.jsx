import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useChatSocket } from '../../hooks/useChatSocket';
import { useE2EChat } from '../../hooks/useE2EChat';
import MessageBubble from '../../components/chat/MessageBubble';
import ChatComposer from '../../components/chat/ChatComposer';
import ChatShell from '../../components/chat/ChatShell';

const CustomerChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedVendor = searchParams.get('vendor_id');

  const [conversations, setConversations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [vendorId, setVendorId] = useState(preselectedVendor || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const activeIdRef = useRef(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { e2eReady, e2eError, encryptOutgoing, decryptIncoming, decryptHistory } = useE2EChat(user);

  const handleSocketMessage = useCallback(
    (msg) => {
      if (msg.type === 'message' && msg.data) {
        const convId = Number(msg.conversation_id || msg.data.conversation_id);
        if (convId === Number(activeIdRef.current)) {
          (async () => {
            const plain = await decryptIncoming(convId, msg.data.message || '');
            const row = {
              ...msg.data,
              message: plain,
              message_type: msg.data.message_type || 'text',
            };
            setMessages((prev) => {
              if (prev.some((m) => m.id === row.id)) return prev;
              // Replace optimistic local bubble when the server/WS echo arrives
              const localIdx = prev.findIndex(
                (m) =>
                  String(m.id).startsWith('local-') &&
                  Number(m.sender_id) === Number(row.sender_id) &&
                  (m.message === plain || m.message === (msg.data.message || ''))
              );
              if (localIdx >= 0) {
                const copy = [...prev];
                copy[localIdx] = row;
                return copy;
              }
              // Also drop any recent local bubble from same sender within 15s
              const withoutStaleLocal = prev.filter((m) => {
                if (!String(m.id).startsWith('local-')) return true;
                if (Number(m.sender_id) !== Number(row.sender_id)) return true;
                const age = Date.now() - new Date(m.created_at).getTime();
                return age > 15000;
              });
              if (withoutStaleLocal.length !== prev.length) {
                return [...withoutStaleLocal, row];
              }
              return [...prev, row];
            });
          })();
        }
        setConversations((prev) =>
          prev
            .map((c) =>
              Number(c.id) === convId
                ? { ...c, updated_at: msg.data.created_at || new Date().toISOString() }
                : c
            )
            .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
        );
      }
    },
    [decryptIncoming]
  );

  const {
    connected,
    lastError,
    joinConversation,
    sendMessage: wsSend,
  } = useChatSocket({
    token,
    onMessage: handleSocketMessage,
    enabled: !!user && user.role === 'customer',
  });

  useEffect(() => {
    activeIdRef.current = activeConversation?.id ?? null;
    if (activeConversation?.id) joinConversation(activeConversation.id);
  }, [activeConversation, joinConversation]);

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      navigate('/login');
      return;
    }
    fetchConversations();
    fetchVendors();
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'customer' || !preselectedVendor) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = await api.post('/chat/start.php', {
          type: 'customer_vendor',
          vendor_id: Number(preselectedVendor),
        });
        if (cancelled || !response.data?.success) return;
        const conversationData = response.data.data || {};
        const convId = conversationData.conversation_id || conversationData.id;
        const refreshed = await fetchConversations();
        if (convId) {
          setActiveConversation(
            refreshed.find((conversation) => Number(conversation.id) === Number(convId)) || {
              id: convId,
              type: 'customer_vendor',
              vendor_id: Number(preselectedVendor),
              shop_name: conversationData.shop_name,
            }
          );
          fetchMessages(convId);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Could not start a chat with this vendor.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, preselectedVendor]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chat/list_conversations.php');
      const list = Array.isArray(response.data.data) ? response.data.data : [];
      const customerConversations = list.filter((conv) => conv.type === 'customer_vendor');
      setConversations(customerConversations);
      return customerConversations;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conversations.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await api.get('/vendors/follow.php?discover=1');
      const approvedVendors = Array.isArray(response.data.data) ? response.data.data : [];
      setVendors(
        approvedVendors.map((vendor) => ({
          id: vendor.vendor_id,
          shop_name: vendor.shop_name,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/chat/messages.php?conversation_id=${conversationId}`);
      const rows = Array.isArray(response.data.data) ? response.data.data : [];
      setMessages(await decryptHistory(conversationId, rows));
    } catch (err) {
      console.error(err);
    }
  };

  const startNewChat = async (e) => {
    e.preventDefault();
    if (!vendorId) {
      setError('Please select a vendor to message.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/chat/start.php', {
        type: 'customer_vendor',
        vendor_id: Number(vendorId),
      });
      if (!response.data?.success)
        throw new Error(response.data?.message || 'Failed to start chat');
      const conversationData = response.data.data || {};
      const convId = conversationData.conversation_id || conversationData.id;
      const refreshed = await fetchConversations();
      if (convId) {
        const selectedVendor = vendors.find((vendor) => Number(vendor.id) === Number(vendorId));
        setActiveConversation(
          refreshed.find((conversation) => Number(conversation.id) === Number(convId)) || {
            id: convId,
            type: 'customer_vendor',
            vendor_id: Number(vendorId),
            shop_name: conversationData.shop_name || selectedVendor?.shop_name,
          }
        );
        setMessages([]);
        fetchMessages(convId);
      }
      setVendorId('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to start the conversation.');
    } finally {
      setLoading(false);
    }
  };

  const deliverPayload = async (conversationId, payload) => {
    // Text can go WS; media always REST so fields are preserved
    const isTextOnly = (payload.message_type || 'text') === 'text' && !payload.media_url;
    if (isTextOnly && connected) {
      try {
        await wsSend(conversationId, payload.message);
        return;
      } catch {
        /* REST */
      }
    }
    const res = await api.post('/chat/send_message.php', {
      conversation_id: conversationId,
      ...payload,
    });
    const saved = res.data?.data?.message;
    if (saved) {
      const plain = await decryptIncoming(conversationId, saved.message || '');
      const row = { ...saved, message: plain };
      setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
    } else {
      fetchMessages(conversationId);
    }
  };

  const handleSendText = async (plaintext) => {
    if (!activeConversation?.id) return;
    let body = plaintext;
    try {
      body = await encryptOutgoing(activeConversation.id, plaintext);
    } catch {
      /* plain */
    }
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        sender_id: user.id,
        message: plaintext,
        message_type: 'text',
        created_at: new Date().toISOString(),
      },
    ]);
    try {
      await deliverPayload(activeConversation.id, { message: body, message_type: 'text' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send the message.');
    }
  };

  const handleSendMedia = async (mediaPayload) => {
    if (!activeConversation?.id) return;
    // Optimistic bubble
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        sender_id: user.id,
        message: mediaPayload.message || '',
        message_type: mediaPayload.message_type,
        media_url: mediaPayload.media_url,
        media_mime: mediaPayload.media_mime,
        media_duration_sec: mediaPayload.media_duration_sec,
        created_at: new Date().toISOString(),
      },
    ]);
    try {
      await deliverPayload(activeConversation.id, mediaPayload);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send media.');
    }
  };

  const activeTitle =
    activeConversation?.shop_name ||
    [activeConversation?.vendor_first_name, activeConversation?.vendor_last_name]
      .filter(Boolean)
      .join(' ') ||
    'Vendor chat';

  const closeThread = () => setActiveConversation(null);

  const openThread = (conv) => {
    setActiveConversation(conv);
    if (conv?.id) fetchMessages(conv.id);
  };

  return (
    <ChatShell
      title="Messages"
      subtitle="Text, photos, and voice notes with ABUAD vendors."
      kicker="Secure messaging"
      hasActive={Boolean(activeConversation)}
      onBack={closeThread}
      activeTitle={activeTitle}
      activeSubtitle="Vendor · encrypted chat"
      activeAvatarLetter={activeTitle}
      alert={error || lastError || e2eError || null}
      statusPills={
        <>
          <span className={`chat-pill ${e2eReady ? 'chat-pill-on' : ''}`}>
            {e2eReady ? 'E2E on' : 'E2E…'}
          </span>
          <span className={`chat-pill ${connected ? 'chat-pill-live' : 'chat-pill-wait'}`}>
            {connected ? 'Live' : 'Connecting…'}
          </span>
        </>
      }
      listHeader={
        <div className="customer-chat-sidebar-head luxury-chat-sidebar-head">
          <h2>Chats</h2>
          <form onSubmit={startNewChat} className="space-y-2">
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              aria-label="Select a vendor to message"
            >
              <option value="">Message a vendor…</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.shop_name}
                </option>
              ))}
            </select>
            <button type="submit" disabled={loading || !vendorId} className="chat-start-btn">
              {loading ? 'Starting…' : 'Start chat'}
            </button>
          </form>
        </div>
      }
      listContent={
        conversations.length === 0 ? (
          <p className="chat-empty-hint">No conversations yet. Start one above.</p>
        ) : (
          conversations.map((conv) => {
            const title =
              conv.shop_name ||
              [conv.vendor_first_name, conv.vendor_last_name].filter(Boolean).join(' ') ||
              'Approved ABUAD shop';
            return (
              <button
                type="button"
                key={conv.id}
                onClick={() => openThread(conv)}
                className={`customer-chat-conversation luxury-chat-item ${
                  activeConversation?.id === conv.id ? 'active' : ''
                }`}
              >
                <span className="chat-avatar" aria-hidden="true">
                  {title.charAt(0).toUpperCase()}
                </span>
                <span className="chat-item-copy">
                  <span className="chat-item-name">{title}</span>
                  <span className="chat-item-time">
                    {conv.updated_at ? new Date(conv.updated_at).toLocaleString() : ''}
                  </span>
                </span>
              </button>
            );
          })
        )
      }
      messagesContent={
        messages.length === 0 ? (
          <p className="chat-empty-hint">Say hello — send the first message.</p>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMine={Number(msg.sender_id) === Number(user.id)}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )
      }
      composer={
        activeConversation ? (
          <ChatComposer
            conversationId={activeConversation.id}
            onSendText={handleSendText}
            onSendMediaMessage={handleSendMedia}
          />
        ) : null
      }
      emptyThread={
        <>
          <p>Select a conversation</p>
          <span>Or start a new chat with a vendor from the list.</span>
        </>
      }
    />
  );
};

export default CustomerChat;
