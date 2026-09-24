import { MessageCircleMore, RefreshCw, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import ChatComposer from '../../components/chat/ChatComposer';
import MessageBubble from '../../components/chat/MessageBubble';
import { useAuth } from '../../context/AuthContext';
import { useChatSocket } from '../../hooks/useChatSocket';

const VendorChats = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('chats'); // chats | vendors
  const [startingId, setStartingId] = useState(null);
  const messagesEndRef = useRef(null);
  const activeIdRef = useRef(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const appendMessage = useCallback((message) => {
    if (!message) return;
    setMessages((current) =>
      current.some((item) => Number(item.id) === Number(message.id))
        ? current
        : [...current, message]
    );
  }, []);

  const handleSocketMessage = useCallback(
    (event) => {
      if (event.type !== 'message' || !event.data) return;
      const conversationId = Number(event.conversation_id || event.data.conversation_id);
      if (conversationId === Number(activeIdRef.current)) appendMessage(event.data);
    },
    [appendMessage]
  );

  const { connected, joinConversation } = useChatSocket({
    token,
    onMessage: handleSocketMessage,
    enabled: Boolean(user && user.role === 'super_admin'),
  });

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const response = await api.get(`/chat/messages.php?conversation_id=${conversationId}`);
      setMessages(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load support messages.');
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/chat/list_conversations.php');
      const list = Array.isArray(response.data.data) ? response.data.data : [];
      const adminChats = list.filter((conversation) => conversation.type === 'vendor_admin');
      setConversations(adminChats);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVendors = useCallback(async () => {
    try {
      const res = await api.get('/admin/vendors.php');
      const list = res.data?.data || [];
      setVendors(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load vendors.');
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'super_admin') {
      navigate('/unauthorized', { replace: true });
      return;
    }
    fetchConversations();
    fetchVendors();
  }, [user, navigate, fetchConversations, fetchVendors]);

  useEffect(() => {
    activeIdRef.current = activeConversation?.id || null;
    if (activeConversation?.id) {
      joinConversation?.(activeConversation.id);
      fetchMessages(activeConversation.id);
    } else {
      setMessages([]);
    }
  }, [activeConversation, fetchMessages, joinConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = (conversation) => {
    setActiveConversation(conversation);
    setTab('chats');
  };

  const startChatWithVendor = async (vendor) => {
    const vendorId = vendor.vendor_id || vendor.id;
    setStartingId(vendorId);
    setError('');
    try {
      const res = await api.post('/chat/start.php', {
        type: 'vendor_admin',
        vendor_id: vendorId,
      });
      const id = res.data?.data?.conversation_id || res.data?.data?.id;
      await fetchConversations();
      if (id) {
        const title =
          vendor.shop_name ||
          [vendor.first_name, vendor.last_name].filter(Boolean).join(' ') ||
          `Vendor #${vendorId}`;
        setActiveConversation({
          id,
          type: 'vendor_admin',
          vendor_id: vendorId,
          shop_name: title,
        });
        setTab('chats');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start chat with vendor.');
    } finally {
      setStartingId(null);
    }
  };

  const deliverMessage = async (payload) => {
    if (!activeConversation?.id) return;
    try {
      const res = await api.post('/chat/send_message.php', {
        conversation_id: activeConversation.id,
        ...payload,
      });
      if (res.data?.data) appendMessage(res.data.data);
      else fetchMessages(activeConversation.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
    }
  };

  const titleFor = (conv) =>
    conv.shop_name ||
    [conv.vendor_first_name, conv.vendor_last_name].filter(Boolean).join(' ') ||
    `Vendor #${conv.vendor_id || conv.id}`;

  return (
    <div className="premium-dashboard-page space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="dashboard-kicker">Support</p>
          <h1>Vendor messages</h1>
          <p className="text-sm opacity-60">
            Message any registered vendor — you do not need to wait for them to write first.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`chat-pill ${connected ? 'chat-pill-live' : 'chat-pill-wait'}`}>
            {connected ? 'Live' : 'Connecting…'}
          </span>
          <button type="button" className="dashboard-header-button" onClick={() => { fetchConversations(); fetchVendors(); }}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && <div className="dashboard-alert">{error}</div>}

      <div className="flex flex-wrap gap-2">
        <button type="button" className={`chat-tab-btn ${tab === 'chats' ? 'active' : ''}`} onClick={() => setTab('chats')}>
          Open chats ({conversations.length})
        </button>
        <button type="button" className={`chat-tab-btn ${tab === 'vendors' ? 'active' : ''}`} onClick={() => setTab('vendors')}>
          All vendors ({vendors.length})
        </button>
      </div>

      <div className="customer-chat-shell luxury-chat-shell" style={{ minHeight: '28rem' }}>
        <aside className="customer-chat-sidebar luxury-chat-sidebar" style={{ width: 'min(40%, 22rem)' }}>
          {tab === 'vendors' ? (
            <div className="luxury-chat-list">
              {vendors.length === 0 ? (
                <p className="chat-empty-hint">No vendors registered yet.</p>
              ) : (
                vendors.map((v) => {
                  const name =
                    v.shop_name ||
                    [v.first_name, v.last_name].filter(Boolean).join(' ') ||
                    `Vendor #${v.vendor_id}`;
                  return (
                    <div key={v.vendor_id} className="luxury-chat-item" style={{ cursor: 'default' }}>
                      <span className="chat-avatar">{name.charAt(0).toUpperCase()}</span>
                      <span className="chat-item-copy min-w-0 flex-1">
                        <span className="chat-item-name">{name}</span>
                        <span className="chat-item-time">
                          {[v.first_name, v.last_name].filter(Boolean).join(' ')} · {v.status}
                          {v.email ? ` · ${v.email}` : ''}
                        </span>
                      </span>
                      <button
                        type="button"
                        className="chat-start-btn chat-tab-start"
                        style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.75rem' }}
                        disabled={startingId === v.vendor_id}
                        onClick={() => startChatWithVendor(v)}
                      >
                        {startingId === v.vendor_id ? '…' : 'Message'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="luxury-chat-list">
              {loading ? (
                <p className="chat-empty-hint">Loading…</p>
              ) : conversations.length === 0 ? (
                <p className="chat-empty-hint">No chats yet. Open “All vendors” and message someone.</p>
              ) : (
                conversations.map((conv) => (
                  <button
                    type="button"
                    key={conv.id}
                    className={`customer-chat-conversation luxury-chat-item ${
                      activeConversation?.id === conv.id ? 'active' : ''
                    }`}
                    onClick={() => selectConversation(conv)}
                  >
                    <span className="chat-avatar">{titleFor(conv).charAt(0).toUpperCase()}</span>
                    <span className="chat-item-copy">
                      <span className="chat-item-name">{titleFor(conv)}</span>
                      <span className="chat-item-time">
                        {conv.updated_at ? new Date(conv.updated_at).toLocaleString() : ''}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </aside>

        <section className="customer-chat-thread luxury-chat-thread" style={{ display: 'flex' }}>
          {activeConversation ? (
            <>
              <header className="customer-chat-thread-head luxury-chat-thread-head">
                <div className="chat-avatar chat-avatar-lg">{titleFor(activeConversation).charAt(0).toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <h3>{titleFor(activeConversation)}</h3>
                  <p>
                    <ShieldCheck size={12} className="inline" /> Vendor support
                  </p>
                </div>
              </header>
              <div className="luxury-chat-messages">
                {messages.length === 0 ? (
                  <p className="chat-empty-hint">No messages yet — send the first one.</p>
                ) : (
                  messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      msg={message}
                      isMine={Number(message.sender_id) === Number(user.id)}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <ChatComposer
                conversationId={activeConversation.id}
                onSendText={(message) => deliverMessage({ message, message_type: 'text' })}
                onSendMediaMessage={deliverMessage}
              />
            </>
          ) : (
            <div className="luxury-chat-placeholder" style={{ display: 'flex' }}>
              <MessageCircleMore size={28} />
              <p>Select a chat or message a vendor</p>
              <span>Use the “All vendors” tab to start a conversation anytime.</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default VendorChats;
