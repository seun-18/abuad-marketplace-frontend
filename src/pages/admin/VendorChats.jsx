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
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      if (adminChats.length > 0 && !activeIdRef.current) {
        setActiveConversation(adminChats[0]);
        await fetchMessages(adminChats[0].id);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load vendor support chats.');
    } finally {
      setLoading(false);
    }
  }, [fetchMessages]);

  useEffect(() => {
    if (!user || user.role !== 'super_admin') {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [fetchConversations, navigate, user]);

  useEffect(() => {
    activeIdRef.current = activeConversation?.id ?? null;
    if (activeConversation?.id) joinConversation(activeConversation.id);
  }, [activeConversation, joinConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const deliverMessage = async (payload) => {
    if (!activeConversation?.id) return;
    try {
      const response = await api.post('/chat/send_message.php', {
        conversation_id: activeConversation.id,
        ...payload,
      });
      appendMessage(response.data.data?.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not send this message.');
      throw requestError;
    }
  };

  return (
    <div className="premium-dashboard-page">
      <div className="dashboard-title-row">
        <div>
          <p className="dashboard-kicker">Vendor support</p>
          <h1>Media-ready support conversations.</h1>
          <p>Receive vendor text, images, and voice notes in one secure workspace.</p>
        </div>
        <div className="dashboard-verification">
          <span className={connected ? 'status-live' : ''} />
          {connected ? 'Live connection' : 'Syncing'}
        </div>
      </div>

      {error && <div className="dashboard-alert dashboard-alert-error">{error}</div>}

      <div className="support-chat-shell">
        <aside className="support-chat-list">
          <div className="support-chat-list-heading">
            <div>
              <MessageCircleMore size={18} />
              <span>Vendor conversations</span>
            </div>
            <button type="button" onClick={fetchConversations} aria-label="Refresh conversations">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="support-chat-conversations">
            {conversations.length === 0 ? (
              <p>No vendor chats yet.</p>
            ) : (
              conversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  onClick={() => {
                    setActiveConversation(conversation);
                    fetchMessages(conversation.id);
                  }}
                  className={
                    Number(activeConversation?.id) === Number(conversation.id) ? 'active' : ''
                  }
                >
                  <span>{conversation.shop_name || 'Approved ABUAD shop'}</span>
                  <small>
                    {[conversation.vendor_first_name, conversation.vendor_last_name]
                      .filter(Boolean)
                      .join(' ') || 'Verified vendor'}
                  </small>
                  <time>
                    {conversation.updated_at
                      ? new Date(conversation.updated_at).toLocaleDateString()
                      : ''}
                  </time>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="support-chat-thread">
          {activeConversation ? (
            <>
              <header>
                <div className="support-chat-avatar">
                  {(activeConversation.shop_name || 'A').charAt(0)}
                </div>
                <div>
                  <h2>{activeConversation.shop_name || 'Approved ABUAD shop'}</h2>
                  <p>
                    <ShieldCheck size={13} />
                    Approved vendor · administrator support
                  </p>
                </div>
              </header>
              <div className="support-chat-messages">
                {messages.length === 0 ? (
                  <p className="support-chat-empty">No messages yet.</p>
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
            <div className="support-chat-empty">
              <MessageCircleMore size={28} />
              <p>Select a vendor conversation.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default VendorChats;
