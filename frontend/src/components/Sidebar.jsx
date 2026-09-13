import { NavLink } from 'react-router-dom';
import { CalendarDays, Cog, LayoutDashboard, Package, Settings } from './IconLibrary';

const linksByRole = {
  farmer: [
    ['/farmer', 'Dashboard'],
    ['/farmer/equipment', 'Equipment'],
    ['/farmer/appointments', 'Appointments'],
  ],
  provider: [
    ['/provider', 'Dashboard'],
    ['/provider/equipment', 'Equipment'],
    ['/provider/slots', 'Slots'],
    ['/provider/bookings', 'Bookings'],
  ],
  admin: [
    ['/admin', 'Dashboard'],
    ['/admin/users', 'Users'],
    ['/admin/equipment', 'Equipment'],
    ['/admin/appointments', 'Appointments'],
    ['/admin/analytics', 'Analytics'],
  ],
};

const linkIcons = { Dashboard: LayoutDashboard, Equipment: Package, Appointments: CalendarDays, Slots: CalendarDays, Bookings: CalendarDays, 'Analytics': Settings, Users: Cog };

export default function Sidebar({ role }) {
  return (
    <aside className="sidebar">
      <nav aria-label={`${role} navigation`}>
        {(linksByRole[role] || []).map(([to, label]) => (
          <NavLink key={to} to={to} end={to === `/${role}`}>
            {(() => { const Icon = linkIcons[label] || Package; return <><Icon size={16} /> {label}</>; })()}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
