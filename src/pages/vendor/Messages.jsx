import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useChatSocket } from '../../hooks/useChatSocket';
import { useE2EChat } from '../../hooks/useE2EChat';
import MessageBubble from '../../components/chat/MessageBubble';
import ChatComposer from '../../components/chat/ChatComposer';

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
  const { e2eReady, encryptOutgoing, decryptIncoming, decryptHistory } = useE2EChat(user);

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
                  String(m.id).startsWith('local-') &&
                  Number(m.sender_id) === Number(row.sender_id)
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
      alert(err.response?.data?.message || 'Failed to send the message.');
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
      alert(err.response?.data?.message || 'Failed to send media.');
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

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">
            Chat with customers and the platform administrator.
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${e2eReady ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
          >
            {e2eReady ? 'E2E on' : 'E2E…'}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${connected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
          >
            {connected ? 'Live' : 'Connecting…'}
          </span>
        </div>
        {tab === 'admin' && (
          <button
            type="button"
            onClick={startAdminChat}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Chat with Admin
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setTab('customers');
            setActiveConversation(null);
            setMessages([]);
          }}
          className={`px-4 py-2 text-sm font-semibold rounded-lg ${
            tab === 'customers'
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-gray-200 text-gray-700'
          }`}
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
          className={`px-4 py-2 text-sm font-semibold rounded-lg ${
            tab === 'admin'
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          Admin Support ({adminConversations.length})
        </button>
      </div>

      <div className="flex flex-1 min-h-[60vh] bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
          {list.length === 0 ? (
            <p className="p-4 text-center text-gray-500 text-sm">
              {tab === 'customers'
                ? 'No customer messages yet. New chats appear when a customer messages you.'
                : 'No admin chat yet. Click “Chat with Admin” to start one.'}
            </p>
          ) : (
            <div className="p-2 space-y-2">
              {list.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`p-3 rounded-lg cursor-pointer ${
                    activeConversation?.id === conv.id
                      ? 'bg-indigo-100 border-l-4 border-indigo-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <p className="font-medium text-sm text-gray-900">{titleFor(conv)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {conv.updated_at ? new Date(conv.updated_at).toLocaleString() : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col bg-white">
          {activeConversation ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{titleFor(activeConversation)}</h3>
                <p className="text-sm text-gray-500">
                  {activeConversation.type === 'vendor_admin'
                    ? 'Platform administrator'
                    : 'Customer'}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-10">No messages yet.</p>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} isMine={msg.sender_id === user.id} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <ChatComposer
                conversationId={activeConversation.id}
                onSendText={handleSendText}
                onSendMediaMessage={handleSendMedia}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorMessages;
