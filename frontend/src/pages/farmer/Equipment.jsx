import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import EquipmentCard from '../../components/EquipmentCard';
import { getEquipment } from '../../services/equipmentService';

export default function Equipment() {
	const [searchParams] = useSearchParams();
	const category = searchParams.get('category');
	const [equipment, setEquipment] = useState([]);
	const [state, setState] = useState({ loading: true, error: '' });
	useEffect(() => { setState({ loading: true, error: '' }); getEquipment().then((data) => { setEquipment(category ? data.filter((item) => item.category?.toLowerCase() === category.toLowerCase()) : data); setState({ loading: false, error: '' }); }).catch(() => setState({ loading: false, error: 'Unable to load equipment. Please try again.' })); }, [category]);
	return <><div className="page-heading"><div><span className="section-kicker">Find the right resource</span><h1>{category ? `Book ${category} Service` : 'Available Equipment'}</h1><p>Find the right tools for your farm and book an available time slot.</p></div><Link to="/farmer/appointments" className="btn btn-outline">My bookings</Link></div><div className="filter-row"><span>{category ? `${equipment.length} ${category} services` : `${equipment.length} resources available`}</span>{category && <Link to="/farmer/equipment">View all services</Link>}</div>{state.loading ? <div className="loading-state page-state">Looking for available gear...</div> : state.error ? <div className="error-state page-state">{state.error}</div> : equipment.length === 0 ? <div className="empty-state page-state"><strong>No {category || ''} services available at the moment.</strong><Link to="/farmer/equipment" className="btn btn-outline">View all services</Link></div> : <div className="equipment-grid">{equipment.map((item) => <EquipmentCard key={item._id} equipment={item} actionLabel="View details" />)}</div>}</>;
}
