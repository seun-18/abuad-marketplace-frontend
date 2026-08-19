import { Check, MapPin } from 'lucide-react';
import { CAMPUS_HALLS } from '../../config/campus';

const CampusSelector = ({ open, selected, onSelect, onClose }) => {
  if (!open) return null;

  return (
    <div className="campus-overlay" onClick={onClose} role="presentation">
      <div
        className="campus-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Select drop-off location"
      >
        <div className="campus-sheet-handle" />
        <h2>Select Drop-off Location</h2>
        {CAMPUS_HALLS.map((hall) => (
          <button
            key={hall.id}
            type="button"
            className="campus-option"
            onClick={() => {
              onSelect(hall);
              onClose();
            }}
          >
            <MapPin size={18} aria-hidden="true" />
            <span>{hall.name}</span>
            {selected?.id === hall.id && (
              <Check size={18} className="check" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CampusSelector;
