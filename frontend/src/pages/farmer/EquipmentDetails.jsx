import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getEquipmentById } from '../../services/equipmentService';
import { ArrowUpRight, Droplets, FlaskConical, Sprout, Tractor, Wind } from '../../components/IconLibrary';

export default function EquipmentDetails() {
	const { equipmentId } = useParams(); const navigate = useNavigate();
	const [equipment, setEquipment] = useState(null); const [state, setState] = useState({ loading: true, error: '' });
	useEffect(() => { getEquipmentById(equipmentId).then((data) => { setEquipment(data); setState({ loading: false, error: '' }); }).catch(() => setState({ loading: false, error: 'Unable to load this equipment.' })); }, [equipmentId]);
	if (state.loading) return <div className="loading-state page-state">Loading equipment details...</div>;
	if (state.error) return <div className="error-state page-state">{state.error}<Link to="/farmer/equipment" className="btn btn-outline">Back to equipment</Link></div>;
	const CategoryIcon = equipment.category === 'Tractor' ? Tractor : equipment.category === 'Drone' ? Wind : equipment.category === 'Irrigation' ? Droplets : equipment.category === 'Harvesting' ? Sprout : FlaskConical;
	return <section className="details-layout"><div className="details-art"><CategoryIcon size={110} strokeWidth={1.3} /></div><div className="details-content"><Link to="/farmer/equipment" className="back-link">Back to equipment</Link><span className="section-kicker">{equipment.category}</span><h1>{equipment.name}</h1><p className="details-description">{equipment.description || 'No description available.'}</p><div className="detail-meta"><div><small>Hourly rate</small><strong>₹{equipment.pricePerHour}/hr</strong></div><div><small>Provider</small><strong>{equipment.provider?.name || 'Authorized Provider'}</strong></div></div><button type="button" className="btn btn-primary btn-large" onClick={() => navigate(`/farmer/booking/${equipment._id}`)}>Book Now <ArrowUpRight size={16} /></button></div></section>;
}
