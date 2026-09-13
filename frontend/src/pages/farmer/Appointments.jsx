import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BookingCard from '../../components/BookingCard';
import { cancelBooking, getMyAppointments } from '../../services/bookingService';
import { ArrowUpRight, CalendarDays } from '../../components/IconLibrary';

export default function Appointments() {
	const location = useLocation(); const [appointments, setAppointments] = useState([]); const [state, setState] = useState({ loading: true, error: '', success: location.state?.success || '' });
	const load = () => { setState((current) => ({ ...current, loading: true, error: '' })); getMyAppointments().then((data) => { setAppointments(data); setState((current) => ({ ...current, loading: false })); }).catch(() => setState((current) => ({ ...current, loading: false, error: 'Unable to load your appointments. Please try again.' }))); };
	useEffect(() => { load(); }, []);
	async function handleCancel(id) { if (!window.confirm('Are you sure you want to cancel this appointment?')) return; try { await cancelBooking(id); load(); } catch { setState((current) => ({ ...current, error: 'Unable to cancel this appointment. Please try again.' })); } }
	  return <><div className="page-heading"><div><span className="section-kicker">Your schedule</span><h1>My Appointments</h1><p>Track your equipment bookings and upcoming farm work.</p></div><Link to="/farmer/equipment" className="btn btn-primary">Book equipment <ArrowUpRight size={16} /></Link></div>{state.success && <div className="success-banner"><CalendarDays size={16} /> {state.success}</div>}{state.loading ? <div className="loading-state page-state">Loading appointments...</div> : state.error ? <div className="error-state page-state">{state.error}</div> : appointments.length === 0 ? <div className="empty-state page-state"><CalendarDays size={34} /><strong>You don't have any appointments yet.</strong><span>Find the equipment you need for your next job.</span><Link to="/farmer/equipment" className="btn btn-primary">Browse Equipment</Link></div> : <div className="appointment-list">{appointments.map((appointment) => <BookingCard key={appointment._id} appointment={appointment} onCancel={handleCancel} />)}</div>}</>;
}
