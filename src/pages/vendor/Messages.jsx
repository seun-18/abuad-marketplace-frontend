import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useChatSocket } from '../../hooks/useChatSocket';
import { useE2EChat } from '../../hooks/useE2EChat';
import MessageBubble from '../../components/chat/MessageBubble';
import ChatComposer from '../../components/chat/ChatComposer';
import ChatShell from '../../components/chat/ChatShell';
import { getErrorMessage } from '../../utils/errors';

const VendorMessages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('customers'); // customers | admin
  const [customerConversations, setCustomerConversations] = useState([]);
  const [adminConversations, setAdminConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const activeIdRef = useRef(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { e2eError, encryptOutgoing, decryptIncoming, decryptHistory } = useE2EChat(user);

  const handleSocketMessage = useCallback(
    (msg) => {
      if (msg.type === 'message' && msg.data) {
        const convId = Number(msg.conversation_id || msg.data.conversation_id);
        if (convId === Number(activeIdRef.current)) {
          (async () => {
            const plain = await decryptIncoming(convId, msg.data.message);
            const row = {
              ...msg.data,
              message: plain,
              message_type: msg.data.message_type || 'text',
            };
            setMessages((prev) => {
              if (prev.some((m) => m.id === row.id)) return prev;
              const localIdx = prev.findIndex(
                (m) =>
                  String(m.id).startsWith('local-') && Number(m.sender_id) === Number(row.sender_id)
              );
              if (localIdx >= 0) {
                const copy = [...prev];
                copy[localIdx] = row;
                return copy;
              }
              return [...prev, row];
            });
          })();
        }
        const bump = (list) =>
          list
            .map((c) =>
              Number(c.id) === convId
                ? { ...c, updated_at: msg.data.created_at || new Date().toISOString() }
                : c
            )
            .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
        setCustomerConversations((prev) => bump(prev));
        setAdminConversations((prev) => bump(prev));
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
    enabled: !!user && user.role === 'vendor',
  });

  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [user, navigate]);

  useEffect(() => {
    activeIdRef.current = activeConversation?.id ?? null;
    if (activeConversation?.id) joinConversation(activeConversation.id);
  }, [activeConversation, joinConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/chat/list_conversations.php');
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to load conversations.');
      }
      const list = Array.isArray(response.data.data) ? response.data.data : [];
      const customerChats = list.filter((c) => c.type === 'customer_vendor');
      const adminChats = list.filter((c) => c.type === 'vendor_admin');
      setCustomerConversations(customerChats);
      setAdminConversations(adminChats);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to load chats.');
    } finally {
      setLoading(false);
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

  const selectConversation = (conv) => {
    setActiveConversation(conv);
    setMessages([]);
    if (conv?.id) fetchMessages(conv.id);
  };

  const deleteConversation = async (conversation) => {
    if (!window.confirm('Delete this conversation and its messages?')) return;
    try {
      await api.delete('/chat/delete_conversation.php', {
        data: { conversation_id: conversation.id },
      });
      setCustomerConversations((current) => current.filter((item) => item.id !== conversation.id));
      setAdminConversations((current) => current.filter((item) => item.id !== conversation.id));
      if (activeConversation?.id === conversation.id) {
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete this conversation.'));
    }
  };

  const startAdminChat = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/chat/start.php', { type: 'vendor_admin' });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to start the admin chat.');
      }
      const convId = response.data.data?.conversation_id || response.data.data?.id;
      await fetchConversations();
      if (convId) {
        setTab('admin');
        selectConversation({ id: convId, type: 'vendor_admin' });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to start the admin chat.');
    } finally {
      setLoading(false);
    }
  };

  const deliverPayload = async (conversationId, payload) => {
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
    fetchConversations();
  };

  const handleSendText = async (plaintext) => {
    if (!activeConversation?.id) return;
    let body = plaintext;
    try {
      body = await encryptOutgoing(activeConversation.id, plaintext);
    } catch {
      // REST delivery still works when a conversation encryption key is unavailable.
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
      setError(getErrorMessage(err, 'Failed to send the message.'));
    }
  };

  const handleSendMedia = async (mediaPayload) => {
    if (!activeConversation?.id) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        sender_id: user.id,
        ...mediaPayload,
        created_at: new Date().toISOString(),
      },
    ]);
    try {
      await deliverPayload(activeConversation.id, mediaPayload);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send media.'));
    }
  };

  const list = tab === 'customers' ? customerConversations : adminConversations;

  const titleFor = (conv) => {
    if (conv.type === 'vendor_admin') {
      return (
        [conv.admin_first_name, conv.admin_last_name].filter(Boolean).join(' ') ||
        conv.admin_email ||
        'Admin Support'
      );
    }
    return (
      [conv.customer_first_name, conv.customer_last_name].filter(Boolean).join(' ') ||
      conv.customer_email ||
      `Customer #${conv.customer_id}`
    );
  };

  const activeTitle = activeConversation ? titleFor(activeConversation) : '';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setTab('customers');
            setActiveConversation(null);
            setMessages([]);
          }}
          className={`chat-tab-btn ${tab === 'customers' ? 'active' : ''}`}
        >
          Customers ({customerConversations.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('admin');
            setActiveConversation(null);
            setMessages([]);
          }}
          className={`chat-tab-btn ${tab === 'admin' ? 'active' : ''}`}
        >
          Admin Support ({adminConversations.length})
        </button>
        {tab === 'admin' && (
          <button
            type="button"
            onClick={startAdminChat}
            disabled={loading}
            className="chat-start-btn chat-tab-start"
          >
            Chat with Admin
          </button>
        )}
      </div>

      <ChatShell
        title="Messages"
        subtitle="Chat with customers and the platform administrator."
        kicker="Seller inbox"
        hasActive={Boolean(activeConversation)}
        onBack={() => {
          setActiveConversation(null);
          setMessages([]);
        }}
        activeTitle={activeTitle}
        activeSubtitle={
          activeConversation?.type === 'vendor_admin'
            ? 'Platform administrator'
            : 'Customer · encrypted chat'
        }
        activeAvatarLetter={activeTitle}
        alert={error || lastError || e2eError || null}
        listHeader={
          <div className="customer-chat-sidebar-head luxury-chat-sidebar-head">
            <h2>{tab === 'customers' ? 'Customers' : 'Admin'}</h2>
          </div>
        }
        listContent={
          list.length === 0 ? (
            <p className="chat-empty-hint">
              {tab === 'customers'
                ? 'No customer messages yet. New chats appear when a customer messages you.'
                : 'No admin chat yet. Use “Chat with Admin” to start one.'}
            </p>
          ) : (
            list.map((conv) => {
              const title = titleFor(conv);
              return (
                <div
                  key={conv.id}
                  className={`customer-chat-conversation luxury-chat-item ${
                    activeConversation?.id === conv.id ? 'active' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="chat-conversation-open"
                    onClick={() => selectConversation(conv)}
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
                  <button
                    type="button"
                    className="chat-delete-btn"
                    onClick={() => deleteConversation(conv)}
                    aria-label={`Delete chat with ${title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })
          )
        }
        messagesContent={
          messages.length === 0 ? (
            <p className="chat-empty-hint">No messages yet.</p>
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
            <span>Pick a customer or open admin support.</span>
          </>
        }
      />
    </div>
  );
};

export default VendorMessages;
