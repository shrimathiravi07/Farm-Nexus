import { CalendarDays, Trash2 } from './IconLibrary';

export default function SlotCard({ slot, selected = false, onSelect, onDelete }) {
  return (
    <article className={`slot-card${selected ? ' selected' : ''}`}>
      <button type="button" className="slot-select" onClick={() => onSelect?.(slot)}>
        <strong>{slot.equipment?.name || 'Equipment'}</strong>
        <span><CalendarDays size={14} /> {new Date(slot.date).toLocaleDateString()} | {slot.startTime} - {slot.endTime}</span>
      </button>
      <span className={`badge ${slot.isBooked ? 'badge-success' : 'badge-warning'}`}>
        {slot.isBooked ? 'Booked' : 'Available'}
      </span>
      {onDelete && !slot.isBooked && (
        <button type="button" className="btn btn-outline" onClick={() => onDelete(slot._id)} aria-label="Delete slot"><Trash2 size={14} /> Delete</button>
      )}
    </article>
  );
}
