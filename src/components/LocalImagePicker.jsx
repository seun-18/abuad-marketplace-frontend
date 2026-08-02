import { ImagePlus, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const DEFAULT_MAX_MB = 5;

/**
 * Device-first image picker with live preview.
 * Controlled: pass file + onChange(file|null).
 * Uncontrolled: manage file internally and call onChange.
 */
const LocalImagePicker = ({
  label = 'Photo from your device',
  hint = 'JPG, PNG, WebP or GIF · max 5 MB',
  accept = DEFAULT_ACCEPT,
  maxMb = DEFAULT_MAX_MB,
  file = undefined,
  previewUrl: controlledPreview,
  onChange,
  required = false,
  className = '',
  tall = false,
}) => {
  const inputId = useId();
  const inputRef = useRef(null);
  const [internalFile, setInternalFile] = useState(null);
  const [internalPreview, setInternalPreview] = useState('');
  const [localError, setLocalError] = useState('');

  const isControlled = file !== undefined;
  const activeFile = isControlled ? file : internalFile;
  const preview =
    controlledPreview !== undefined
      ? controlledPreview
      : internalPreview;

  useEffect(() => {
    return () => {
      if (internalPreview) URL.revokeObjectURL(internalPreview);
    };
  }, [internalPreview]);

  const clear = () => {
    setLocalError('');
    if (!isControlled) {
      if (internalPreview) URL.revokeObjectURL(internalPreview);
      setInternalFile(null);
      setInternalPreview('');
    }
    if (inputRef.current) inputRef.current.value = '';
    onChange?.(null);
  };

  const handlePick = (event) => {
    const next = event.target.files?.[0] || null;
    if (!next) {
      clear();
      return;
    }
    if (!next.type.startsWith('image/')) {
      setLocalError('Choose an image file.');
      event.target.value = '';
      return;
    }
    if (next.size > maxMb * 1024 * 1024) {
      setLocalError(`Image must be ${maxMb} MB or smaller.`);
      event.target.value = '';
      return;
    }
    setLocalError('');
    if (!isControlled) {
      if (internalPreview) URL.revokeObjectURL(internalPreview);
      setInternalFile(next);
      setInternalPreview(URL.createObjectURL(next));
    }
    onChange?.(next);
  };

  return (
    <div className={`lip ${className}`}>
      {label ? (
        <label htmlFor={inputId} className="lip-label">
          {label}
          {required ? <span className="lip-req">*</span> : null}
        </label>
      ) : null}

      <div className={`lip-drop ${tall ? 'lip-drop-tall' : ''} ${preview ? 'has-preview' : ''}`}>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handlePick}
          className="lip-input"
          required={required && !activeFile}
        />

        {preview ? (
          <>
            <img src={preview} alt="" className="lip-preview" />
            <div className="lip-preview-veil">
              <span>Change photo</span>
            </div>
            <button
              type="button"
              className="lip-clear"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                clear();
              }}
              aria-label="Remove photo"
            >
              <X size={14} strokeWidth={2.4} />
            </button>
          </>
        ) : (
          <div className="lip-empty">
            <span className="lip-icon">
              <ImagePlus size={22} strokeWidth={1.6} />
            </span>
            <p>Choose from gallery or files</p>
            <small>{hint}</small>
          </div>
        )}
      </div>

      {activeFile ? (
        <p className="lip-meta">
          {activeFile.name}
          <span>
            {(activeFile.size / 1024).toFixed(0)} KB
          </span>
        </p>
      ) : null}
      {localError ? <p className="lip-error">{localError}</p> : null}
    </div>
  );
};

export default LocalImagePicker;
