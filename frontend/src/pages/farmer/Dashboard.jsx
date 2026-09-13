import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMyAppointments } from '../../services/bookingService';
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Droplets, FlaskConical, Sprout, Tractor, Wind } from '../../components/IconLibrary';

const serviceLinks = [
	['Tractor', Tractor, 'Tractor Booking', 'Rent tractors for tilling and plowing.'],
	['Irrigation', Droplets, 'Irrigation Slot', 'Book your canal water share time.'],
	['Drone', Wind, 'Drone Spraying', 'Pesticide spray service reservation.'],
	['Harvesting', Sprout, 'Harvest Machine', 'Combine harvester sharing and slots.'],
	['Lab', FlaskConical, 'Soil Testing', 'Lab appointment and sample submission.'],
];

function statusClass(status) {
	return status === 'confirmed' ? 'badge-success' : status === 'cancelled' ? 'badge-danger' : 'badge-warning';
}

export default function Dashboard() {
	const [appointments, setAppointments] = useState([]);
	const [state, setState] = useState({ loading: true, error: '' });

	useEffect(() => {
		getMyAppointments().then((data) => {
			setAppointments(data);
			setState({ loading: false, error: '' });
		}).catch(() => setState({ loading: false, error: 'Unable to load your recent activity. Please try again.' }));
	}, []);

	return <>
		<div className="dashboard-hero reveal-up"><div><span className="section-kicker">Your farm workspace</span><h1>Farmer Dashboard</h1><p>Keep your next season moving with the right resources.</p></div><div className="dashboard-hero-art"><Sprout size={54} /><span>Plan. Book. Grow.</span></div></div>
		<div className="stats-grid dashboard-stats">
			<div className="stat-card reveal-up"><span className="stat-icon"><CalendarDays /></span><h3>Total Bookings</h3><p>{state.loading ? '—' : appointments.length}</p></div>
			<div className="stat-card reveal-up"><span className="stat-icon amber"><Clock3 /></span><h3>Pending Approval</h3><p>{state.loading ? '—' : appointments.filter((a) => a.status === 'pending').length}</p></div>
			<div className="stat-card reveal-up"><span className="stat-icon blue"><CheckCircle2 /></span><h3>Active Rentals</h3><p>{state.loading ? '—' : appointments.filter((a) => a.status === 'confirmed').length}</p></div>
		</div>
		<section className="dashboard-section"><div className="section-title-row"><div><span className="section-kicker">Resources for your farm</span><h2>Agriculture Services</h2></div><Link to="/farmer/equipment" className="text-link">View all equipment <ArrowUpRight size={14} /></Link></div><div className="use-case-grid">{serviceLinks.map(([category, Icon, title, description]) => <Link key={category} to={`/farmer/equipment?category=${category}`} className="use-case-card"><span className="icon"><Icon size={25} /></span><h4>{title}</h4><p>{description}</p></Link>)}</div></section>
		<section className="dashboard-section recent-section"><div className="section-title-row"><div><span className="section-kicker">Stay up to date</span><h2>Recent Activity</h2></div><Link to="/farmer/appointments" className="text-link">View all bookings <ArrowUpRight size={14} /></Link></div><div className="table-container">{state.loading ? <div className="loading-state">Loading your recent bookings...</div> : state.error ? <div className="error-state">{state.error}</div> : appointments.length === 0 ? <div className="empty-state"><CalendarDays size={34} /><strong>No bookings found.</strong><span>Ready to find the right equipment?</span><Link to="/farmer/equipment" className="btn btn-primary">Browse equipment</Link></div> : <table><thead><tr><th>Equipment</th><th>Date</th><th>Time</th><th>Status</th></tr></thead><tbody>{appointments.slice(0, 5).map((appointment) => <tr key={appointment._id}><td><strong>{appointment.equipment?.name || 'Equipment'}</strong></td><td>{appointment.slot?.date ? new Date(appointment.slot.date).toLocaleDateString() : '—'}</td><td>{appointment.slot?.startTime || '—'} - {appointment.slot?.endTime || '—'}</td><td><span className={`badge ${statusClass(appointment.status)}`}>{appointment.status?.toUpperCase()}</span></td></tr>)}</tbody></table>}</div></section>
	</>;
}
