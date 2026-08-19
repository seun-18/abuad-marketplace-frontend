import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatPreview = () => (
  <div className="chat-preview-card">
    <div className="chat-preview-label">
      <MessageCircle size={14} aria-hidden="true" />
      Recent Chats
    </div>
    <div className="chat-preview-row">
      <div className="chat-preview-avatar">
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          C
        </div>
      </div>
      <div className="chat-preview-meta">
        <div className="chat-preview-meta-top">
          <strong>Chioma · Tech Hub</strong>
          <span>2m ago</span>
        </div>
        <p>&ldquo;Is the iPhone charger still available?&rdquo;</p>
      </div>
    </div>
    <div className="quick-replies">
      <button type="button">Yes, still available</button>
      <button type="button">Meet at Motion Ground?</button>
      <button type="button">Price is negotiable</button>
    </div>
    <Link
      to="/customer/chat"
      className="text-link"
      style={{ marginTop: '0.75rem', display: 'inline-flex', fontSize: '0.8rem' }}
    >
      Open messages →
    </Link>
  </div>
);

export default ChatPreview;
