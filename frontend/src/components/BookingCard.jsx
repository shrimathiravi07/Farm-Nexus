import { CalendarDays, IndianRupee, StatusIcon } from './IconLibrary';

export default function BookingCard({ appointment, onCancel, actions }) {
  const slot = appointment.slot;
  return (
    <article className="appt-card">
      <div>
        <strong>{appointment.equipment?.name || 'Equipment'}</strong>
        <small><CalendarDays size={14} /> {slot ? new Date(slot.date).toLocaleDateString() : '—'} | {slot?.startTime || ''} - {slot?.endTime || ''}</small>
        <small><IndianRupee size={14} /> {appointment.totalCost?.toFixed?.(2) || '—'}</small>
      </div>
      <div className="booking-actions">
        <span className={`badge badge-${appointment.status === 'confirmed' ? 'success' : appointment.status === 'cancelled' ? 'danger' : 'warning'}`}>
          <StatusIcon status={appointment.status} /> {appointment.status?.toUpperCase()}
        </span>
        {onCancel && appointment.status !== 'cancelled' && (
          <button type="button" className="btn btn-outline" onClick={() => onCancel(appointment._id)}>Cancel</button>
        )}
        {actions}
      </div>
    </article>
  );
}
