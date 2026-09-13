import { Link } from 'react-router-dom';
import { CategoryIcon } from './IconLibrary';

export default function EquipmentCard({ equipment, actionLabel = 'View details', onAction }) {
  return (
    <article className="card equip-card">
      <div className="equipment-icon"><CategoryIcon category={equipment.category} /></div>
      <h3>{equipment.name}</h3>
      <p>{equipment.description || 'No description'}</p>
      <p className="price">₹{equipment.pricePerHour}/hr</p>
      <small>By: {equipment.provider?.name || 'Authorized Provider'}</small>
      {onAction ? (
        <button type="button" className="btn btn-outline" onClick={() => onAction(equipment)}>{actionLabel}</button>
      ) : (
        <Link className="btn btn-primary" to={`/farmer/equipment/${equipment._id}`}>{actionLabel}</Link>
      )}
    </article>
  );
}
