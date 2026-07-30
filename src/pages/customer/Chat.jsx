import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useChatSocket } from '../../hooks/useChatSocket';
import { useE2EChat } from '../../hooks/useE2EChat';
import MessageBubble from '../../components/chat/MessageBubble';
import ChatComposer from '../../components/chat/ChatComposer';

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

  return (
    <div className="customer-chat-page max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">
            Chat with vendors using text, photos, and voice notes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              e2eReady
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}
          >
            {e2eReady ? 'E2E on' : 'E2E…'}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              connected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {connected ? 'Live' : 'Connecting…'}
          </span>
        </div>
      </div>

      {(error || lastError || e2eError) && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
          {error || lastError || e2eError}
        </div>
      )}

      <div className="customer-chat-shell flex h-[72vh] rounded-2xl overflow-hidden shadow-sm">
        {/* Sidebar */}
        <div className="customer-chat-sidebar w-full sm:w-1/3 flex flex-col">
          <div className="customer-chat-sidebar-head p-4 space-y-3 text-white">
            <h2 className="text-lg font-semibold">Chats</h2>
            <form onSubmit={startNewChat} className="space-y-2">
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-gray-900 focus:outline-none"
              >
                <option value="">Message a vendor…</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.shop_name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading || !vendorId}
                className="w-full px-3 py-2 bg-white text-indigo-700 font-semibold rounded-lg text-sm disabled:opacity-50"
              >
                Start chat
              </button>
            </form>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="p-6 text-center text-gray-400 text-sm">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <button
                  type="button"
                  key={conv.id}
                  onClick={() => {
                    setActiveConversation(conv);
                    fetchMessages(conv.id);
                  }}
                  className={`customer-chat-conversation w-full text-left p-3 rounded-xl transition ${
                    activeConversation?.id === conv.id ? 'active' : ''
                  }`}
                >
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {conv.shop_name ||
                      [conv.vendor_first_name, conv.vendor_last_name].filter(Boolean).join(' ') ||
                      'Approved ABUAD shop'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {conv.updated_at ? new Date(conv.updated_at).toLocaleString() : ''}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread */}
        <div className="customer-chat-thread hidden sm:flex flex-1 flex-col">
          {activeConversation ? (
            <>
              <div className="customer-chat-thread-head px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  {(activeConversation.shop_name || 'V').charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {activeConversation.shop_name ||
                      [activeConversation.vendor_first_name, activeConversation.vendor_last_name]
                        .filter(Boolean)
                        .join(' ') ||
                      'Approved ABUAD shop'}
                  </h3>
                  <p className="text-xs text-gray-400">Vendor · secure chat</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} isMine={msg.sender_id === user.id} />
                ))}
                <div ref={messagesEndRef} />
              </div>
              <ChatComposer
                conversationId={activeConversation.id}
                onSendText={handleSendText}
                onSendMediaMessage={handleSendMedia}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-8 text-center">
              Select a conversation or start a new chat with a vendor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerChat;
