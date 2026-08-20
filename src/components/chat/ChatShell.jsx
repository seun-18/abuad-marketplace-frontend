import { ArrowLeft } from 'lucide-react';

/**
 * Mobile-first chat layout:
 * - Phone: either conversation list OR full-screen thread (with back)
 * - Tablet/desktop: list + thread side by side
 */
const ChatShell = ({
  title = 'Messages',
  subtitle = '',
  kicker = 'Messages',
  statusPills = null,
  alert = null,
  listHeader = null,
  listContent = null,
  activeTitle = '',
  activeSubtitle = 'Conversation',
  activeAvatarLetter = '?',
  hasActive = false,
  onBack,
  messagesContent = null,
  composer = null,
  emptyThread = (
    <>
      <p>Select a conversation</p>
      <span>Choose a chat from the list to start messaging.</span>
    </>
  ),
}) => {
  const threadOpen = Boolean(hasActive);

  return (
    <div className={`luxury-chat-page ${threadOpen ? 'thread-open' : ''}`}>
      <div className={`chat-page-header ${threadOpen ? 'chat-page-header-hidden-mobile' : ''}`}>
        <div>
          {kicker ? <p className="chat-page-kicker">{kicker}</p> : null}
          <h1>{title}</h1>
          {subtitle ? <p className="chat-page-sub">{subtitle}</p> : null}
        </div>
        {statusPills ? <div className="chat-status-pills">{statusPills}</div> : null}
      </div>

      {alert ? <div className="chat-alert">{alert}</div> : null}

      <div className="customer-chat-shell luxury-chat-shell">
        <aside
          className={`customer-chat-sidebar luxury-chat-sidebar ${
            threadOpen ? 'chat-pane-hidden-mobile' : 'chat-pane-visible-mobile'
          }`}
        >
          {listHeader}
          <div className="luxury-chat-list">{listContent}</div>
        </aside>

        <section
          className={`customer-chat-thread luxury-chat-thread ${
            threadOpen ? 'chat-pane-visible-mobile' : 'chat-pane-hidden-mobile'
          }`}
          aria-label={threadOpen ? activeTitle : 'Message thread'}
        >
          {hasActive ? (
            <>
              <header className="customer-chat-thread-head luxury-chat-thread-head">
                <button
                  type="button"
                  className="chat-back-btn"
                  onClick={onBack}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={18} aria-hidden="true" />
                </button>
                <div className="chat-avatar chat-avatar-lg" aria-hidden="true">
                  {(activeAvatarLetter || '?').toString().charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3>{activeTitle}</h3>
                  <p>{activeSubtitle}</p>
                </div>
              </header>
              <div className="luxury-chat-messages">{messagesContent}</div>
              {composer}
            </>
          ) : (
            <div className="luxury-chat-placeholder">{emptyThread}</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ChatShell;
