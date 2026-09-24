import { Headphones, MessageCircleMore, Plus, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import ChatComposer from '../../components/chat/ChatComposer';
import MessageBubble from '../../components/chat/MessageBubble';
import { useAuth } from '../../context/AuthContext';

const VendorSupportChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

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
      const supportChats = list.filter((conversation) => conversation.type === 'vendor_admin');
      setConversations(supportChats);
      if (supportChats.length > 0) {
        setActiveConversation((current) => current || supportChats[0]);
        await fetchMessages(supportChats[0].id);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load administrator support.');
    } finally {
      setLoading(false);
    }
  }, [fetchMessages]);

  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [fetchConversations, navigate, user]);

  useEffect(() => {
    if (!activeConversation?.id) return undefined;
    const interval = window.setInterval(() => fetchMessages(activeConversation.id), 5000);
    return () => window.clearInterval(interval);
  }, [activeConversation, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewChat = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/chat/start.php', { type: 'vendor_admin' });
      const conversationId = response.data.data?.conversation_id || response.data.data?.id;
      await fetchConversations();
      if (conversationId) {
        const conversation = {
          id: conversationId,
          type: 'vendor_admin',
          updated_at: new Date().toISOString(),
        };
        setActiveConversation(conversation);
        await fetchMessages(conversationId);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not start administrator support.');
    } finally {
      setLoading(false);
    }
  };

  const deliverMessage = async (payload) => {
    if (!activeConversation?.id) return;
    try {
      const response = await api.post('/chat/send_message.php', {
        conversation_id: activeConversation.id,
        ...payload,
      });
      const saved = response.data.data?.message;
      if (saved) {
        setMessages((current) =>
          current.some((item) => Number(item.id) === Number(saved.id))
            ? current
            : [...current, saved]
        );
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not send this message.');
      throw requestError;
    }
  };

  return (
    <div className="premium-dashboard-page">
      <div className="dashboard-title-row">
        <div>
          <p className="dashboard-kicker">Administrator support</p>
          <h1>Get help without leaving your store.</h1>
          <p>
            Send text, screenshots, product photos, or a voice note to the ABUAD marketplace team.
          </p>
        </div>
        <button type="button" className="dashboard-action-button" onClick={startNewChat}>
          <Plus size={16} />
          Start support chat
        </button>
      </div>

      {error && <div className="dashboard-alert dashboard-alert-error">{error}</div>}

      <div className="support-chat-shell">
        <aside className="support-chat-list">
          <div className="support-chat-list-heading">
            <div>
              <Headphones size={18} />
              <span>Support history</span>
            </div>
          </div>
          <div className="support-chat-conversations">
            {conversations.length === 0 ? (
              <p>{loading ? 'Loading support...' : 'No support conversation yet.'}</p>
            ) : (
              conversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  className={
                    Number(activeConversation?.id) === Number(conversation.id) ? 'active' : ''
                  }
                  onClick={() => {
                    setActiveConversation(conversation);
                    fetchMessages(conversation.id);
                  }}
                >
                  <span>ABUAD Market Place support</span>
                  <small>Platform administrator</small>
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
                <div className="support-chat-avatar">A</div>
                <div>
                  <h2>ABUAD Market Place support</h2>
                  <p>
                    <ShieldCheck size={13} />
                    Platform administrator · media enabled
                  </p>
                </div>
              </header>
              <div className="support-chat-messages">
                {messages.length === 0 ? (
                  <p className="support-chat-empty">Send your first support message.</p>
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
              <p>Start a support chat to message an administrator.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default VendorSupportChat;
