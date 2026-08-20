import { ImagePlus, Mic, Send, Square } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';

/**
 * Message composer for text, photo/video attachments, and voice notes.
 */
const ChatComposer = ({ conversationId, disabled, onSendText, onSendMediaMessage }) => {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(0);
  const [recordSecs, setRecordSecs] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      try {
        mediaRecorderRef.current?.stream?.getTracks?.().forEach((t) => t.stop());
      } catch {
        /* ignore */
      }
    };
  }, []);

  const submitText = async (e) => {
    e.preventDefault();
    if (!text.trim() || disabled || uploading) return;
    const value = text.trim();
    setText('');
    await onSendText(value);
  };

  const uploadAndSend = async (file, type, durationSec = null) => {
    if (!conversationId) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('conversation_id', String(conversationId));
      fd.append('type', type);
      fd.append('file', file);
      if (durationSec != null) fd.append('duration_sec', String(durationSec));

      const res = await api.post('/chat/upload_media.php', fd);
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Upload failed.');
      }
      const media = res.data.data;
      await onSendMediaMessage({
        message_type: type,
        media_url: media.url || media.path,
        media_mime: media.mime,
        media_duration_sec: media.duration_sec ?? durationSec,
        media_size: media.size,
        message: type === 'image' ? '' : '',
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Could not send the media file.');
    } finally {
      setUploading(false);
    }
  };

  const onPickMedia = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.type.startsWith('image/')) {
      await uploadAndSend(file, 'image');
      return;
    }
    if (file.type.startsWith('video/')) {
      if (file.size > 25 * 1024 * 1024) {
        setError('Video must be under 25MB.');
        return;
      }
      await uploadAndSend(file, 'video');
      return;
    }
    setError('Please choose an image or video file.');
  };

  const startRecording = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Voice notes are not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
        setRecordSecs(0);
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (blob.size < 500) {
          setError('Recording is too short. Please try again.');
          return;
        }
        const file = new File([blob], `voice-${Date.now()}.webm`, {
          type: blob.type || 'audio/webm',
        });
        await uploadAndSend(file, 'voice', duration);
      };
      mediaRecorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setRecording(true);
      setRecordSecs(0);
      timerRef.current = setInterval(() => {
        setRecordSecs(Math.round((Date.now() - startedAtRef.current) / 1000));
      }, 250);
      recorder.start(100);
    } catch (err) {
      console.error(err);
      setError('Microphone access was denied. Please allow microphone permission and try again.');
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch {
      setRecording(false);
    }
  };

  return (
    <div className="chat-composer">
      {error && <p className="chat-composer-error">{error}</p>}
      {recording && (
        <div className="chat-recording">
          <span />
          Recording… {recordSecs}s. Click stop to send.
        </div>
      )}
      <form onSubmit={submitText}>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/*"
          className="chat-file-input"
          onChange={onPickMedia}
        />
        <button
          type="button"
          title="Attach a photo or video"
          disabled={disabled || uploading || !conversationId || recording}
          onClick={() => fileRef.current?.click()}
          className="chat-composer-icon"
        >
          <ImagePlus size={18} />
        </button>
        <div className="chat-composer-input">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Message"
            disabled={disabled || uploading || recording}
            placeholder="Write a message..."
          />
        </div>
        {text.trim() ? (
          <button type="submit" disabled={disabled || uploading} className="chat-composer-send">
            <Send size={17} />
            Send
          </button>
        ) : (
          <button
            type="button"
            title={recording ? 'Stop and send voice note' : 'Record a voice note'}
            disabled={disabled || uploading || !conversationId}
            onClick={recording ? stopRecording : startRecording}
            className={`chat-composer-record ${recording ? 'recording' : ''}`}
          >
            {recording ? <Square size={16} fill="currentColor" /> : <Mic size={18} />}
          </button>
        )}
      </form>
      {uploading && <p className="chat-uploading">Uploading…</p>}
    </div>
  );
};

export default ChatComposer;
