import { Mic, Play } from 'lucide-react';
import React from 'react';
import { resolveImageUrl } from '../../utils/imageUrl';

const formatTime = (value) => {
  try {
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const formatDuration = (sec) => {
  const s = Math.max(0, Number(sec) || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
};

/**
 * Message bubble: text, image, video, and voice.
 */
const MessageBubble = ({ msg, isMine }) => {
  const type = msg.message_type || 'text';
  const media = msg.media_url ? resolveImageUrl(msg.media_url) : null;

  return (
    <div className={`chat-message-row ${isMine ? 'mine' : 'theirs'}`}>
      <div className={`chat-message-bubble ${isMine ? 'mine' : 'theirs'}`}>
        {type === 'image' && media && (
          <a href={media} target="_blank" rel="noopener noreferrer" className="chat-media-image">
            <img
              src={media}
              alt="Shared photo"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </a>
        )}

        {type === 'video' && media && (
          <div className="chat-media-video">
            <video controls playsInline preload="metadata" poster="">
              <source src={media} type={msg.media_mime || 'video/mp4'} />
            </video>
          </div>
        )}

        {type === 'voice' && media && (
          <div className="chat-voice-note">
            <span>
              <Mic size={14} />
              Voice note
            </span>
            <audio controls preload="metadata">
              <source src={media} type={msg.media_mime || 'audio/webm'} />
            </audio>
            {msg.media_duration_sec ? (
              <small>{formatDuration(msg.media_duration_sec)}</small>
            ) : null}
          </div>
        )}

        {msg.message ? <p className="chat-message-copy">{msg.message}</p> : null}

        <time>{formatTime(msg.created_at)}</time>
      </div>
    </div>
  );
};

export default MessageBubble;
